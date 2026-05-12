# Backend: request submission — test prompt (copy to backend repo / ticket)

Use this as a handoff for whoever owns `POST /requestService/requestSubmission` and persistence.

## Endpoint and transport

- **Method / path:** `POST {BACKEND_ORIGIN}/requestService/requestSubmission`
- **Headers:** `Content-Type: application/json`
- **Body:** JSON object — same shape the Sokana CRM **request form** sends after client-side validation (Zod schema in frontend repo: `src/features/request/useRequestForm.ts` → `fullSchema`).

## Payload the frontend actually sends

The SPA builds the POST body as:

1. **Spread** of all validated form fields (`RequestFormValues`).
2. **`number_of_babies`:** normalized to a **number** (e.g. `Singleton` → `1`, `Twins` → `2`, …). If the form already sent a number, it is left as-is.
3. **`service_needed`:** **not** collected as its own step anymore. It is set on submit to:
   - `services_interested.join(', ')` when at least one service is selected, **else**
   - trimmed `service_support_details` (non-empty string required on the form for the first step).

So the backend should accept and persist:

- **`age`:** integer **1–120** (frontend sends a whole number; may arrive as number or numeric string before any backend coercion).
- **`provider_type`:** non-empty string when pregnancy step is completed (e.g. `Midwife`, `OB`, `Family Doctor`, `Other`).
- **`service_needed`:** summary string as above — treat as the canonical “what services” line for CRM/search if you still map legacy `service_needed`.
- **Insurance / secondary:** when `has_secondary_insurance` is `true`, require `secondary_insurance_provider`, `secondary_insurance_member_id`, and `secondary_policy_number` (aligned with frontend `superRefine`).

Reference sample that matches the current form (also used by **“Fill with test data”** on `/request`):  
`frontend-crm/src/features/request/dummyTestLead.ts` → `DUMMY_TEST_LEAD`.

## What we need from backend tests

1. **Unit tests**  
   - Parse/validate the inbound DTO (required fields, enums, `age` bounds, conditional insurance + secondary rules).  
   - Assert `number_of_babies` and `service_needed` mapping if you normalize or denormalize into DB columns.

2. **Mock / handler tests**  
   - Mock the persistence layer and assert the handler returns `200` + expected JSON for a body built like `DUMMY_TEST_LEAD` + submit-time transforms (`number_of_babies` int, `service_needed` set).  
   - Assert `400` / validation errors for missing secondary fields when `has_secondary_insurance: true`, missing commercial insurance fields when `payment_method` requires them, etc.

3. **Integration / DB test (recommended)**  
   - One test that inserts a row (or calls the real service) with a payload derived from `DUMMY_TEST_LEAD` and verifies all columns you care about (including `age`, `provider_type`, `service_needed`, primary + secondary insurance fields).  
   - Clean up fixture rows in `afterEach` / transaction rollback as you do elsewhere.

## Manual cross-check with the SPA

1. Run CRM frontend with `VITE_APP_BACKEND_URL` pointing at your environment.  
2. Open `/request`, click **Fill with test data**, advance through steps (or submit from the last step).  
3. Confirm the stored lead/request matches the POST body (network tab) and DB row.

If anything in the DTO does not match your DB schema, document the mismatch and either adjust the backend mapper or coordinate a small frontend change — do **not** silently drop `age`, `provider_type`, or `service_needed`.
