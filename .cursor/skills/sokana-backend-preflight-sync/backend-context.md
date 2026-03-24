# Backend Context (Frontend Preflight Log)

This file must be updated before starting frontend implementation tasks that depend on backend behavior.

## Preflight Entry Checklist

Use this checklist at the top of every new preflight entry:

- **Gate Result**: `run_preflight` or `skip_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: one line
- **Repos Scanned**: backend/frontend/both
- **Files Scanned**: list of concrete paths
- **Context Updated**: yes/no
- **Implementation Started After Gate**: yes/no

## Canonical Backend Reference

- Backend repo: `/Users/jerrybony/Documents/GitHub/backend`
- Backend skill:
  - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/SKILL.md`
- Backend frontend-context:
  - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/frontend-context.md`

## Current Source-Of-Truth Snapshot

- Supabase: auth/session + doula documents
- Cloud SQL:
  - `public.doulas`
  - `public.phi_clients`
  - `public.doula_assignments`
  - `public.hours`
  - `public.client_activities`

## Preflight 2026-03-02

### Task
- Create frontend skill that enforces backend context updates before each task.

### Backend Context Reviewed
- `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/SKILL.md`
- `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/frontend-context.md`

### Frontend Files Scanned
- `src/api/doulas/doulaService.ts`
- `src/features/doula-dashboard/components/HoursTab.tsx`
- `src/features/doula-dashboard/components/ClientsTab.tsx`
- `src/features/doula-dashboard/components/ActivitiesTab.tsx`
- `src/features/doula-dashboard/components/DocumentsTab.tsx`

### Contract Expectations
- Frontend should tolerate wrappers:
  - `{ success, data }`, `{ success, clients }`, `{ success, hours }`, `{ success, activities }`
  - raw arrays and `{ data }` forms
- Hours payload needs mixed field support:
  - `start_time`/`startTime`, `end_time`/`endTime`
  - `client.firstname` and compatibility `client.user.firstname`

### Drift Risks
- Backend/frontend contract drift due to mixed API styles and duplicated normalization logic.

### Compatibility Required
- Keep fallback parsing active until all frontend tabs are consolidated on one mapper contract.

### Action
- [x] Context updated before coding
- [x] Skill installed in frontend repo

## Preflight 2026-03-02 (Finalize Backend Handoff Field Set)

### Task
- Finalize backend handoff with exact doula profile field ownership and migration details.

### Backend Context Reviewed
- `/Users/jerrybony/Documents/GitHub/backend/.cursor/handoffs/open/2026-03-02-backend-doula-profile-cloudsql-bio.md`
- `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-frontend-preflight-scan/SKILL.md`

### Frontend Files Scanned
- `.cursor/handoffs/open/2026-03-02-backend-doula-profile-cloudsql-bio.md`
- `.cursor/skills/sokana-backend-preflight-sync/backend-context.md`

### Contract Expectations
- Cloud SQL owns: `bio`, `address`, `city`, `state`, `country`, `zip_code`, `account_status`.
- Supabase storage remains owner for `profile_picture`.
- `business` is excluded from required backend contract.

### Drift Risks
- Partial rollout can keep profile fields split across stores and create inconsistent GET/PUT responses.

### Compatibility Required
- Preserve `{ success, profile }` response shape for existing `ProfileTab`.

### Action
- [x] Context updated before coding
- [x] Handoff task updated for backend pickup

## Preflight 2026-03-03 (Mandatory doula profile completion UX)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Make doula profile fields mandatory and show completion notification when profile is incomplete.
- **Repos Scanned**: both
- **Files Scanned**:
  - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/SKILL.md`
  - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/frontend-context.md`
  - `src/api/doulas/doulaService.ts`
  - `src/features/doula-dashboard/components/ProfileTab.tsx`
  - `src/features/doula-dashboard/components/HoursTab.tsx`
  - `src/features/doula-dashboard/components/ClientsTab.tsx`
  - `src/features/doula-dashboard/components/ActivitiesTab.tsx`
  - `src/features/doula-dashboard/components/DocumentsTab.tsx`
  - `src/main.tsx`
  - `src/common/contexts/UserContext.tsx`
  - `src/common/components/routes/ProtectedRoutes.tsx`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- Keep profile API compatibility with existing `{ success, profile }` and direct object responses.
- Frontend enforcement should validate required profile fields client-side before PUT submit.

### Drift Risks
- If backend does not enforce same required set, non-frontend clients could still persist partial profiles.
- Inconsistent required-field lists between UI badge/notification and submit validation can confuse users.

### Compatibility Required
- Keep update payload keys unchanged (`firstname`, `lastname`, `address`, `city`, `state`, `country`, `zip_code`, `bio`) to avoid breaking backend mapping.
- Additive UX-only profile completion notification should not block read-only dashboard views.

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-03 (Fix production TypeScript build regressions)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Fix TS build errors in `ProfileTab` and `Pipeline` after recent status/profile refactors.
- **Repos Scanned**: frontend
- **Files Scanned**:
  - `src/features/doula-dashboard/components/ProfileTab.tsx`
  - `src/features/pipeline/Pipeline.tsx`
  - `src/features/pipeline/components/UsersBoard.tsx`
  - `src/features/pipeline/components/UserColumn.tsx`
  - `src/features/clients/data/schema.ts`
  - `src/api/doulas/doulaService.ts`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- Keep profile update payload keys backward compatible with backend (`firstname`, `lastname`, `address`, `city`, `state`, `country`, `zip_code`, `bio`; optional `business` tolerated).
- Keep pipeline UI canonical status flow as `not hired` while still tolerating legacy `customer` values in incoming data.

### Drift Risks
- Type-level unions that include legacy `customer` can break UI grouping records and state updates if board state assumes only canonical statuses.
- Button handlers bound directly to async functions with non-event params can fail strict TS checks in production builds.

### Compatibility Required
- Preserve runtime behavior while constraining typings to avoid build-time failures.

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-03 (Rename assignment panel notes label)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Rename assignment side panel label from `Notes` to `Service Details` in doula assignments view.
- **Repos Scanned**: frontend
- **Files Scanned**:
  - `src/features/hours/components/DoulaListPage.tsx`
  - `src/features/hours/components/users-columns.tsx`
  - `.cursor/skills/sokana-backend-preflight-sync/backend-context.md`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- No backend contract changes; this is a frontend label-only update.

### Drift Risks
- Mixed labels (`Notes` in edit vs view states) can create UX inconsistency.

### Compatibility Required
- Keep data binding on existing `notes` field while changing only rendered text labels.

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-03 (Client status option update: replace customer)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Remove `Customer` status option and add `Not Hired` in client status dropdowns.
- **Repos Scanned**: frontend
- **Files Scanned**:
  - `src/features/clients/data/schema.ts`
  - `src/features/clients/components/users-columns.tsx`
  - `src/features/clients/components/dialog/LeadProfileModal.tsx`
  - `src/features/profiles/Profile.tsx`
  - `src/domain/client.ts`
  - `.cursor/skills/sokana-backend-preflight-sync/backend-context.md`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- Status payload sent by frontend should use backend-accepted string enums and remain backward compatible in existing views.

### Drift Risks
- If status enums differ across schema/domain/modal sources, dropdowns and API updates can become inconsistent.

### Compatibility Required
- Update all frontend status sources in sync (`schema`, `domain`, and modal constant lists).

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-03 (Fix tab lock + preserve fast profile tab)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Fix inability to switch tabs after profile mount change while keeping profile tab transitions fast.
- **Repos Scanned**: frontend
- **Files Scanned**:
  - `src/features/doula-dashboard/DoulaDashboard.tsx`
  - `src/features/doula-dashboard/components/ProfileTab.tsx`
  - `src/common/components/ui/tabs.tsx`
  - `.cursor/skills/sokana-backend-preflight-sync/backend-context.md`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- No backend/API contract changes; behavior change is frontend-only rendering and state handling.

### Drift Risks
- UI-level remount optimizations can break tab accessibility if mounted content visibility is not consistent with app styles.

### Compatibility Required
- Preserve existing profile update flow and required-field notification behavior.

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-03 (Prevent profile tab reload flash)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Ensure `Complete Profile` switches tabs without remount/loading flash.
- **Repos Scanned**: frontend
- **Files Scanned**:
  - `src/features/doula-dashboard/DoulaDashboard.tsx`
  - `src/features/doula-dashboard/components/ProfileTab.tsx`
  - `src/common/components/ui/tabs.tsx`
  - `.cursor/skills/sokana-backend-preflight-sync/backend-context.md`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- No API contract changes; only tab mount behavior in frontend UI.

### Drift Risks
- If tab content unmounts on navigation, any tab with fetch-on-mount can look like a full page reload.

### Compatibility Required
- Keep existing tab switching behavior while retaining mounted state for smoother UX.

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-03 (Remove business field from doula profile UX)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Remove `business` field from doula profile form and required-completion notification logic.
- **Repos Scanned**: frontend
- **Files Scanned**:
  - `src/features/doula-dashboard/components/ProfileTab.tsx`
  - `src/features/doula-dashboard/DoulaDashboard.tsx`
  - `.cursor/skills/sokana-backend-preflight-sync/backend-context.md`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- Profile update payload should continue using existing backend-supported keys without introducing new required fields.

### Drift Risks
- If frontend required field list diverges from visible form fields, users can be blocked by hidden requirements.

### Compatibility Required
- Keep profile completion checks aligned with the visible profile form fields.

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-03 (QuickBooks connect endpoint compatibility)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Diagnose and fix production QuickBooks connect failure showing `Cannot GET /quickbooks/auth/url`.
- **Repos Scanned**: both
- **Files Scanned**:
  - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/SKILL.md`
  - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/frontend-context.md`
  - `src/common/hooks/useQuickBooksIntegration/useQuickBooksIntegration.ts`
  - `src/api/quickbooks/auth/route.ts`
  - `src/api/quickbooks/auth/qbo.ts`
  - `src/features/integrations/QuickBooksConnect.tsx`
  - `src/api/http.ts`
  - `src/api/doulas/doulaService.ts`
  - `src/features/doula-dashboard/components/HoursTab.tsx`
  - `src/features/doula-dashboard/components/ClientsTab.tsx`
  - `src/features/doula-dashboard/components/ActivitiesTab.tsx`
  - `src/features/doula-dashboard/components/DocumentsTab.tsx`
  - `src/main.tsx`
  - `src/common/contexts/UserContext.tsx`
  - `src/common/components/routes/ProtectedRoutes.tsx`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- QuickBooks OAuth URL bootstrap should work across backend variants that expose either `/quickbooks/auth/url` or `/quickbooks/auth`.
- Frontend must continue to send session credentials for QuickBooks auth/status/disconnect calls.

### Drift Risks
- Environment drift between local and deployed backend routes can cause connect to fail for admins while other QuickBooks calls still work.

### Compatibility Required
- Keep current integration UX and token status checks unchanged while making auth URL bootstrap tolerant to route differences.

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-10 (Mandatory Doula Documents)
- **Task Intent**: End-to-end Mandatory Doula Documents (5 required docs, Supabase Storage, active-status gating).
- **Repos Scanned**: both
- **Contract**: Extend document API; add admin endpoints; enforce doc completeness before account_status=approved.

## Preflight 2026-03-10 (Doula headshot/profile picture upload)

- **Gate Result**: run_preflight
- **Task Intent**: Add ability for doulas to upload a headshot/profile picture.
- **Repos Scanned**: both
- **Files Scanned**: `src/api/doulas/doulaService.ts`, `src/features/doula-dashboard/components/ProfileTab.tsx`, backend doulaController.ts, cloudSqlTeamService.ts, supabaseUserRepository.ts
- **Context Updated**: yes
- **Contract Expectations**: New POST /api/doulas/profile/picture (multipart, profile_picture file); Cloud SQL doulas.profile_picture stores URL; GET /api/doulas/profile returns profile_picture from Cloud SQL when available.
- **Drift Risks**: None if migration and service layer updated in sync.
- **Action**: [x] Context updated, [x] Implementation complete

## Preflight 2026-03-10 (Doula assignments filter by year/quarter)
- **Gate Result**: run_preflight
- **Task Intent**: Add filter to view doula assignments by year or quarter in the Doulas Assignments tab.
- **Repos Scanned**: frontend
- **Files Scanned**: `src/features/hours/components/DoulaListPage.tsx`, `src/api/doulas/doulaDirectoryApi.ts`
- **Context Updated**: yes
- **Contract Expectations**: No backend changes. Existing `/api/doula-assignments` supports `dateFrom` and `dateTo`; frontend derives these from year/quarter selection.
- **Drift Risks**: None.
- **Action**: [x] Context updated, [x] Implementation complete

## Preflight 2026-03-11 (Doula headshot in admin profile + admin download)
- **Gate Result**: run_preflight
- **Task Intent**: Show doula headshot in admin doula profile (DoulaDetailPage) and allow admins to download profile pictures.
- **Repos Scanned**: both
- **Files Scanned**: `src/features/hours/components/DoulaDetailPage.tsx`, backend cloudSqlTeamService.ts, userController.ts
- **Context Updated**: yes
- **Contract Expectations**: `/clients/team/all` returns `profile_picture` for doulas. Frontend maps to Doula.profile_photo_url, passes to UserAvatar. Download is client-side (fetch blob, trigger download).
- **Drift Risks**: None. Profile picture URLs must be accessible for download.
- **Action**: [x] Context updated, [ ] Implementation started

## Preflight 2026-03-19 (Doula profile demographics)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Add gender, pronouns, multi-select race/ethnicity (required), optional other demographic text on doula Profile tab; persist via Cloud SQL + `/api/doulas/profile`.
- **Repos Scanned**: both
- **Files Scanned**:
  - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/frontend-context.md`
  - `/Users/jerrybony/Documents/GitHub/backend/src/controllers/doulaController.ts`
  - `/Users/jerrybony/Documents/GitHub/backend/src/services/cloudSqlTeamService.ts`
  - `src/api/doulas/doulaService.ts`
  - `src/features/doula-dashboard/components/ProfileTab.tsx`
  - `src/features/doula-dashboard/DoulaDashboard.tsx`
  - `src/features/doula-dashboard/doulaDemographics.ts`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- `GET/PUT /api/doulas/profile` profile object includes: `gender`, `pronouns`, `race_ethnicity` (string[]), `race_ethnicity_other`, `other_demographic_details` (strings; arrays empty when unset).
- `PUT` body accepts the same keys; `race_ethnicity` is sanitized server-side to allowed slugs (`backend/src/constants/doulaDemographics.ts`).
- Cloud SQL migration: `backend/src/db/migrations/add_doula_demographics_to_doulas.sql` adds columns to `public.doulas`.

### Drift Risks
- Deploying backend code without running the migration causes profile GET/UPDATE to error on missing columns.

### Compatibility Required
- Frontend tolerates missing demographic keys (treat as empty). Existing profile fields unchanged.

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-19 (Doula toggle: client-visible notes)

- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Doulas choose whether each activity/note is visible to the client; clients only receive entries explicitly marked visible (default hidden for legacy rows).
- **Repos Scanned**: both
- **Files Scanned**:
  - `/Users/jerrybony/Documents/GitHub/backend/src/controllers/clientController.ts`
  - `/Users/jerrybony/Documents/GitHub/backend/src/controllers/doulaController.ts`
  - `/Users/jerrybony/Documents/GitHub/backend/src/routes/clientRoutes.ts`
  - `/Users/jerrybony/Documents/GitHub/backend/src/mappers/ActivityMapper.ts`
  - `/Users/jerrybony/Documents/GitHub/backend/src/dto/response/ActivityDTO.ts`
  - `src/api/doulas/doulaService.ts`
  - `src/features/doula-dashboard/components/ActivitiesTab.tsx`
  - `src/features/client-dashboard/components/ClientProfileTab.tsx`
  - `src/api/clients/notes.ts`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations

- Activities stored in Cloud SQL `client_activities.metadata` (jsonb): `visibleToClient` boolean; default **false** when absent (clients see nothing for legacy rows).
- `POST /api/doulas/clients/:clientId/activities` accepts optional `visibleToClient` / `visible_to_client`; merged into metadata.
- `GET /clients/:id/activities` uses Cloud SQL (same as doula list); **client** role allowed when accessing own client id; response filtered to `visibleToClient === true` only for clients.
- Activity DTO may include `visible_to_client` and `metadata` for staff UIs.

### Drift Risks

- Prior `GET /clients/:id/activities` used Supabase repository while doula writes used Cloud SQL; aligning GET to Cloud SQL changes which rows appear in admin CRM if data was split.

### Compatibility Required

- Accept both `visibleToClient` and `visible_to_client` in JSON bodies.
- Frontend parses canonical `{ success, data }` for activities list where applicable.

### Action

- [x] Context updated before coding
- [x] Implementation started after preflight

## Preflight 2026-03-19 (Birth outcomes narrative + client portal Service Outcomes link)

### Preflight Entry Checklist
- **Gate Result**: `run_preflight`
- **Reason**: `preflight_required_every_task`
- **Task Intent**: Add doula-editable free-text Birth Outcomes near Admin Notes in lead profile; expose Service Outcomes link in client portal.
- **Repos Scanned**: both
- **Files Scanned**:
  - `/Users/jerrybony/Documents/GitHub/backend/src/repositories/cloudSqlClientRepository.ts`
  - `/Users/jerrybony/Documents/GitHub/backend/src/controllers/clientController.ts`
  - `/Users/jerrybony/Documents/GitHub/backend/src/constants/phiFields.ts`
  - `src/features/clients/components/dialog/LeadProfileModal.tsx`
  - `src/features/client-dashboard/ClientDashboard.tsx`
  - `src/domain/client.ts`, `src/api/dto/client.dto.ts`, `src/api/mappers/client.mapper.ts`
  - `src/common/utils/updateClient.ts`, `src/config/phi.ts`
- **Context Updated**: yes
- **Implementation Started After Gate**: yes

### Contract Expectations
- New column `birth_outcomes` (text) on `phi_clients`, writable via PUT `/clients/:id` operational path (`updateClientOperational`), **not** in `PHI_FIELDS` (avoids PHI broker dependency).
- GET `/clients/:id` (authorized) merges `birth_outcomes` from Cloud SQL user row into response as `birth_outcomes`.
- Frontend maps `birth_outcomes` ↔ `birthOutcomes` in domain; field is **not** listed in `PHI_KEYS` so `updateClient` sends it with other operational fields.
- Client portal: optional `VITE_CLIENT_PORTAL_SERVICE_OUTCOMES_URL` for external Service Outcomes link.

### Drift Risks
- Deploy order: run Cloud SQL migration before relying on the field; missing column yields update/read errors until migrated.

### Compatibility Required
- Additive field only; PHI broker unchanged.

### Action
- [x] Context updated before coding
- [x] Implementation started after preflight
