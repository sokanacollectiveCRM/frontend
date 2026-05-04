# Backend: Payment collection rules & `payment_authorization_status`

Use this document to **verify** the API already supports the payment-collection model, or to **implement** anything missing. The **Sokana CRM frontend** (this repo) sends and reads the fields below.

## 0. Operational workflow (current product intent)

- Clients **do not** enter full card/bank details inside the CRM or client portal. Typical flow: the organization sends a **payment authorization form** (paper, PDF, DocuSign, etc.); the client returns it; **staff** confirm receipt and readiness to charge.
- **`payment_authorization_status` = `on_file`** should mean: the business has what it needs to charge (e.g. **signed authorization on record** and/or a **token** from your payment processor if you later key it in). The **server** (or a staff action) should set this—**not** a claim from the client’s browser alone.
- **`authorized_at`**: set when authorization is first considered complete (e.g. staff timestamp, or processor webhook time if you tokenize from the form data offline).

## 1. Quick verification checklist (backend team)

Answer **yes** to each; if any is **no**, implement per section 2.

| # | Check |
|---|--------|
| 1 | Client record (or billing sub-record) persists **`payment_method`** with values aligned to: `Medicaid`, `Private Insurance`, `Commercial Insurance`, `Self-Pay` (accept normalised variants: `self_pay`, `self pay`, etc., but store canonical values if your stack prefers). |
| 2 | Client record persists **`payment_authorization_status`** using **one** of: `not_required`, `required`, `on_file`, `failed` (snake_case in JSON). |
| 3 | Client record persists **`authorized_at`** (ISO 8601) when payment authorization is complete (e.g. form received and recorded, and/or token created in PSP); **null** when N/A. |
| 4 | **`GET /api/clients/:id`** (or equivalent detail) returns `payment_method`, `payment_authorization_status`, `authorized_at` when the caller is allowed to see billing (staff). |
| 4b | **`GET /api/clients`** (or the staff list endpoint the CRM uses) includes the same three fields on each row when non-PHI list enrichment is allowed, so the **Clients** table can show the **Card** column without opening each profile. If the list cannot include billing fields, the column will show **—** until profile/detail is loaded. |
| 5 | **`GET /api/clients/me/billing`** and **`PUT /api/clients/me/billing`** accept and return the same billing fields (portal). |
| 6 | **`PUT /api/clients/:id/billing`** (staff) accepts the same fields and updates the same persistence as portal billing. |
| 7 | **Server is source of truth** for `on_file` / `failed` / `authorized_at`: update when staff record a **payment authorization form** and/or when a **PSP** reports a stored token or a failed attempt. Do not trust the client browser alone if it only sends `required`. |
| 8 | **Medicaid path**: when `payment_method` is Medicaid, `payment_authorization_status` should end up as **`not_required`**; no card on file is required. |
| 9 | **Non-Medicaid paths**: for Private Insurance, Commercial Insurance, or Self-Pay, **payment authorization on file** is required for billing readiness (form and/or processor rules); status **`required`** until then, **`on_file`** when satisfied, **`failed`** if an authorization attempt fails. |

## 2. Canonical contract (JSON field names)

These names match the frontend DTOs and payloads:

| Field | Type | Notes |
|-------|------|--------|
| `payment_method` | string | One of the four options above (canonical labels preferred). |
| `payment_authorization_status` | string | `not_required` \| `required` \| `on_file` \| `failed` |
| `authorized_at` | string \| null | ISO 8601 when authorization is considered complete (staff/process); omit or null if N/A. |

**Frontend behaviour today**

- On **`PUT .../billing`**, the SPA typically sends `payment_authorization_status` as **`not_required`** (Medicaid) or **`required`** until your API reflects otherwise. It does **not** prove a form was received.
- The backend **must own** transitions to **`on_file`** / **`failed`** and **`authorized_at`** based on staff workflows and/or PSP events.

## 3. Business rules (server-side enforcement)

Mirror these rules when validating writes and when recomputing status:

1. **Medicaid**  
   - Do not require credit/debit/bank details for “billing readiness.”  
   - Set / keep `payment_authorization_status` = **`not_required`**.  
   - Clear or ignore card-on-file requirement gates for operational workflows that depend on this flag.

2. **Private Insurance & Commercial Insurance**  
   - Require **payment authorization on file** for copays, deductibles, and self-pay balances (how your org defines that—typically signed authorization and/or PSP token after intake).  
   - Insurance demographic fields (provider, member id, policy, etc.) apply per product rules; insurance card documents may be separate.

3. **Self-Pay**  
   - Require completed **payment authorization** for billing readiness (same as above—not dependent on client typing card data into the CRM).

4. **Switching methods**  
   - If `payment_method` changes **from** non-Medicaid **to** Medicaid: clear authorization-required gates; set status **`not_required`**.  
   - If switching **to** insurance/self-pay from Medicaid: set status to **`required`** until authorization is on file (unless already present).

## 4. Endpoints the frontend calls

Paths may be prefixed by your gateway; align with existing conventions:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/clients/me/billing` | Portal loads billing |
| `PUT` | `/api/clients/me/billing` | Portal saves billing (includes `payment_authorization_status` in body) |
| `GET` | `/api/clients/:id` with detail | Staff loads client (expects billing-related fields on client or nested billing) |
| `PUT` | `/api/clients/:id/billing` | Staff saves billing. The **Record payment authorization on file** control sends `payment_authorization_status: "on_file"`, `authorized_at` (ISO), plus current billing fields — backend should **merge**; do not wipe unrelated billing columns. |

Fallbacks exist in the app (`PUT` generic client profile); prefer dedicated billing routes for PHI/billing consistency.

## 5. Security / PCI

- Never persist raw PAN, CVV, or full bank account numbers from unsecured channels.  
- If staff enter card data into your PSP after receiving an authorization form, persist only **tokens / customer ids / masked descriptors** returned by QuickBooks, Stripe, or your PSP.

## 6. Reference in frontend source

- Rules and enums: `src/lib/paymentRules.ts`  
- Mapper: `src/api/mappers/client.mapper.ts` (`payment_authorization_status` → `paymentAuthorizationStatus`)  
- DTO: `src/api/dto/client.dto.ts`

---

**Summary:** If verification passes for section 1, no backend work is required beyond keeping behaviour aligned when card-on-file state changes. If any row fails, implement persistence, API exposure, and server-side derivation of `payment_authorization_status` and `authorized_at` as described above.
