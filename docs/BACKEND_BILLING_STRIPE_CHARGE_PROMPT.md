# Backend: Billing – Admin Charge Client (Stripe)

This document describes how the **Billing** feature is set up on the frontend and what the backend must implement so an **admin can charge a client** using Stripe.

---

## 1. Frontend flow (current)

- **Page:** Billing → “Charge Customer Payment Method”
- **Who:** Admin only (frontend restricts to `user.role === 'admin'`).
- **Customer list:** Clients who have **signed a contract** (`hasSignedContract === true`), from **GET /clients** (no Stripe-based customer list).
- **Action:** Admin selects a **client** (by app client UUID), enters **amount (USD)** and **description**, then submits.
- **API call:** Frontend sends the **app client ID** (from your clients table), not a Stripe customer ID.

So the backend receives your **internal client identifier** and must resolve it to Stripe and perform the charge.

---

## 2. Stripe structure expected

- **Stripe Customer:** One per client who can be charged (created when they add a payment method or when you onboard them for billing).
- **Link in your DB:** For each chargeable client, store their **Stripe Customer ID** (e.g. `cus_xxx`) in your database, keyed by your **client/user id** (the same id returned by GET /clients and used in the Billing UI).
- **Default payment method:** Stripe Customer should have a **default payment method** (card) so “charge default” works without the frontend sending a payment method id.

Typical mapping:

- **Your app:** `clients.id` (UUID) or `users.id` → one row/record per chargeable client.
- **Stripe:** That record has `stripe_customer_id` (e.g. `cus_xxxx`) and optionally `default_payment_method_id` (or you rely on Stripe’s “default” on the Customer).

When a client adds a card (e.g. in a portal or onboarding), your backend should:

1. Create a Stripe Customer if none exists (and save `stripe_customer_id` on the client/user).
2. Attach the payment method to that Customer and set it as default (or use Stripe’s “invoice_settings.default_payment_method” / “default_source” as appropriate for your Stripe API version).

---

## 3. Charge endpoint (required for Billing)

The frontend calls:

- **Method:** `POST`
- **Path:** `/api/payments/customers/:customerId/charge`
- **Body (JSON):**
  - `amount` (number) – **amount in cents**
  - `description` (string) – e.g. “Consultation”, “Service fee”
- **Headers:** Same as rest of app (e.g. `Content-Type: application/json`; auth via **cookie** or **Bearer**).

Here, **`:customerId`** is your **internal client/user id** (UUID from GET /clients), **not** the Stripe customer id.

**Backend must:**

1. **Auth:** Restrict to **admin** (and optionally other allowed roles). Reject with 401/403 if not allowed.
2. **Resolve Stripe customer:** From `customerId` (your client id), load the client and their `stripe_customer_id`. If missing or invalid, return a clear error (e.g. 400: “Client has no payment method on file” or “Stripe customer not set up”).
3. **Charge:** Use Stripe’s API to charge that customer’s **default payment method**:
   - **Stripe Payment Intents API (recommended):** Create a PaymentIntent with `customer`, `amount` (in cents), `currency: 'usd'`, `payment_method` optional if you use default, `confirm: true`, and `description` or `metadata` from the request body.
   - Or **Stripe Charges API (legacy):** Create a Charge with `customer`, `amount`, `currency: 'usd'`, and optionally `source` (default payment method).
4. **Response (success):** Return JSON the frontend can handle, e.g.  
   `{ success: true, data: { id, amount, status, description, created } }`  
   so the UI can show success (and optionally the payment id).
5. **Response (error):** Return `{ success: false, error: "message" }` with appropriate HTTP status (4xx/5xx). Frontend shows `error` to the user.

**Idempotency (optional but recommended):** For retries, use Stripe’s idempotency key (e.g. from a header like `Idempotency-Key`) when creating the PaymentIntent or Charge.

---

## 4. Optional: Recording the charge in your system

For reconciliation and history, after a successful Stripe charge you may:

- Insert a row into your **payments** (or similar) table: client id, amount, currency, Stripe payment/charge id, description, status, timestamp.  
That way the **Reconciliation** and **Payments** features can show this charge.

---

## 5. Card management endpoints (same `customerId`)

The frontend also defines (for storing/listing/updating cards and setting default). These use the **same** `customerId` (your app client id):

| Method | Path | Purpose |
|--------|------|--------|
| POST | `/api/payments/customers/:customerId/cards` | Store a new card (body: `{ cardToken }`) |
| GET | `/api/payments/customers/:customerId/cards` | List stored cards |
| PUT | `/api/payments/customers/:customerId/cards/:paymentMethodId` | Update card (body: `{ cardToken }`) |
| DELETE | `/api/payments/customers/:customerId/cards/:cardId` | Delete a card |
| PUT | `/api/payments/customers/:customerId/cards/:cardId/default` | Set default payment method |

For **Billing “charge client”**, only the **charge** endpoint above is required. The card endpoints are needed if clients (or admins) manage cards in your app; in that case, the same “resolve `customerId` → Stripe customer” logic applies.

---

## 6. Summary checklist (backend)

- [ ] **Stripe:** Create/link Stripe Customer per chargeable client; store `stripe_customer_id` (and ensure default payment method is set when they add a card).
- [ ] **Auth:** Ensure all payment endpoints require admin (or your allowed roles) and use the same session/Bearer auth as the rest of the app.
- [ ] **Charge:** Implement **POST /api/payments/customers/:customerId/charge** with body `{ amount, description }`; resolve `customerId` to Stripe customer and charge default payment method; return `{ success, data }` or `{ success: false, error }`.
- [ ] **Errors:** Return clear messages when client has no Stripe customer or no default payment method.
- [ ] **(Optional)** Persist each successful charge in your payments table for reconciliation.
- [ ] **(Optional)** Implement card CRUD + default if you want in-app card management using the same `customerId` semantics.

Once the charge endpoint is implemented and Stripe is wired (customer creation + default payment method), the existing Billing UI will work for admin-to-client charging.
