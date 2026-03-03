# Handoff: Cloud SQL doula profile parity for profile tab fields

## Metadata
- Direction: `frontend->backend`
- Priority: `P0`
- Requested By: `frontend`
- Date: `2026-03-02`
- Status: `open`
- Related Links:
  - `frontend-crm/src/features/doula-dashboard/components/ProfileTab.tsx`
  - `frontend-crm/src/api/doulas/doulaService.ts`

## Why This Is Needed
- Doula profile save can fail with `User not found` when legacy `users` row is missing.
- Frontend profile form includes `bio` and address fields that should persist reliably.
- Current source split between Supabase `users` and Cloud SQL `public.doulas` causes drift.

## Current Behavior
- `PUT /api/doulas/profile` may fail for Cloud SQL-only doula identities.
- `public.doulas` now has `bio` migration, but full profile parity is incomplete.
- Field ownership is partially ambiguous across Cloud SQL, Supabase `users`, and Supabase storage.

## Expected Behavior
- Authenticated doula can always load and update profile through `/api/doulas/profile`.
- `bio` persists in Cloud SQL.
- Remaining profile fields have a defined source of truth and are returned consistently.

## Requested Changes
- [ ] Apply migrations in all target environments:
  - `src/db/migrations/add_bio_to_doulas.sql`
  - `src/db/migrations/add_profile_fields_to_doulas.sql`
- [ ] Ensure `/api/doulas/profile` update path supports Cloud SQL-only doula records.
- [ ] Implement final field ownership:
  - Cloud SQL `public.doulas`: `firstname/lastname` (or `full_name` mapping), `email`, `phone_number`, `bio`, `address`, `city`, `state`, `country`, `zip_code`, `account_status`
  - Supabase storage: `profile_picture` file storage
  - No `business` field support needed
- [ ] Keep response shape compatible with frontend: `{ success, profile }`.

## API/Contract Notes
- Endpoint(s):
  - `GET /api/doulas/profile`
  - `PUT /api/doulas/profile`
- Request shape:
  - Current frontend sends `UpdateProfileData` from `doulaService.ts`.
- Response shape:
  - `profile` object with user-facing doula fields:
    - required: `firstname`, `lastname`, `email`, `bio`, `address`, `city`, `state`, `country`, `zip_code`, `account_status`
    - optional passthrough: `profile_picture` (from Supabase-linked source)
    - excluded: `business`
- Backward compatibility:
  - Do not break existing frontend parser expectations for `profile`.

## Data/Migration Notes
- Tables:
  - `public.doulas`
  - optional legacy (read/fallback only): `public.users`
- Required migration:
  - `yes` ->
    - `src/db/migrations/add_bio_to_doulas.sql`
    - `src/db/migrations/add_profile_fields_to_doulas.sql`
      - `address TEXT`
      - `city TEXT`
      - `state TEXT`
      - `country TEXT`
      - `zip_code TEXT`
      - `account_status TEXT NOT NULL DEFAULT 'approved'`

## Backend File Touchpoints
- `src/services/cloudSqlTeamService.ts`
  - map/select/update added profile fields from `public.doulas`
- `src/controllers/doulaController.ts`
  - ensure GET/PUT profile returns new field set with Cloud SQL-first behavior
- `src/db/migrations/add_profile_fields_to_doulas.sql`
  - add missing columns for profile tab parity

## Acceptance Criteria
- [ ] Doula can update `bio` without `User not found` error.
- [ ] `GET /api/doulas/profile` returns updated `bio` after save.
- [ ] Profile update succeeds for users present only in Cloud SQL `public.doulas`.
- [ ] `address`, `city`, `state`, `country`, `zip_code`, `account_status` persist and round-trip through `GET/PUT /api/doulas/profile`.
- [ ] `business` is not required by backend contract and is ignored safely if sent.
- [ ] Contract remains compatible with existing frontend `ProfileTab`.

## Verification Steps
- Backend:
  - Run both migrations in Cloud SQL.
  - Call `PUT /api/doulas/profile` with `bio`, `address`, `city`, `state`, `country`, `zip_code`, `account_status` and confirm 200.
  - Call `GET /api/doulas/profile` and confirm persisted fields.
- Frontend:
  - Update bio in profile tab and refresh page.
  - Confirm persisted values display and no error toast appears.

## Implementation Notes
- Current frontend relies on `ProfileTab` + `updateDoulaProfile` and expects stable profile payload.
- Profile picture remains in Supabase storage; do not move binary/media storage into Cloud SQL.
