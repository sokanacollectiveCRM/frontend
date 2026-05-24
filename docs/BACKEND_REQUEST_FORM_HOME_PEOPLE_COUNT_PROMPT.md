# Backend implementation prompt — People in the Home counts (May 2026)

**Copy this entire document into the backend repo ticket, PR description, or agent prompt.**

---

## Context (frontend already shipped)

The public request form **Home Details** step (step 2) now asks how many other people live in the home, excluding the client and the baby.

| UI label | JSON key | Required on intake |
|----------|----------|-------------------|
| Adult (18 and older) | `home_adults_count` | Yes |
| Youth (under 18) | `home_youth_count` | Yes |

**Question text (exact):** `How many other people live in the home with you? (not including you or the baby)`

Input type: **dropdown/select** (not free text). Both fields use the same option list.

Same endpoint and transport as other intake fields:

- **`POST {BACKEND_ORIGIN}/requestService/requestSubmission`**
- **Headers:** `Content-Type: application/json`
- **Body:** full validated form object (frontend `useRequestForm.ts` → `fullSchema`)

Staff CRM reads/writes the same keys on **GET/PUT client** (or equivalent). Frontend staff UI labels:

- **Other People in Home — Adults (18+)**
- **Other People in Home — Youth (under 18)**

---

## Your task

Implement **validation**, **persistence**, **read API shape**, and **tests** for:

| Concern | JSON keys | What “good” looks like |
|--------|-----------|-------------------------|
| Adult count | `home_adults_count` | One of allowed string values |
| Youth count | `home_youth_count` | One of allowed string values |
| Staff view | GET client / lead detail | Return both keys (snake_case; camelCase `homeAdultsCount` / `homeYouthCount` if you dual-publish) |
| Staff edit | PATCH/PUT client | Accept same keys + validation |

---

## Allowed values (exact strings — must match frontend)

Both fields use the same allowed set:

`"0"`, `"1"`, `"2"`, `"3"`, `"4"`, `"5+"`

- **Type on wire:** string (not integer — `"5+"` is not numeric).
- **Required on intake:** both fields must be present and non-empty after trim.
- Reject unknown values with `400` (recommended).

Reference: `frontend-crm/src/features/request/homePeopleCountOptions.ts`

---

## Validation rules (mirror frontend)

Reference: `frontend-crm/src/features/request/useRequestForm.ts` (`fullSchema`).

### `home_adults_count` / `home_youth_count`

- **Type:** string, required on intake.
- **Allowed:** exactly one of `"0"`, `"1"`, `"2"`, `"3"`, `"4"`, `"5+"`.
- **Do not** coerce `"5+"` to integer `5` without also storing the original string — staff UI displays `"5+"` as submitted.
- **Optional on legacy rows:** existing clients without these fields may have `null`; staff CRM should still load. New intakes must require both.

### Sample validation failures (expect `400`)

**Empty adult count:**

```json
{
  "home_adults_count": "",
  "home_youth_count": "0"
}
```

**Out-of-range value:**

```json
{
  "home_adults_count": "6",
  "home_youth_count": "0"
}
```

**Missing field:**

```json
{
  "home_youth_count": "2"
}
```

---

## Persistence (recommended schema)

| Column | Type | Notes |
|--------|------|--------|
| `home_adults_count` | `varchar(3)` or `text` | Store `"0"`–`"4"` or `"5+"` |
| `home_youth_count` | `varchar(3)` or `text` | Same |

### Migration sketch (PostgreSQL)

```sql
-- Example only — adjust table/column names to your schema (e.g. phi_clients)

ALTER TABLE public.phi_clients
  ADD COLUMN IF NOT EXISTS home_adults_count text,
  ADD COLUMN IF NOT EXISTS home_youth_count text;
```

---

## Request submission mapper

On **`POST /requestService/requestSubmission`** (and any shared `saveData` / insert path):

1. Read `home_adults_count` and `home_youth_count` from body.
2. Validate against allowed list.
3. Persist both columns on insert.
4. Include both keys in **GET client detail** responses.

**Known gap pattern** (from prior intake audits): field is on the POST body but **null in DB** because INSERT column list omits it. Confirm both keys are mapped on insert/update — do not silently drop them.

---

## Sample POST bodies (integration tests)

**Typical submission (one adult, no youth):**

```json
{
  "address": "123 Test Street",
  "city": "Springfield",
  "state": "IL",
  "zip_code": "62704",
  "home_type": ["Rent, apartment or house"],
  "home_type_other": "",
  "home_access": "Front door, no stairs",
  "home_adults_count": "1",
  "home_youth_count": "0",
  "pets": "None"
}
```

**Large household (5+ adults, multiple youth):**

```json
{
  "home_adults_count": "5+",
  "home_youth_count": "3",
  "pets": "None"
}
```

**Empty home (only client + baby expected):**

```json
{
  "home_adults_count": "0",
  "home_youth_count": "0",
  "pets": "None"
}
```

**Full happy-path fixture:** use frontend `DUMMY_TEST_LEAD` (`frontend-crm/src/features/request/dummyTestLead.ts`) — includes:

```json
"home_adults_count": "1",
"home_youth_count": "0"
```

Combine with submit-time transforms documented in `docs/BACKEND_REQUEST_SUBMISSION_TEST_PROMPT.md` (`number_of_babies` int, `service_needed` string).

---

## Staff CRM updates (PATCH/PUT client)

- Accept `home_adults_count` and `home_youth_count` on update.
- Apply the same validation rules as intake (or slightly looser for legacy null rows on read-only GET).
- Return values on GET so `LeadProfileModal` select fields populate correctly.

---

## Tests to add or update

### Unit / DTO tests

- [ ] Each allowed value (`"0"` … `"4"`, `"5+"`) for each field → pass
- [ ] Empty string → fail
- [ ] `"6"`, `"10"`, or numeric `1` (number type) → fail or document explicit coercion policy
- [ ] Missing either field on intake → fail

### Handler / integration tests

- [ ] POST full payload (like `DUMMY_TEST_LEAD` + submit transforms) → `200`
- [ ] DB row has expected `home_adults_count` / `home_youth_count`
- [ ] GET client by id returns both keys
- [ ] PATCH client with valid counts → persisted and returned on GET

### Regression

- [ ] Legacy rows with `null` counts still load in staff CRM without error
- [ ] PHI redaction rules: if home fields are PHI, apply same redaction as `pets` / address on unauthorized GET

---

## Manual verification (5 minutes)

1. Deploy backend + frontend locally (`VITE_APP_BACKEND_URL` → backend).
2. Open `/request`, click **Fill with test data**, advance to Home Details (or submit end-to-end).
3. DevTools → Network → `requestSubmission` → confirm body includes:

   ```json
   "home_adults_count": "1",
   "home_youth_count": "0"
   ```

4. Query the inserted lead:

```sql
SELECT
  id,
  email,
  home_adults_count,
  home_youth_count,
  city,
  state,
  zip_code,
  pets,
  requested_at
FROM public.phi_clients
WHERE email = 'test.lead@example.com'
ORDER BY requested_at DESC NULLS LAST, updated_at DESC NULLS LAST
LIMIT 5;
```

5. Open staff CRM → client profile → confirm **Other People in Home — Adults (18+)** = `1` and **Youth (under 18)** = `0`.
6. Submit a form with `home_adults_count: "5+"` and confirm DB stores `"5+"` (not `5`).

---

## Files to inspect on the backend (typical names)

Search the backend repo for:

- `requestSubmission`, `requestService`, `saveData`, `phi_clients`
- DTO/schema for intake POST body
- Client GET/PUT mappers

On the frontend (reference only):

| Purpose | Path |
|---------|------|
| Options + labels | `frontend-crm/src/features/request/homePeopleCountOptions.ts` |
| Validation | `frontend-crm/src/features/request/useRequestForm.ts` |
| UI (Home Details) | `frontend-crm/src/features/request/Step2Health.tsx` |
| Submit | `frontend-crm/src/features/request/RequestForm.tsx` |
| Test fixture | `frontend-crm/src/features/request/dummyTestLead.ts` |
| Staff UI | `frontend-crm/src/features/clients/components/dialog/LeadProfileModal.tsx` |
| Client type | `frontend-crm/src/features/clients/data/schema.ts` |

---

## Definition of done

- [ ] `home_adults_count` and `home_youth_count` accepted on intake; validated against allowed list.
- [ ] Database stores both reliably (columns + mapper, not null after new intakes).
- [ ] GET client returns both keys.
- [ ] Staff update path supports both fields.
- [ ] Automated tests cover validation, persistence, and read-back.
- [ ] SQL audit on a test submission shows expected values (not null).

---

## Related frontend docs

- General submission handoff + persistence audit: `docs/BACKEND_REQUEST_SUBMISSION_TEST_PROMPT.md`
- Home type multi-select (same step): `docs/BACKEND_REQUEST_FORM_HOME_TYPE_PROMPT.md`
- Birth location + payment verification: `docs/BACKEND_REQUEST_FORM_BIRTH_LOCATION_AND_PAYMENT_VERIFY_PROMPT.md`
