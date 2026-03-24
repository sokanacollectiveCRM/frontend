# Handoff: Admin cannot see doula documents (ID mismatch)

## Metadata
- Direction: `frontend->backend`
- Priority: `P0`
- Requested By: `frontend`
- Date: `2026-03-11`
- Status: `open`
- Related Links:
  - `frontend-crm/src/features/hours/components/AdminDoulaDocumentsSection.tsx`
  - `backend/src/controllers/doulaController.ts` (getDoulaDocumentsAdmin)
  - `backend/src/repositories/doulaDocumentRepository.ts`

## Why This Is Needed
- Doulas upload documents successfully via doula dashboard (stored in Supabase `doula_documents` with `doula_id` = auth user id).
- Admin views doula profile and sees "0/5 approved" and all "Missing" even when documents exist.
- Root cause: Admin fetches documents using Cloud SQL doula id; documents are stored with Supabase auth user id. For some doulas (e.g. legacy, different creation flows), these ids may differ.

## Current Behavior
- `GET /api/admin/doulas/:doulaId/documents` queries `doula_documents WHERE doula_id = doulaId`.
- `doulaId` comes from the frontend (Cloud SQL `public.doulas.id`).
- Document upload uses `req.user?.id` (Supabase auth user id).
- When Cloud SQL doulas.id ≠ auth user id, admin sees no documents.

## Expected Behavior
- Admin should see all uploaded documents for a doula regardless of id source.
- When documents exist under the auth user id but not the Cloud SQL id, they should be returned.

## Requested Changes
- [x] In `getDoulaDocumentsAdmin`: if primary query by `doulaId` returns 0 documents, add fallback:
  1. Fetch doula's email from Cloud SQL `public.doulas` where id = doulaId.
  2. Look up Supabase `auth.users` by email to get auth user id.
  3. Query `doula_documents` WHERE doula_id = auth_user_id.
  4. If documents found, return them (admin sees them; document approval works).
- [ ] Optionally: log when fallback is used for debugging/migration planning.
- [ ] Ensure `getCompleteness(doulaId)` and related calls also use the same resolution (or accept resolved id) so completeness reflects actual documents.

## API/Contract Notes
- Endpoint: `GET /api/admin/doulas/:doulaId/documents`
- Response shape: unchanged (`{ success, documents, completeness }`).
- Backward compatibility: Must not break doulas where ids already match.

## Data/Migration Notes
- Tables: `public.doulas` (Cloud SQL), `auth.users` (Supabase), `public.doula_documents` (Supabase).
- Required migration: No schema change. Fallback logic only.

## Acceptance Criteria
- [ ] Admin views doula profile for info@techluminateacademy.com; uploaded documents appear (not all "Missing").
- [ ] Admin can approve/reject documents that were uploaded by the doula.
- [ ] Doulas where Cloud SQL id = auth id continue to work without regression.

## Verification Steps
- Backend:
  - As doula (info@techluminateacademy.com), upload a document via doula dashboard.
  - Query Supabase: `SELECT doula_id, file_name FROM doula_documents` — note the `doula_id`.
  - Query Cloud SQL: `SELECT id, email FROM public.doulas WHERE email = 'info@techluminateacademy.com'` — compare ids.
  - As admin, GET `/api/admin/doulas/{cloud_sql_id}/documents` — should return documents (with fallback if ids differ).
- Frontend:
  - Log in as admin, go to Doulas → click doula with info@techluminateacademy.com → View profile & approve documents.
  - Required Documents section should show uploaded docs (not all Missing).

## Implementation Notes
- Use Supabase admin client to query `auth.users` by email (service role bypasses RLS).
- The `DoulaDocumentCompletenessService.getCompleteness(doulaId)` is called with the same doulaId — consider passing the resolved id (auth id) when fallback applies, so completeness counts match the returned documents.
