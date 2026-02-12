# Backend reconciliation endpoint – spec & prompt

Use this document to implement a **reconciliation endpoint** on the backend that compares the **invoices** table and the **payments** table, matches by amount, and produces suggested links so the client can attach **customer name** and **payment status** from invoices to payments (with confirmation).

---

## 1. Business context

- **Invoices table** has: customer/client name, amount, payment status (e.g. pending, paid), and **dates** (e.g. `created_at`, `due_date`, `date`).
- **Payments table** has: amount and other payment fields (e.g. `created_at`), but often **does not** have customer name, a status aligned with the invoice, or a clear link to invoice dates.
- Goal: **reconcile** the two tables by **exact amount match**. When a payment amount matches an invoice amount, we can **suggest**:
  - **Customer name** (from invoice) → to be associated with that payment
  - **Status** (from invoice: e.g. pending/paid) → to be associated with that payment
  - **Dates** (from invoice: e.g. invoice date, due date) → surfaced in the response and optionally suggested for linking to the payment (e.g. for display, reporting, or “paid on” / “for invoice dated”)
- These are **suggestions only**. The client must **confirm** before any data is written to the payments table. The endpoint should **not** update payments; it only returns reconciliation results for review and later confirmation.

- **Totals**: The endpoint should run calculations for **total pending** and **total paid** (by amount) so the client can see at a glance how much is pending vs paid. These totals can be computed from invoices, from payments, or both (see response shape below).

---

## 2. Matching rules

1. **Amount match**  
   Compare invoice amount with payment amount. Treat as a match when they are **equal when rounded to 2 decimal places** (to avoid float issues).  
   - Invoice amount: use `paid_total_amount` or `total_amount` (whatever your schema exposes).  
   - Payment amount: use the payment’s `amount` field.

2. **One invoice can match many payments** (e.g. one invoice paid in two installments → two payments with same total, or one payment matching one invoice).

3. **One payment can match one or more invoices** only in the sense that the same payment might be the best match for a given invoice; your response shape can be “per invoice” or “per payment” as long as the frontend can show suggested links.

4. **Optional refinement**  
   If both tables have a customer/client name, you can distinguish:
   - **amount_only**: same amount, customer name on payment missing or different from invoice.
   - **amount_and_customer**: same amount and same customer name (stronger suggestion).  
   This is optional; the main requirement is **exact amount match** first.

---

## 3. Endpoint contract

Implement a single endpoint that runs reconciliation on the server and returns the results.

### Suggested route and method

- **GET** `/api/financial/reconciliation`  
  or  
- **GET** `/api/reconciliation`  
  (or whatever fits your API structure.)

Optional query params (if you want filtering or limits):

- `limit` – max number of invoices (or matches) to consider (e.g. 500 or 1000).
- `invoice_status` – optional filter on invoice status (e.g. only “paid” or “pending”).
- `date_from` / `date_to` – optional date range for invoices or payments.

### Response envelope

Use the same pattern as the rest of your API (e.g. list endpoints). Include a **summary** with **total pending** and **total paid** (amounts and optionally counts):

```json
{
  "success": true,
  "data": [ ... ],
  "summary": {
    "total_pending_amount": 0,
    "total_paid_amount": 0,
    "total_pending_count": 0,
    "total_paid_count": 0
  }
}
```

- **`data`** = array of **reconciliation rows** (see below). No automatic update of the payments table; this is read-only reconciliation for display and later confirmation.

- **`summary`** = totals for the current dataset (respecting the same filters as `data`, e.g. `date_from` / `date_to`, `limit`):
  - **`total_pending_amount`** (number): Sum of amounts where status is pending. Compute from **invoices** (sum of `total_amount` or `paid_total_amount` for invoices with status = pending), and/or from **payments** (sum of `amount` for payments with status = pending) — document which source you use; ideally both so the frontend can show invoice-side and payment-side totals.
  - **`total_paid_amount`** (number): Sum of amounts where status is paid/succeeded. Same logic: from invoices (status = paid) and/or from payments (status = succeeded/completed/paid).
  - **`total_pending_count`** (number, optional): Count of invoices (or payments) in pending status.
  - **`total_paid_count`** (number, optional): Count of invoices (or payments) in paid status.

If you expose both invoice-based and payment-based totals, use names like `invoice_total_pending_amount`, `invoice_total_paid_amount`, `payment_total_pending_amount`, `payment_total_paid_amount` in `summary`. Round all amounts to 2 decimal places.

### Reconciliation row shape (per invoice)

Each element of `data` represents one **invoice** and its **matched payment(s)**. Align with the frontend type `ReconciliationRow` where possible (snake_case is fine; frontend can map).

| Field | Type | Description |
|-------|------|-------------|
| `invoice_id` | string | Invoice primary key. |
| `invoice_number` | string | Human-readable invoice number. |
| `invoice_customer` | string | Customer/client name from the invoice. |
| `invoice_amount` | number | Amount used for matching (2 decimals). |
| `invoice_status` | string | Invoice payment status (e.g. `pending`, `paid`) – **suggested for payment**. |
| `invoice_created_at` | string \| null | Invoice creation date (ISO 8601); surface for display and to link to payments. |
| `invoice_due_date` | string \| null | Invoice due date (ISO 8601) if present; can be suggested for payment (e.g. “for invoice due …”). |
| `match_type` | string | `"amount_only"` or `"amount_and_customer"` (if you implement customer comparison). |
| `payment_ids` | string[] | IDs of payments that match this invoice by amount. |
| `payment_customers` | string[] | Current customer name on each payment (if any); same order as `payment_ids`. |
| `payment_amounts` | number[] | Amount of each matched payment; same order as `payment_ids`. |
| `payment_created_dates` | (string \| null)[] | `created_at` (or equivalent) for each matched payment; same order as `payment_ids`. Enables comparing invoice dates to payment dates. |

**Invoice status** indicates the **suggested status** (from the invoice) that could be applied to the payment after client confirmation.

**Dates** from the invoice (`invoice_created_at`, `invoice_due_date`) are surfaced so the frontend can show them and optionally connect them to payments (e.g. “Invoice due 2024-01-15” next to a matched payment). `payment_created_dates` lets the client compare when the invoice was issued/due vs when the payment was recorded.

Example row:

```json
{
  "invoice_id": "inv-123",
  "invoice_number": "INV-2024-001",
  "invoice_customer": "Jane Doe",
  "invoice_amount": 500.00,
  "invoice_status": "paid",
  "invoice_created_at": "2024-01-02T00:00:00Z",
  "invoice_due_date": "2024-01-15",
  "match_type": "amount_and_customer",
  "payment_ids": ["pay-456"],
  "payment_customers": ["Jane Doe"],
  "payment_amounts": [500.00],
  "payment_created_dates": ["2024-01-14T10:30:00Z"]
}
```

---

## 4. Implementation steps (backend)

1. **Read data**  
   From your DB, load the relevant **invoices** and **payments** with: amount, customer/client name, invoice status, and **dates** (invoices: `created_at`, `due_date` or `date`; payments: `created_at` or equivalent). Apply any filters (limit, date range, status) you expose via query params.

2. **Normalize amounts**  
   Use a single helper: round to 2 decimals for comparison (e.g. `round(amount * 100) / 100` or your DB equivalent).

3. **Match by amount**  
   For each invoice:
   - Compute invoice amount from `paid_total_amount` or `total_amount`.
   - Find all payments whose amount (rounded) equals that value.
   - Optionally set `match_type` to `amount_and_customer` when the payment already has the same customer name as the invoice; otherwise `amount_only`.

4. **Build response**  
   For each invoice that has at least one matching payment, add one reconciliation row to `data` with:
   - Invoice fields: `invoice_id`, `invoice_number`, `invoice_customer`, `invoice_amount`, `invoice_status`, **`invoice_created_at`**, **`invoice_due_date`**.
   - `match_type`.
   - Arrays: `payment_ids`, `payment_customers`, `payment_amounts`, **`payment_created_dates`** (parallel arrays, same length; use payment `created_at` or equivalent for each matched payment).

5. **Compute summary totals**  
   Run calculations over the same filtered set of invoices and payments:
   - **Total pending**: Sum of amounts where status is pending (invoices: status = pending; payments: status = pending or equivalent). Optionally count of pending records.
   - **Total paid**: Sum of amounts where status is paid/succeeded (invoices: status = paid; payments: status = succeeded/completed/paid). Optionally count of paid records.
   - Normalize status strings (e.g. case-insensitive, map "completed" → paid). Round all summed amounts to 2 decimals.
   - Populate `response.summary` with `total_pending_amount`, `total_paid_amount`, and optionally `total_pending_count`, `total_paid_count`. If providing both invoice and payment totals, use distinct keys (e.g. `invoice_total_pending_amount`, `payment_total_paid_amount`).

6. **Do not update**  
   This endpoint must **not** write to the payments table. It only returns suggested links and computed totals. A separate endpoint or action (e.g. “Confirm reconciliation” or PATCH payment) can later apply customer name, status, and optionally date references to payments after the client confirms.

---

## 5. Optional: CSV export from backend

If you prefer to generate the report on the server:

- Add **GET** `/api/financial/reconciliation/csv` (or `?format=csv` on the same route).
- Run the same reconciliation logic and return the response as CSV (same columns as in the table above, including `invoice_status`, **`invoice_created_at`**, **`invoice_due_date`**, and **`payment_created_dates`** e.g. as a semicolon-separated list per row). Optionally add a footer row or a small summary block with **total_pending_amount** and **total_paid_amount** so the downloaded report includes the same totals as the API summary.
- Frontend can then do `window.open(...)` or fetch and download the file without building the CSV on the client.

---

## 6. Summary

- **Endpoint**: e.g. **GET /api/financial/reconciliation** (read-only).
- **Input**: optional `limit`, `invoice_status`, `date_from`, `date_to`.
- **Logic**: exact amount match (2 decimals) between invoices and payments; optionally distinguish `amount_only` vs `amount_and_customer`.
- **Output**: `{ success: true, data: ReconciliationRow[], summary: { total_pending_amount, total_paid_amount, total_pending_count?, total_paid_count? } }` with **invoice_status** and **invoice dates** (`invoice_created_at`, `invoice_due_date`); **payment_created_dates**; and **summary** with **total pending** and **total paid** (amounts and optionally counts) so the frontend can show at-a-glance totals. All suggestions require client confirmation before any update.

This keeps reconciliation and data access on the backend while leaving the final “confirm and write” step to a separate flow after the client reviews the suggested links.
