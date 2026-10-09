# Handoff: Public intake CORS Idempotency-Key + Other language persist

## Metadata
- Direction: `frontend->backend`
- Priority: `P0`
- Requested By: Nancy Cowans / Sokana Collective (dev pilot, starts Monday Oct 12, 2026)
- Date: `2026-10-09`
- Status: `open`
- Related Links:
  - Dev frontend: `https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app`
  - Dev API: `https://sokana-private-api-dev-46lcr3n2qa-uc.a.run.app`

## Why This Is Needed
- Public intake submit from the browser currently dies as **Failed to fetch** because CORS preflight does not allow the `Idempotency-Key` header the SPA sends.
- When primary language is **Other**, the frontend will collect `primary_language_other`. The backend has no column/passthrough for that key today; only `primary_language` is stored.

## Current Behavior
- `GET /requestService/public/sokana360` from the dev frontend origin succeeds (CORS origin allowlist is correct).
- `OPTIONS POST /requestService/sokana360/requestSubmission` with `Access-Control-Request-Headers: content-type,idempotency-key` returns 204 with:
  - `access-control-allow-origin: https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app`
  - `access-control-allow-headers: Content-Type,Authorization,X-Session-Token,X-Signing-Session`
  - **`Idempotency-Key` is missing**, so the browser blocks the real POST.
- curl POST (no CORS enforcement) reaches `normalizePublicIntakeSubmission` (400 missing name on empty body).
- `primary_language_other` is dropped; unknown keys are ignored.

## Expected Behavior
- Browser preflight for public intake POST allows `Content-Type` and `Idempotency-Key` (and existing auth headers).
- Public intake still works if `Idempotency-Key` is omitted (frontend ships a workaround until this ships).
- Optional `primary_language_other` is accepted and persisted (or at least stored on the client row / JSON) when `primary_language` is Other.

## Requested Changes
- [ ] Add `Idempotency-Key` to CORS `allowedHeaders` in `src/server.ts` (`corsOptions.allowedHeaders`).
- [ ] Confirm Cloud Run `FRONTEND_ORIGIN` for the **dev** API includes `https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app` (already true as of 2026-10-09; re-check after any env change).
- [ ] Accept and persist `primary_language_other` on `POST /requestService/:tenantSlug/requestSubmission` (passthrough in `normalizePublicIntakeSubmission` + `phi_clients` column or equivalent).
- [ ] After CORS ships, frontend can restore the `Idempotency-Key` header.
- [ ] Relax public-intake required validation to match Nancy's 2026-10-09 set (see Server-side required checks below). Until this ships, a frontend-valid Nancy-only submit still 400s on the live API.

## API/Contract Notes
- Endpoint(s):
  - `POST /requestService/:tenantSlug/requestSubmission`
  - `POST /requestService/requestSubmission` (legacy)
- Request shape:
  - Existing intake body
  - Header `Idempotency-Key` (optional, already implemented in `readIdempotencyKey`)
  - Additive field `primary_language_other?: string`
- Response shape:
  - Unchanged success `{ message: "Form data received, onto processing" }`
- Backward compatibility:
  - Requests without `Idempotency-Key` must still succeed
  - Requests without `primary_language_other` must still succeed
  - Do not make new fields required

## Data/Migration Notes
- Tables:
  - `public.phi_clients` (if adding `primary_language_other`)
- Required migration:
  - yes, if persisting as its own column (`add_primary_language_other_to_phi_clients.sql` or equivalent)
  - no, if folded into existing `primary_language` only (frontend already sends the specified language in `primary_language` as a workaround)

## Acceptance Criteria
- [ ] Browser OPTIONS preflight from the dev frontend origin with `Access-Control-Request-Headers: content-type,idempotency-key` returns `Access-Control-Allow-Headers` containing `Idempotency-Key`.
- [ ] A real browser POST from `https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app` with `Idempotency-Key` is not blocked by CORS.
- [ ] `primary_language_other` on a valid intake POST is stored and returned on subsequent client GET (if column added).

## Verification Steps
- Backend:
  - `curl -i -X OPTIONS -H "Origin: https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,idempotency-key" https://<dev-api>/requestService/sokana360/requestSubmission`
  - Confirm Allow-Headers includes Idempotency-Key.
- Frontend:
  - Submit the public `/request/sokana360` form from the deployed dev SPA; Network tab shows POST (not a CORS failure) and thank-you screen.

## Server-side required checks that reject newly optional fields

Nancy's frontend-required set is only: first/last name, email, phone, city/zip, due date, service requested, why-doula (`service_support_details`). **Other language specify** remains required only when language is Other.

Live backend `normalizePublicIntakeSubmission` still 400s without the following. Exact paths from `/tmp/backend` (backend repo):

| Check | File | Trigger |
| --- | --- | --- |
| `Complete address is required` (`address` + `city` + `state` + `zip_code`) | `src/features/intake/domain/normalizePublicSubmission.ts` | missing street or state (city/zip still required on both sides) |
| `age is required` | `src/features/intake/domain/requestSubmissionDto.ts` (`parseIntakeClientAgeYears`) | empty/omitted `age` |
| `provider_type is required` | `src/features/intake/domain/requestSubmissionDto.ts` (`parseIntakeProviderType`) | empty provider |
| `home_adults_count is required` / `home_youth_count is required` | `src/features/intake/domain/requestSubmissionDto.ts` (`parseIntakeHomePeopleCount`) | empty people-in-home counts |
| `birth_location is required` and birth place name required | `src/features/intake/domain/requestSubmissionDto.ts` (`validateIntakeBirthPlace`) | empty `birth_location` / `birth_hospital` |
| `payment_method is required` | `src/features/intake/domain/requestSubmissionDto.ts` (`parseIntakePaymentMethod`) | empty payment method |
| Commercial insurance details required when payment is Private/Commercial | `src/features/intake/domain/normalizePublicSubmission.ts` + billing helper | `requiresInsurance` |
| `referral_source is required` | `src/constants/referralSource.ts` (`parseIntakeReferral`) | empty referral |
| `primary_language_other` dropped (unknown key) | `src/features/intake/domain/normalizePublicSubmission.ts` | Other language specify not persisted as its own column |

Frontend maps Other-language text into `primary_language` so the existing column still gets a value. Frontend omits `Idempotency-Key` until CORS allowlists it.

## Implementation Notes
- CORS config is in `backend/src/server.ts` (`allowedHeaders` array). This is a one-line allowlist add plus tests if you have CORS unit coverage.
- Frontend workaround (this PR): omit `Idempotency-Key` so the Monday pilot can submit after the frontend deploy, before this backend change.
- Do not guess other GCP env changes; origin allowlist was already correct on 2026-10-09.
