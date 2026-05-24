# Backend verification prompt — birth location persistence on intake

> **Status (May 2026):** Verified on backend `main` — `validateIntakeBirthPlace`, INSERT binds `birth_location` + `birth_hospital` (SQL params 9–10), columns confirmed on PHI Cloud SQL. This doc remains as audit/reference.

**Copy this entire document into the backend repo ticket, PR description, or agent prompt.**

---

## Context (frontend)

The public request form (`POST /requestService/requestSubmission`) sends two related pregnancy fields on every completed intake:

| JSON key | UI label | Required | Meaning |
|----------|----------|----------|---------|
| `birth_location` | Birth location* | Yes | One of: `Hospital`, `Home`, `Birth Center`, `Other` |
| `birth_hospital` | Name of hospital or birth center, if home, type home* | Yes when `birth_location` is set | **Specific place name** — hospital name, birth center name/location, or home birth location (address or the word `home`). Legacy column/key name; not hospital-only. |

Frontend validation: `frontend-crm/src/features/request/useRequestForm.ts` → `fullSchema` + `superRefine` (rejects empty `birth_hospital` when `birth_location` is non-empty).

Submit payload: `frontend-crm/src/features/request/RequestForm.tsx` spreads all validated fields; no rename or drop of these keys.

Fixture: `frontend-crm/src/features/request/dummyTestLead.ts` → `DUMMY_TEST_LEAD` includes `birth_location: "Hospital"` and `birth_hospital: "Springfield General Hospital"`.

---

## Your task

**Confirm and fix (if needed) that both `birth_location` and `birth_hospital` are persisted on intake** when `POST /requestService/requestSubmission` succeeds.

Do **not** rely on the SPA alone — a prior audit found gaps where CRM-required fields were on the wire but **null in `phi_clients`** because the insert mapper omitted them.

---

## Endpoint

- **Method / path:** `POST {BACKEND_ORIGIN}/requestService/requestSubmission`
- **Headers:** `Content-Type: application/json`
- **Body:** Full validated form object (see frontend `fullSchema`)

---

## Validation rules (mirror frontend)

### Allowed `birth_location` values

`Hospital` | `Home` | `Birth Center` | `Other`

### Server-side validation (add if missing)

When `birth_location` is non-empty after trim:

- **`birth_hospital` is required** (non-empty string after trim).
- Do **not** validate format as “must look like a hospital” — for `Home` it may be an address or the literal text `home`.

**Should return 400** when place name is missing:

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

---

## Persistence checklist

1. **Columns exist** on the intake target table (typically `public.phi_clients`):
   - `birth_location` (text / enum — match frontend allowed values)
   - `birth_hospital` (text — confirm actual column name in your schema)

2. **Mapper binds both keys** on insert/update for the public submission path (e.g. `RequestFormRepository.saveData`, intake DTO → row mapper). Search for:
   - `requestSubmission`, `requestService`, `saveData`, `phi_clients`, `birth_location`, `birth_hospital`

3. **No silent drop** — if the handler spreads or whitelists fields, both keys must be on the allow list.

4. **Staff/admin read path** returns the same values stored at intake (CRM lead profile reads `birth_location` and `birth_hospital` from the client row).

---

## Sample POST bodies for integration tests

**Hospital:**

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

**Home (address):**

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

**Home (literal “home”):**

```json
{
  "due_date": "2027-06-01",
  "birth_location": "Home",
  "birth_hospital": "home",
  "number_of_babies": 1,
  "provider_type": "Midwife",
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

Full happy path: use `DUMMY_TEST_LEAD` shape + submit transforms (`number_of_babies` int, `service_needed` string).

---

## Tests to add or update

### Unit / DTO

- [ ] `birth_location` set + empty `birth_hospital` → validation error (400)
- [ ] Each of `Home` / `Hospital` / `Birth Center` / `Other` with non-empty `birth_hospital` → pass

### Handler / integration

- [ ] POST full payload (like `DUMMY_TEST_LEAD`) → `200`
- [ ] Assert DB row has **non-null, non-empty** `birth_location` and `birth_hospital` (use actual column names)
- [ ] POST with `birth_location` but missing `birth_hospital` → `400`, no partial row (or rollback)
- [ ] Home with `birth_hospital: "home"` → both columns populated as sent

---

## Manual verification (~5 minutes)

1. Run backend + frontend locally; point `VITE_APP_BACKEND_URL` at your API.
2. Open `/request`, complete the form (or **Fill with test data**), submit.
3. DevTools → Network → `requestSubmission` → confirm body includes non-empty `birth_location` and `birth_hospital`.
4. Query the inserted lead:

```sql
SELECT
  id,
  email,
  birth_location,
  birth_hospital,
  due_date,
  provider_type,
  requested_at
FROM public.phi_clients
WHERE email = '<submitted-email>'
ORDER BY requested_at DESC NULLS LAST, updated_at DESC NULLS LAST
LIMIT 5;
```

5. Repeat with **Home** + `birth_hospital` = `home`; confirm both columns match the POST body.

---

## Definition of done

- [ ] Server validates `birth_hospital` when `birth_location` is present (intake path).
- [ ] `birth_location` and `birth_hospital` persist to the database on successful intake.
- [ ] Automated tests cover validation + persistence cases above.
- [ ] SQL audit on a test submission shows both birth fields non-null and matching the request body.

---

## Related frontend docs

- General submission handoff: `docs/BACKEND_REQUEST_SUBMISSION_TEST_PROMPT.md`
- Birth location + Medicaid (broader): `docs/BACKEND_REQUEST_FORM_BIRTH_LOCATION_AND_PAYMENT_VERIFY_PROMPT.md`
