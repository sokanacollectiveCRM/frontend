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

---

## CRM `fullSchema` vs `phi_clients` persistence (audit notes)

**Source of truth for “what was submitted”:** the JSON POST body from the SPA (`RequestForm.tsx` spreads all validated `RequestFormValues` plus `number_of_babies` int + `service_needed` string). If a field is required by Zod and passes submit, it **is on the wire** unless something strips it before insert.

**Where gaps usually are:** the backend intake path (e.g. `RequestFormRepository.saveData` → `INSERT` into `public.phi_clients`) only binding a subset of keys. Below is a concise checklist from a **live audit** (`test.lead@example.com` / Fill with test data): CRM + POST had the data; **Cloud SQL columns stayed null or unset** where the insert list omitted them.

### Confirmed present on audited row (examples)

- Identity / contact: `firstname` → `first_name`, `lastname` → `last_name`, `email`, `phone_number` → `phone` (names per your DB).
- Address line: `address` → `address_line1` only (see gaps).
- Health: `health_history`, `allergies`, `health_notes`.
- Pregnancy (partial): `due_date`, `number_of_babies`, `pregnancy_number`.
- Referral: `referral_source`, `referral_source_other` when applicable.
- Payment: `payment_method` normalized (e.g. `Private/Commercial Insurance` → `Commercial Insurance`); primary + secondary billing columns when that path is used.
- Submit-derived: `service_needed` string (from `services_interested` join + fallback to support text).
- Demographics (optional step): fields you already map (`race_ethnicity`, `client_age_range`, etc.) as sent.

### Gaps to fix in backend mapper (and/or add columns + migration)

| JSON key (POST body) | CRM (Zod) | Typical issue on `phi_clients` |
|----------------------|-----------|----------------------------------|
| `city`, `state`, `zip_code` | Required step 2 | Often **null** if insert only maps `address` → `address_line1` |
| `birth_location` | Required step 6 | **Not persisted** if not in insert list / no column |
| `provider_type` | Required step 6 | **Not persisted** if not in insert list / no column |
| `pronouns`, `preferred_contact_method`, `age` | Required step 1 | Often **missing** on row if not mapped (`date_of_birth` may stay null; CRM collects **age**, not DOB, unless you derive one) |
| `pets` | Required step 2 | **Not persisted** if not mapped |
| `home_adults_count`, `home_youth_count` | Required step 2 | **Not persisted** if not mapped — see `docs/BACKEND_REQUEST_FORM_HOME_PEOPLE_COUNT_PROMPT.md` |
| `home_type` (array), `home_type_other` | Optional step 2 (Other conditional) | See `docs/BACKEND_REQUEST_FORM_HOME_TYPE_PROMPT.md` |
| `services_interested` (array), `service_support_details` | Required step 0 | Only **`service_needed`** stored today; array + long text **lost** unless you add columns (JSON/text) or a child table |

**Conditional (already in POST when applicable):** `pronouns_other` when pronouns = Other; `referral_source_other` when referral = Other; insurance block + secondary trio; sliding-scale fields when that payment path is selected.

### Suggested backend follow-up

1. Extend `saveData` (or equivalent) **INSERT/UPDATE** bindings for every CRM-meaningful key you want on `phi_clients`, or document intentional omission.
2. Add a **DB integration test**: POST body shaped like `DUMMY_TEST_LEAD` → assert non-null `city`, `state`, `zip_code`, `birth_location`, `provider_type`, `pronouns`, `preferred_contact_method`, `age` (or mapped columns), `pets`, `home_adults_count`, `home_youth_count`, and optionally raw `services_interested` / `service_support_details` if you add storage.
3. If `phi_clients` lacks columns, ship a **migration** first, then mapper.

### One-off audit query template (Cloud SQL)

Replace email and compare to your latest intake contract:

```sql
SELECT
  id,
  email,
  city,
  state,
  zip_code,
  address_line1,
  due_date,
  number_of_babies,
  pregnancy_number,
  referral_source,
  payment_method,
  service_needed
  -- add: birth_location, provider_type, pronouns, preferred_contact_method, age, pets,
  --      home_adults_count, home_youth_count, home_type, home_type_other, … when columns exist
FROM public.phi_clients
WHERE email = 'test.lead@example.com'
ORDER BY requested_at DESC NULLS LAST, updated_at DESC NULLS LAST
LIMIT 5;
```

Re-run after changing `saveData` to confirm the row matches the POST body from DevTools → Network → `requestSubmission`.
