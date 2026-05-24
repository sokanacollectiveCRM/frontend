# Backend verification prompt — birth location name + intake payment options (May 2026)

> **Status (May 2026):** Verified on backend `main` — birth place validation + persistence, four intake payment labels, Medicaid rejected on public submit, staff/billing paths unchanged. See backend `requestSubmissionDto.test.ts`, `requestSubmissionFlow.test.ts`, `clientBillingEndpoint.test.ts`.

**Copy this entire document into the backend repo ticket, PR description, or agent prompt.**

---

## Context (frontend already shipped / shipping)

The public request form (`POST /requestService/requestSubmission`) was updated:

1. **Medicaid is hidden** on the intake payment step (not removed from staff CRM or billing).
2. **`birth_hospital` is required** whenever `birth_location` is set. The field holds the **specific place name** — hospital name, birth center name/location, or home birth location (often an address). It is **not** hospital-only despite the legacy field name.

No new JSON keys. Same endpoint and transport as documented in the frontend repo’s general submission handoff (`docs/BACKEND_REQUEST_SUBMISSION_TEST_PROMPT.md`).

---

## Your task

Verify and fix (if needed) **validation**, **persistence**, and **tests** for:

| Concern | JSON keys | What “good” looks like |
|--------|-----------|-------------------------|
| Birth type + place | `birth_location`, `birth_hospital` | Both non-empty on every new intake; both stored on the client/lead row |
| Intake payment enum | `payment_method` | Accept the **four** intake values below; **reject or ignore** `Medicaid` on **public submission only** |
| Staff / admin paths | `payment_method` | Still accept `Medicaid` and existing legacy values (`Commercial Insurance`, `Self-Pay`, etc.) |

---

## Endpoint

- **Method / path:** `POST {BACKEND_ORIGIN}/requestService/requestSubmission`
- **Headers:** `Content-Type: application/json`
- **Body:** Full validated form object (see frontend `useRequestForm.ts` → `fullSchema`)

Submit-time transforms from the SPA (unchanged):

- `number_of_babies`: string label → integer (`Singleton` → `1`, `Twins` → `2`, …)
- `service_needed`: `services_interested.join(', ')` or trimmed `service_support_details`

---

## `birth_location` + `birth_hospital` rules (mirror frontend)

### Allowed `birth_location` values

`Hospital` | `Home` | `Birth Center` | `Other`

### Validation (add if missing)

When `birth_location` is non-empty after trim:

- **`birth_hospital` is required** (non-empty string after trim).
- Do **not** validate `birth_hospital` as “must look like a hospital” — for `Home` it may be an address.

Optional message parity (not required on API):

| `birth_location` | Suggested 400 message if `birth_hospital` missing |
|------------------|--------------------------------------------------|
| `Home` | Please enter your home birth location (e.g. home address). |
| `Hospital` | Please enter the hospital name. |
| `Birth Center` | Please enter the birth center name or location. |
| `Other` | Please enter your birth location name. |

### Persistence (audit required)

Confirm the submission mapper / `saveData` (or equivalent) writes **both** fields to the DB (column names may differ, e.g. `birth_hospital` → `birth_hospital` or legacy `hospital`).

Known gap from frontend audit (fix if still true):

- `birth_location` was **not persisted** when missing from INSERT column list.
- `birth_hospital` may be in the same situation even though the form always sent it.

**Action:** Add columns + migration if needed, then map both keys on insert/update.

### Sample POST bodies for integration tests

**Hospital (minimal pregnancy block):**

```json
{
  "due_date": "2027-06-01",
  "birth_location": "Hospital",
  "birth_hospital": "Mercy Hospital Chicago",
  "number_of_babies": 1,
  "provider_type": "Midwife",
  "pregnancy_number": 1
}
```

**Home:**

```json
{
  "due_date": "2027-06-01",
  "birth_location": "Home",
  "birth_hospital": "123 Oak St, Springfield, IL 62704",
  "number_of_babies": 1,
  "provider_type": "OB",
  "pregnancy_number": 1
}
```

**Birth Center:**

```json
{
  "due_date": "2027-06-01",
  "birth_location": "Birth Center",
  "birth_hospital": "Sunrise Birth Center",
  "number_of_babies": 1,
  "provider_type": "Midwife",
  "pregnancy_number": 1
}
```

**Should return 400** (missing place name):

```json
{
  "due_date": "2027-06-01",
  "birth_location": "Hospital",
  "birth_hospital": "",
  "number_of_babies": 1,
  "provider_type": "Midwife",
  "pregnancy_number": 1
}
```

Full happy-path fixture: use the same shape as frontend `DUMMY_TEST_LEAD` (`frontend-crm/src/features/request/dummyTestLead.ts`) — includes `birth_location: "Hospital"` and `birth_hospital: "Springfield General Hospital"`.

---

## `payment_method` rules (intake vs staff)

### Intake request form — allowed values (Medicaid hidden)

Only these four should be accepted on **`POST /requestService/requestSubmission`**:

1. `Private/Commercial Insurance`
2. `Self-Pay, Sliding Scale Available`
3. `I am unable to pay / Full Support Option`
4. `Not sure / Need help figuring this out`

**On public submission:**

- **`Medicaid` → reject** with `400` (recommended) or document explicit ignore — frontend no longer offers it; do not rely on UI alone.
- Keep existing conditional insurance validation when method is `Private/Commercial Insurance` (policy holder, member ID, plan type, etc.) — see frontend `superRefine` in `useRequestForm.ts`.

### Staff / client profile / billing — unchanged

- Continue to accept and persist **`Medicaid`** and legacy labels (`Commercial Insurance`, `Private Insurance`, `Self-Pay`, `Other`, …).
- Medicaid billing rule unchanged: `payment_authorization_status` → `not_required` when `payment_method` is Medicaid (see `docs/BACKEND_PAYMENT_COLLECTION_RULES_PROMPT.md` in frontend repo).

### Sample POST — Medicaid on intake should fail

```json
{
  "payment_method": "Medicaid",
  "insurance_policy_holder_name": "Test User",
  "insurance_provider": "State Medicaid",
  "insurance_member_id": "MCD-1",
  "insurance_plan_type": "Medicaid"
}
```

(Include rest of required intake fields or use your DTO validator — expect **400**, not silent accept.)

---

## Tests to add or update

### Unit / DTO tests

- [ ] `birth_location` set + empty `birth_hospital` → validation error
- [ ] Each of `Home` / `Hospital` / `Birth Center` / `Other` with non-empty `birth_hospital` → pass
- [ ] `payment_method: "Medicaid"` on **requestSubmission** DTO → fail
- [ ] Each of the four allowed intake payment methods with required insurance fields when applicable → pass

### Handler / integration tests

- [ ] POST full payload (like `DUMMY_TEST_LEAD` + submit transforms) → `200`
- [ ] Assert DB row has **non-null** `birth_location` and `birth_hospital` (use actual column names)
- [ ] POST with `birth_location` but missing `birth_hospital` → `400`, no partial row (or rollback)

### Regression

- [ ] Staff `PUT` (or equivalent) with `payment_method: "Medicaid"` still works
- [ ] Existing rows with Medicaid are unchanged

---

## Manual verification (5 minutes)

1. Deploy backend + frontend locally.
2. Submit `/request` with DevTools → Network → `requestSubmission`.
3. Confirm request body includes non-empty `birth_hospital` and `payment_method` is one of the four (not Medicaid).
4. Query the inserted lead:

```sql
SELECT
  id,
  email,
  birth_location,
  birth_hospital,
  payment_method,
  due_date,
  provider_type,
  requested_at
FROM public.phi_clients
WHERE email = '<submitted-email>'
ORDER BY requested_at DESC NULLS LAST, updated_at DESC NULLS LAST
LIMIT 5;
```

5. Repeat with **Home** birth location and an address in `birth_hospital`; confirm both columns populated.

---

## Files to inspect on the backend (typical names)

Search the backend repo for:

- `requestSubmission`, `requestService`, `saveData`, `phi_clients`
- DTO/schema for intake POST body
- Payment method normalization (`Private/Commercial Insurance` → `Commercial Insurance`, etc.)

On the frontend (reference only):

- Validation: `frontend-crm/src/features/request/useRequestForm.ts` (`BIRTH_LOCATION_NAME_LABEL`, `getBirthLocationNameError`, `REQUEST_FORM_PAYMENT_METHOD_OPTIONS` via `@/lib/paymentRules`)
- Submit: `frontend-crm/src/features/request/RequestForm.tsx`
- Fixture: `frontend-crm/src/features/request/dummyTestLead.ts`

---

## Definition of done

- [ ] Server validates `birth_hospital` when `birth_location` is present (intake path).
- [ ] `birth_location` and `birth_hospital` persist to the database on successful intake.
- [ ] Intake rejects `Medicaid`; staff paths still support Medicaid.
- [ ] Automated tests cover the cases above.
- [ ] SQL audit on a test submission shows both birth fields non-null.

---

## Related frontend docs

- General submission handoff: `docs/BACKEND_REQUEST_SUBMISSION_TEST_PROMPT.md`
- Payment / authorization rules: `docs/BACKEND_PAYMENT_COLLECTION_RULES_PROMPT.md`
