# Backend implementation prompt — Home Type multi-select (May 2026)

**Copy this entire document into the backend repo ticket, PR description, or agent prompt.**

---

## Context (frontend already shipped)

The public request form **Home Details** step was updated:

1. **`home_type`** is no longer a single select (`House`, `Condo`, `Apartment`, `Shelter`, `Other`). It is **check all that apply** — an array of strings.
2. **`home_type_other`** is a new optional field — **required when `home_type` includes `"Other"`** (free-text description).
3. **`"Prefer not to answer"`** is mutually exclusive with all other options on the client (only that value, or any combination without it).

Same endpoint and transport as other intake fields:

- **`POST {BACKEND_ORIGIN}/requestService/requestSubmission`**
- Body: full validated form object (see frontend `useRequestForm.ts` → `fullSchema`)

Staff CRM (`LeadProfileModal`) reads/writes the same keys on **GET/PUT client** (or equivalent). It normalizes legacy single-string `home_type` values for display.

---

## Your task

Implement **validation**, **persistence**, **read API shape**, and **tests** for:

| Concern | JSON keys | What “good” looks like |
|--------|-----------|-------------------------|
| Multi-select housing | `home_type` (POST body) | `string[]` on wire from SPA |
| DB column | `home_types` | `TEXT[]` — **do not** INSERT into non-existent `home_type` column |
| Other description | `home_type_other` | Non-empty string when `"Other"` ∈ `home_type`; empty otherwise |
| Legacy data | existing `home_type` column | Old scalar values still readable; new intakes write arrays |
| Staff view | GET client / lead detail | Return `home_type` as **array** (or normalize scalar → one-element array) + `home_type_other` |

---

## Allowed `home_type` values (exact strings — must match frontend)

These are the **only** values the SPA can submit today. Reject unknown entries on intake (recommended `400`) or strip with logging — do not silently remap labels.

1. `Rent, apartment or house`
2. `Own, apartment, condo, or house`
3. `Living with family or friends`
4. `Subsidized or public housing`
5. `Transitional housing`
6. `Shelter or emergency housing`
7. `Experiencing homelessness`
8. `Other`
9. `Prefer not to answer`

**Legacy values** (pre-change intakes, may still exist in DB): `House`, `Condo`, `Apartment`, `Shelter`, `Other` (old meaning). Do not delete; when reading, return as-is or wrap in a one-element array for API consumers.

---

## Validation rules (mirror frontend)

Reference: `frontend-crm/src/features/request/homeTypeOptions.ts`, `useRequestForm.ts` (`fullSchema` + `.refine`).

### `home_type`

- **Type:** array of strings (may be omitted or `[]` — field is optional on the form).
- **Each element:** must be one of the nine allowed values above (after trim).
- **Mutual exclusivity:** if array includes `"Prefer not to answer"`, it must be **the only** element. Reject combinations like `["Rent, apartment or house", "Prefer not to answer"]` with `400`.
- **Do not** split option strings on commas — labels contain commas (e.g. `"Rent, apartment or house"`).

### `home_type_other`

- **Type:** string, optional.
- **Required when:** `"Other"` is in `home_type` (after trim, non-empty).
- **Recommended when not Other:** accept empty string / omit; do not require.
- **Max length:** align with similar free-text fields (e.g. `referral_source_other`); suggest **500** chars if no existing limit.

### Sample validation failures (expect `400`)

**Other selected, no description:**

```json
{
  "home_type": ["Other"],
  "home_type_other": ""
}
```

**Invalid option:**

```json
{
  "home_type": ["Apartment"]
}
```

(`"Apartment"` is legacy — not in the new allowed list unless you explicitly allow it for backward-compatible admin edits.)

**Prefer not to answer combined with another option:**

```json
{
  "home_type": ["Prefer not to answer", "Transitional housing"],
  "home_type_other": ""
}
```

---

## Persistence (recommended schema)

### Option A — JSONB array + text (preferred)

| Column | Type | Notes |
|--------|------|--------|
| `home_type` | `jsonb` or `text[]` | Store `string[]`; migrate from `varchar` if needed |
| `home_type_other` | `text` nullable | New column |

### Option B — minimal change (not ideal)

Keep `home_type` as `text`, store `JSON.stringify(string[])` or comma-joined values. **Avoid comma-join** for round-trip fidelity (labels contain commas). JSON string in a text column is acceptable short-term if you parse on read.

### Migration sketch (PostgreSQL)

```sql
-- Example only — adjust table/column names to your schema (e.g. phi_clients)

ALTER TABLE public.phi_clients
  ADD COLUMN IF NOT EXISTS home_type_other text;

-- If home_type is varchar today, migrate to jsonb:
-- 1. Add home_type_new jsonb
-- 2. Backfill: scalar legacy -> ["legacy value"], null -> null or []
-- 3. Swap columns
```

**Backfill rule for legacy scalar `home_type`:**

- Non-null non-empty string → `[that string]` (single-element JSON array).
- Null / empty → `[]` or `null` (pick one convention; frontend treats both as “no selection”).

---

## Request submission mapper

On **`POST /requestService/requestSubmission`** (and any shared `saveData` / insert path):

1. Read `home_type` from body. If a **string** arrives (old client or proxy), coerce to one-element array for storage.
2. Validate allowed values + prefer-not exclusivity + `home_type_other` when Other.
3. Persist `home_type` (array) and `home_type_other`.
4. Include both keys in **GET client detail** responses (snake_case `home_type`, `home_type_other`; camelCase `homeType`, `homeTypeOther` if you dual-publish like other fields).

Known gap pattern (from prior intake audits): field is on the POST body but **null in DB** because INSERT column list omits it. Confirm `home_type` is mapped; add `home_type_other` to insert/update.

---

## Sample POST bodies (integration tests)

**Single selection:**

```json
{
  "address": "456 Oak Ave",
  "city": "Chicago",
  "state": "IL",
  "zip_code": "60614",
  "home_type": ["Rent, apartment or house"],
  "home_type_other": "",
  "pets": "None"
}
```

**Multiple selections:**

```json
{
  "home_type": [
    "Living with family or friends",
    "Subsidized or public housing"
  ],
  "home_type_other": ""
}
```

**Other + description:**

```json
{
  "home_type": ["Other"],
  "home_type_other": "RV parked on family property"
}
```

**Prefer not to answer only:**

```json
{
  "home_type": ["Prefer not to answer"],
  "home_type_other": ""
}
```

**Empty / omitted (optional field):**

```json
{
  "home_type": [],
  "home_type_other": ""
}
```

Full happy-path fixture: extend frontend `DUMMY_TEST_LEAD` (`frontend-crm/src/features/request/dummyTestLead.ts`) — currently includes:

```json
"home_type": ["Rent, apartment or house"],
"home_type_other": ""
```

Use the full object for end-to-end tests (all required intake fields + submit transforms).

---

## Staff CRM updates (PATCH/PUT client)

- Accept `home_type` as `string[]` on update.
- Accept `home_type_other` when staff edits a client with Other selected.
- Apply the same validation rules as intake (or slightly looser for legacy scalars on read-only rows).
- Return arrays on GET so `LeadProfileModal` multiselect works without extra frontend hacks.

---

## Tests to add or update

### Unit / DTO tests

- [ ] `home_type: ["Other"]` + empty `home_type_other` → validation error
- [ ] `home_type: ["Other"]` + non-empty `home_type_other` → pass
- [ ] Each allowed option alone → pass
- [ ] Multiple allowed options (without Prefer not to answer) → pass
- [ ] `["Prefer not to answer", "<anything else>"]` → fail
- [ ] Unknown string in array → fail (or document allow-list for admin legacy)
- [ ] Body sends `home_type` as legacy string `"House"` → coerce to `["House"]` on save (optional but recommended)

### Handler / integration tests

- [ ] POST full payload (like `DUMMY_TEST_LEAD` + submit transforms) → `200`
- [ ] DB row has `home_type` stored as array/JSON matching request
- [ ] DB row has `home_type_other` when Other submitted
- [ ] GET client by id returns `home_type` as array + `home_type_other`

### Regression

- [ ] Existing row with scalar `home_type = 'Apartment'` still loads; API returns array or scalar normalized by frontend
- [ ] PHI redaction rules: if `home_type` is PHI, apply same redaction as other address/home fields on unauthorized GET

---

## Manual verification (5 minutes)

1. Deploy backend + frontend locally (`VITE_APP_BACKEND_URL` → backend).
2. Open `/request`, complete Home Details with multiple home types + **Other** text.
3. DevTools → Network → `requestSubmission` → confirm body:

   ```json
   "home_type": ["...", "Other"],
   "home_type_other": "<your text>"
   ```

4. Query the inserted lead (adjust table/column names):

```sql
SELECT
  id,
  email,
  home_type,
  home_type_other,
  city,
  state,
  zip_code,
  pets,
  requested_at
FROM public.phi_clients
WHERE email = '<submitted-email>'
ORDER BY requested_at DESC NULLS LAST, updated_at DESC NULLS LAST
LIMIT 5;
```

5. Open staff CRM → client profile → confirm **Home Type** chips and **Home Type (Other)** match submission.
6. Submit with **Prefer not to answer** only; confirm DB array is `["Prefer not to answer"]` and no other values.

---

## Files to inspect on the backend (typical names)

Search the backend repo for:

- `requestSubmission`, `requestService`, `saveData`, `phi_clients`
- DTO/schema for intake POST body (`home_type`, `home_type_other`)
- Client GET/PUT mappers (`homeType`, `home_type_other`)

On the frontend (reference only):

- Options + toggle logic: `frontend-crm/src/features/request/homeTypeOptions.ts`
- Validation: `frontend-crm/src/features/request/useRequestForm.ts`
- UI: `frontend-crm/src/features/request/Step2Health.tsx`
- Submit: `frontend-crm/src/features/request/RequestForm.tsx`
- Fixture: `frontend-crm/src/features/request/dummyTestLead.ts`
- Staff UI: `frontend-crm/src/features/clients/components/dialog/LeadProfileModal.tsx`

---

## Definition of done

- [ ] `home_type` accepted as `string[]` on intake; validated against allowed list + prefer-not rule.
- [ ] `home_type_other` required when `"Other"` is selected; persisted when provided.
- [ ] Database stores multi-select reliably (JSON/array column or documented JSON-in-text with parse on read).
- [ ] GET client returns `home_type` as array (or documented normalization) and `home_type_other`.
- [ ] Staff update path supports the same fields.
- [ ] Automated tests cover validation, persistence, and read-back.
- [ ] SQL audit on a test submission shows expected `home_type` / `home_type_other`.

---

## Related frontend docs

- General submission handoff: `docs/BACKEND_REQUEST_SUBMISSION_TEST_PROMPT.md`
- Birth location + payment verification (same prompt style): `docs/BACKEND_REQUEST_FORM_BIRTH_LOCATION_AND_PAYMENT_VERIFY_PROMPT.md`
