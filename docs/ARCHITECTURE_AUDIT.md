# Sokana CRM architectural audit

**Date:** 1 October 2026
**Scope:** Current single-organization doula CRM, assessed for technical debt and for what can be carried into a strictly isolated, HIPAA-oriented multi-tenant SaaS.

This workspace (`sokana-crm-frontend`) contains only the web client (`frontend-crm`). The API lives in the sibling repository the client already treats as canonical: `/Users/jerrybony/Documents/GitHub/backend`. Both were read for this audit. Older write-ups in this repo (`docs/CRM_COMPREHENSIVE_ANALYSIS.md`, parts of `docs/PRODUCTION_SPLIT_DB.md`, `docs/AUTH_ALIGNMENT_AUDIT.md`) describe earlier shapes of the system. Where they disagree with the code, this report follows the code.

Secret values from local `.env` files are not included. Those files exist on disk and are gitignored. They are not in the git index.

---

## How the system is split today

```text
Browser (Vite SPA, Cloud Run service sokana-front-end)
        |
        | REST JSON
        | cookie  OR  Supabase access token  OR  Firebase ID token
        v
Express API (Cloud Run service sokana-private-api, src/server.ts)
        |
        +-- Cloud SQL Postgres (database sokana_private) via node-pg
        |     phi_clients, doulas, admins, doula_assignments, hours,
        |     client_activities, payments, contracts (native), ...
        |
        +-- Supabase (Auth + leftover tables + document storage)
        |
        +-- Firebase / Identity Platform (optional second login)
        |
        +-- optional PHI broker (separate Express process, HMAC)
        |
        +-- Stripe, QuickBooks, SignNow, DocuSign, GCS, SMTP
```

There is no `tenant_id`, `organization_id`, or `org_id` anywhere under the backend `src` tree. Every query assumes one agency.

---

# 1. Backend architecture and data layer

## Core stack

| Layer | What is actually running |
| --- | --- |
| Language | TypeScript on Node 20, compiled with `tsc`. About 91 `.js` files still sit next to `.ts` sources. **82 path pairs** exist as both `.ts` and `.js` under `src/`. |
| HTTP | Express 4. Entry is `src/server.ts`. Production boot is `src/cloudrun.ts` (`node dist/cloudrun.js`). |
| Validation | Zod on some bodies (login, identity MFA). Not on every route. |
| Logging | Pino and `pino-http`, with a production console guard and a “safe” request logger meant to keep PHI out of logs. |
| HTTP hardening | `helmet`, `cookie-parser`, CORS allowlist, `trust proxy` = 1. |
| Integrations | `@supabase/supabase-js`, `firebase` + `firebase-admin`, `pg`, `stripe`, `intuit-oauth`, `@signnow/api-client`, `docusign-esign`, `@google-cloud/storage`, `nodemailer`, `multer`, `pdf-lib` / `pdfkit` / `docx`. |
| Deploy | Cloud Build runs `npm test` and a security-smoke Jest file before the image is pushed. Cloud Run. |
| Size | About 368 non-test source files, about 60,000 lines, plus 122 markdown docs and about 198 scripts. |

There is a second process in the same repo: `phi-broker/`. It is a small Express app whose only job is signed read/update of client PHI. The main API can call it. The main API also queries the same tables itself.

The README at the backend root is still the 2024–2025 DISC course template (`src/server.js`, “Supabase is our database”). The layout comment in that README does not match `src/`.

## Database and ORM

**There is no ORM.** No Prisma, TypeORM, Drizzle, or Knex. Data access is hand-written SQL through a single `pg.Pool` in `src/db/cloudSqlPool.ts`, plus the Supabase JS client for auth, some user/contract rows, and file storage.

The pool reads `CLOUD_SQL_HOST`, `CLOUD_SQL_DATABASE`, `CLOUD_SQL_USER`, and `CLOUD_SQL_PASSWORD`. One application role sees every row. SSL is configurable; Unix-socket Cloud Run connections disable TLS on purpose.

### Where data actually lives

Wired in `src/index.ts`:

| Concern | Store used by the running composition root |
| --- | --- |
| Client records | Cloud SQL `phi_clients` via `CloudSqlClientRepository` |
| Intake submission | Cloud SQL `phi_clients` insert inside `RequestFormRepository` (the class still accepts a Supabase client) |
| Doula–client assignments | `CloudSqlDoulaAssignmentService` |
| Activities | `CloudSqlActivityRepository` (constructor still takes Supabase) |
| Users / staff identity | `SupabaseUserRepository` against Supabase |
| Auth session check | Supabase Auth and/or Firebase Admin, depending on `AUTH_PROVIDER` |
| Doula and client documents | Supabase storage repositories |
| Legacy contracts | `SupabaseContractService` |
| Native contracts | `src/features/contracts/` on Cloud SQL, behind `NATIVE_CONTRACTS_ENABLED` |
| Sensitive field updates | Optional HMAC call to the PHI broker. If `PHI_BROKER_URL` or the shared secret is unset, `phiBrokerService` skips the call. |

`CloudSqlClientRepository` is written as a stack of column-list fallbacks (`phone` vs `phone_number`, lifecycle columns, QuickBooks columns, birth-outcome columns). A missing column is caught and the query is retried with an older SELECT. That is schema drift encoded in the repository.

### Core model (as the app uses it)

Parent record is `public.phi_clients` (UUID `id`). Documented children that reference it include `phi_notes`, `phi_contracts`, `phi_events`, `phi_invoices`, `phi_time_track`, and `payments`. Operational tables the services query by name include `doulas`, `admins`, `doula_assignments`, `hours`, `client_activities`, `client_documents`, `client_payment_methods`, `payment_schedules`, `payment_installments`, `customers`, and the native signing tables (`contract_template_versions`, `signing_invitations`, `contract_signatures`, `contract_events`, `contract_outbox`).

Auth users are not a foreign key inside Cloud SQL. Comments and columns such as `user_id` / `doula_id` point at Supabase `auth.users` or at `public.doulas`. There is no enforced tenant key on any of these relationships.

A second, older schema still exists in SQL files: `clients`, `client_info`, `users`, `assignments`, `requests`, `contracts`. `migrations/step3_create_cloudsql_schema.sql` even `DROP`s `clients` and recreates a unified table. The running repository does not use that table. It uses `phi_clients`. Schema history is a pile of overlapping scripts:

- 89 SQL files in `src/db/migrations/`
- 10 SQL files in `migrations/`
- 4 SQL files in `supabase/migrations/`

Several contract migrations recreate `contracts` / `contract_payments` in incompatible ways (`create_contracts_table.sql`, `create_contracts_table_clean.sql`, `create_contracts_table_fixed.sql`, `migrate_contracts_preserve_ids.sql`). These are manual scripts, not a single ordered migrator.

### Tenant isolation and RLS

**No tenant isolation.**

Row Level Security appears only on legacy Supabase-oriented scripts:

- `public.assignments`
- `public.client_info`
- `public.users`
- `doula_documents`
- `requests`

No migration in this repo enables RLS on `phi_clients` or the other Cloud SQL PHI tables. The API connects as a database user that can `SELECT * FROM phi_clients`. Postgres RLS would not constrain that user unless policies were forced and the role was subject to them. Neither is present.

The PHI broker (`phi-broker/src/index.ts`) verifies an HMAC signature and then reads Cloud SQL. It is not Row Level Security, and it is not mandatory. List and detail reads in `CloudSqlClientRepository` go straight to `phi_clients`. An admin CSV export serializes every column of every row.

`supabaseAssignmentRepository.ts` still contains a fallback that, on an RLS denial, retries the insert with the service-role client. The composition root no longer uses that class for assignments, but the bypass is still in the tree.

Doula visibility is the only record-level rule in the live client repository: a doula’s list is filtered with `doula_assignments` where `status = 'active'`. That is assignment scoping inside one organization. It is not a tenant boundary.

## API design

REST JSON over Express. No GraphQL. No tRPC.

Routes are mounted many times on purpose. From `src/server.ts`:

- Auth: `POST /login` (deprecated alias) and `/auth/*`
- Clients: `/clients`, `/client`, `/api/clients`, `/api/client` (the singular mounts are marked deprecated and still live)
- Doulas: `/api` (`doulas.ts`) and `/api/doulas`
- Contracts: `/contracts`, `/api/contracts`, `/api/contract`, `/api/contract-signing`, `/api/pdf-contract`, and, when the flag is on, native `/api/contracts` plus `/signing`
- Money: `/api/payments`, `/api/invoices`, `/api/financial`, `/api/billing`, `/api/payment-methods`, and QuickBooks routes only if `FEATURE_QUICKBOOKS` is true
- Public intake: `POST /requestService/requestSubmission`
- Health: `GET /health` (no dependency checks)

The same router is often mounted on two prefixes, so authorization has to be correct inside the router, not at the mount.

Response shapes are inconsistent. Newer handlers use `{ success, data }`. Older ones return raw arrays or `{ success, clients | hours | activities | profile }`. The frontend still normalizes all of those.

### Where business logic lives

The intended layering is visible in `src/index.ts`: repositories, services, use cases, controllers. It was not finished.

| Layer | Reality |
| --- | --- |
| `src/routes/` | Route tables. Most client routes call `authMiddleware` then `authorizeRoles`, then a controller method. |
| `src/controllers/` | Where most behavior sits. `clientController.ts` is **3,444 lines**. `doulaController.ts` is **1,793**. `authController.ts` is 587. |
| `src/usecase/` | Thin wrappers for auth, users, clients, contracts. Easy to bypass because controllers also call repositories and services directly. |
| `src/services/` | Stripe, SignNow, DocuSign, email, QuickBooks, portal invites, payment schedules, Identity Platform. Several exceed 600–1,000 lines, and SignNow exists as both `.ts` and `.js`. |
| `src/features/` | The only place that looks like a module boundary: `contracts` (status machine, signing sessions, outbox, PDF), `intake` (abuse limits, DTO), plus smaller assignment and invoice folders. Native contracts are feature-flagged. |
| `phi-broker/` | Separate deployable. Two POST routes. |

`POST /auth/signup` is public. Intake is public and is wrapped by `protectPublicIntakeEarly` (honeypot, IP and email rate limits, idempotency). Debug routes mount only when `NODE_ENV` is not production and `ENABLE_DEBUG_ENDPOINTS=true`.

## Authentication and authorization

Three login systems are implemented at once.

**Backend** `AUTH_PROVIDER` defaults to `supabase`. Allowed values: `supabase`, `identity_platform`, `dual`.

**Frontend** `VITE_AUTH_MODE` accepts `supabase`, `cookie`, or `identity`. If the variable is missing, `src/api/config.ts` defaults to **`cookie`**. Production Cloud Build sets **`identity`**. `.env.example` also says `identity`. `docs/PRODUCTION_SPLIT_DB.md` still says the default is Supabase. Those four sources disagree.

Token acceptance in `authMiddleware.ts`, in order:

1. `X-Session-Token`
2. `Authorization: Bearer`
3. Cookie `sb-access-token`
4. Legacy `session` cookie

Query-string tokens are counted and rejected. In `identity_platform` or `dual` mode the token is checked with Firebase Admin first, then Supabase if that fails. Inactive accounts are rejected with 403.

After authentication, `authorizeRoles` compares `req.user.role` (lowercased) to a hard-coded list on that route. Roles in use: `admin`, `doula`, `client`, `billing`. There is no permission table, no role hierarchy, and no organization scope. A billing user is a global role, not “billing for tenant A”.

Google OAuth routes still exist on `/auth/google` and `/auth/callback`. Identity Platform adds `/auth/session`, `/auth/mfa/verify`, and `/auth/mfa/resend` (email OTP).

Frontend route guards (`ProtectedRoutes.tsx`) repeat the same four roles: private session, staff CRM, client portal, billing portal. They trust `/auth/me`. They are UX gates. The API is the real check, and only on routes that remember to call both middlewares.

`contractPaymentRoutes.ts`, `docusignRoutes.ts`, and `stripePaymentRoutes.ts` do not reference `authMiddleware`. They are small and are not the mounts in `server.ts` (payments and SignNow are). `requestRoute.ts` is intentionally unauthenticated.

## Error handling and security

**Errors.** Controllers and middleware usually return `{ error, code }` using `ApiErrorCode`. The process-level handler in `server.ts` returns the exception message outside production and the string `Internal Server Error` in production. Unhandled PHI-broker failures log an error code and a request id, not the body. A `check:sensitive-logging` script exists on the frontend, and the backend has `securityLogging` and `hipaaP0Containment` tests. `console.log` is still used, including the RLS service-role retry.

**Secrets in git.** A pattern scan of `src`, `scripts`, `phi-broker/src`, and the frontend `src` tree found no live Stripe secret keys, private-key blocks, or AWS keys. The Stripe publishable key in `src/features/payments/README.md` is the placeholder `pk_test_your_stripe_publishable_key_here`.

What is committed:

- `frontend-crm/cloudbuild.yaml` hardcodes the Firebase **web** API key, auth domain, and project id (`sokana-private-data`) as Cloud Build substitutions. A Firebase web API key is meant to ship in a browser bundle. It is still an unrestricted client credential if the Google Cloud key has no HTTP-referrer and API restrictions, and it should be injected at build time rather than stored in the repo.
- `src/config/env.ts` falls back to the same GCP project id when `IDENTITY_PLATFORM_PROJECT_ID` is unset.
- `docs/CLOUD_SQL_SOKANA_PRIVATE_SCHEMA.md` names a personal mailbox as the admin login of record.
- `docs/PRODUCTION_SPLIT_DB.md` embeds a production Cloud Run hostname and a `gcloud` snippet for `allUsers` invoker on the API.

Local `backend/.env`, `frontend-crm/.env`, and `frontend-crm/.env.local` exist and are gitignored. `.env.example` files contain names and placeholders only. This audit did not print their values.

**Structural security gaps that matter for a future SaaS:**

1. One database role can read and export all PHI. RLS is not on those tables. The broker is optional.
2. The browser stores the API session token in `localStorage` under `sokana.session-token` (`src/api/sessionAccessToken.ts`), including a migration from `sessionStorage`. Any XSS can read it. The PHI notes in `src/config/phi.ts` forbid persisting client PHI to web storage. They do not cover this token.
3. Auth mode defaults differ between API (`supabase`), SPA code (`cookie`), and production build (`identity`). A mismatched deploy will either reject sessions or accept a provider the other side does not expect.
4. Public `POST /auth/signup` can create accounts if the controller does not independently restrict who may register. Role assignment must be reviewed before any internet-facing multi-tenant use. This audit did not treat that route as safe.
5. Duplicate mounts (`/client` vs `/clients` vs `/api/clients`) make it easy for a new handler to ship on one prefix without the middleware used on another.
6. CORS allows requests that send no `Origin`.
7. Service-role Supabase client is the default backend client (`src/supabase.ts` uses the service-role key). That is normal for a server. Combined with the RLS-bypass retry, it means Supabase policies are not a reliable control.
8. Single-tenant vendor accounts (one Stripe account, one QuickBooks connection, one SignNow/DocuSign account, one GCS bucket `sokana-private-documents`) cannot isolate customer data or billing.

---

# 2. Frontend architecture and UI layer

## Core stack

| Piece | Choice |
| --- | --- |
| UI | React 18 |
| Language | TypeScript 5.7 |
| Build | Vite 6 (`npm run dev` / `vite build`). Production static server is `serve`. |
| Routing | React Router 7, client-side only. This is not Next.js. There is no server-rendered data layer. |
| Styling | Tailwind CSS 4, `class-variance-authority`, `tailwind-merge` |
| Design primitives | shadcn-style components on Radix (`components.json`, 34 files in `src/common/components/ui/`) |
| Also loaded | HeroUI (`HeroUIProvider` in `main.tsx`), styled-components on auth and nav shells, Framer Motion, Plate rich text, `react-pdf`, TanStack Table, dnd-kit |
| Forms | React Hook Form, Zod, `@hookform/resolvers` |
| Dates | both `date-fns` and `react-datepicker` / `react-day-picker` |
| Toasts | both Sonner and `react-toastify`, mounted together in `App.tsx` |
| Deploy | Cloud Build → Cloud Run (`sokana-front-end`), not Vercel, despite older docs |

About 330 production source files, about 62,000 lines. Node 20.

`VITE_*` variables are baked in at build time (`VITE_API_BASE_URL` or `VITE_APP_BACKEND_URL`, `VITE_AUTH_MODE`, Firebase web config, optional Supabase URL and anon key). `src/api/http.ts` throws if a production build still points at localhost.

## State management

No Redux, Zustand, or TanStack Query.

Global session state is one React context: `UserContext` (`src/common/contexts/UserContext.tsx`). It owns login, MFA verify/resend, logout, `/auth/me`, idle timeout, and the three auth modes. Firebase and Supabase clients are imported there.

Other contexts are feature-local: clients, search, request form, contract templates, hours “users”, table UI, sidebar. Several names collide (`UsersContext` exists under `common/contexts`, `features/clients/context`, and `features/hours/context`). `TemplatesContext` exists twice, under clients and under contracts.

SWR is used in two dashboard hooks (`useDashboardStats`, `useDueDateCalendar`) and nowhere else as a data layer.

Most screens keep their data in `useState` inside very large components. There is no shared cache, so two pages that show the same client can disagree until both refetch.

## Data fetching

`src/api/http.ts` is the intended client: `buildUrl`, `get` / `post` / `put` / `del`, and `fetchWithAuth`. It attaches cookies or bearer headers from `API_CONFIG.authMode`, parses JSON, and strips HTML error bodies so Express 404 pages do not render in the UI.

Adoption is partial:

- 53 files import the HTTP module
- `fetchWithAuth` appears about 173 times
- raw `fetch(` remains in 10 files (about 20 call sites)

Services are split by area under `src/api/` (`clients`, `doulas`, `quickbooks`, `financial`, DTOs, mappers) and also under `src/services/` and `src/common/utils/` (`updateClient.ts`, `deleteClient.ts`, `createContract.ts`). Doula API code alone is 1,304 lines in `doulaService.ts`. The client is responsible for tolerating several response envelopes. That tolerance is documented as a permanent compatibility layer in `.cursor/skills/sokana-backend-preflight-sync/backend-context.md`.

PHI display rules live in `src/config/phi.ts`. The clients list is explicitly allowed to show name and email when the API sends them. Redaction helpers exist and are documented as the wrong tool for that list. Enforcement is therefore “trust the list endpoint”, which is acceptable only while one agency and one authorization implementation own that endpoint.

## Component structure

There is a real primitive layer (button, dialog, form, table, sidebar, and the rest of the shadcn set). Feature UI is not built from small domain components. The largest files are pages and dialogs that mix fetching, validation, PHI fields, and layout:

| File | Lines |
| --- | --- |
| `src/features/clients/components/dialog/LeadProfileModal.tsx` | 3,873 |
| `src/features/request/Step3Home.tsx` | 2,623 |
| `src/features/hours/components/DoulaListPage.tsx` | 2,535 |
| `src/features/client-dashboard/components/ClientProfileTab.tsx` | 2,419 |
| `src/features/doula-dashboard/components/ActivitiesTab.tsx` | 1,848 |
| `src/features/clients/components/dialog/EnhancedContractDialog.tsx` | 1,487 |
| `src/features/teams/teams.tsx` | 1,390 |

Feature folders (clients, request, pipeline, contracts, hours, billing, billing-portal, doula-dashboard, client-dashboard, payments, teams, public-signing, auth) are a reasonable map of the product. Inside them, duplication is ordinary: client profile fields are edited in the lead modal, the client portal tab, the request wizard, and the doula activity views, each with its own shape conversion (`first_name` vs `firstname` vs `firstName`).

Styled-components remain on the login/nav shell while the CRM shell is Tailwind. HeroUI is provided globally and is not the component system the CRM screens use. Two toast systems means success and error feedback do not look or behave the same.

## Routing

All routing is client-side in `src/Routes.tsx`.

Public:

- `/login` and related auth routes, inside `PublicOnlyRoute`
- `/auth/set-password`, `/auth/client-login`
- `/signing` and `/signing/:token` (public contract signing; `UserProvider` is skipped for `/signing/`)
- request form routes
- `/contract-signed`

Authenticated, inside `DashboardLayout` + `PrivateRoute`:

- Billing-only users are redirected to `/billing/contracts`
- Client portal: `/profile`, `/billing`
- Staff CRM: `/contracts`, pipeline, clients, payments, hours, teams, inbox, QuickBooks, invoices, financial, demographics, doula dashboard

`StaffCrmRoute` blocks clients and billing-only users from the CRM. `BillingPortalRoute` blocks clients. These checks use the role string from session state. Deep links do not have a server render to enforce them. A user who is not staff simply does not get the API data if the backend route is protected.

There is no tenant segment in the URL (`/:orgSlug/...` does not exist).

---

# 3. Testing and QA

## Frameworks that are configured

| Side | Unit / integration | End to end | CI |
| --- | --- | --- | --- |
| Backend | Jest 29, ts-jest, Supertest. `npm test`, `npm run test:coverage`, `npm run test:security-smoke`. | No Playwright or Cypress on the API. | Cloud Build `test-gate` runs the full Jest suite and the security smoke file before image push. |
| Frontend | Vitest 3, Testing Library, jsdom. Coverage provider is v8, with no threshold. | Playwright (`e2e/`, nightly cron plus PR smoke). | `.github/workflows/tests.yaml` runs Vitest on every PR/push and Playwright smoke on PRs. A nightly schedule runs a broader E2E pass. `lint.yaml` lints. |

Backend `package.json` also has many hand-run scripts (`create-admin`, `test:doula`, endpoint verifiers). Those are not the automated suite.

Neither Jest nor Vitest config sets a coverage minimum. `collectCoverageFrom` on the backend excludes `server.ts` and `index.ts`.

## Coverage reality

Counts below are files on disk, not a coverage report. No percentage is claimed.

| | Test files | Approx. test lines | Production source |
| --- | --- | --- | --- |
| Backend | 83 | ~14,200 | ~60,000 lines / 368 files |
| Frontend | 92 (unit + Playwright specs) | ~17,300 | ~62,000 lines / 330 files |

Backend tests are concentrated and useful: auth transport, authorization matrix, HIPAA logging containment, intake abuse, client PHI endpoint behavior, billing routes, webhook/OAuth checks, payment-schedule SQL, and a fairly thorough `src/features/contracts/` suite (status machine, signing manifest, outbox, PDF, routes). That contracts module is the best-tested area in the API.

Frontend tests cluster on the request form, public signing, portal eligibility, a set of ticket-driven doula/client behaviors, payment rules, and route guards. Playwright covers specific tickets (notes visibility, birth outcomes, profile photo, assignments) more than a full product crawl.

**Critical paths with no dedicated test file for the implementation that users actually touch:**

- `LeadProfileModal.tsx` (3,873 lines), the main client record editor
- `clientController.ts` (3,444 lines) as a unit; pieces are covered indirectly by endpoint tests, the file itself is not
- `Step3Home.tsx`, `DoulaListPage.tsx`, `ClientProfileTab.tsx`, `ActivitiesTab.tsx`, `teams.tsx`
- SignNow and DocuSign service implementations (large, dual `.js`/`.ts`)
- The PHI broker process (no `*.test.ts` under `phi-broker/`)
- Cross-mode auth: production `identity` versus the code default `cookie` versus backend default `supabase` is not one tested matrix across both repos
- Multi-tenant cases: none exist, because the concept does not exist

The suites are regression nets for the current single-agency product. They are not a proof of isolation, least privilege, or PHI minimization.

---

# 4. Executive summary: debt and multi-tenant readiness

## What this system is

A single-agency operations app for one doula collective. It covers intake, a client pipeline, assignments, hours, contracts and signing, Stripe and QuickBooks billing, and a small client portal. HIPAA shows up as a set of patches on that app: safe logging, a PHI field list, an optional broker, assignment filters, and tests that forbid some log lines. It is not a multi-tenant architecture with a compliance boundary.

## Top three architectural bottlenecks

### 1. Three data planes, one product

Cloud SQL holds PHI and operations. Supabase still holds auth users, documents, and legacy contract/user repositories. Firebase is a third identity store. The PHI broker is a fourth hop that the API is allowed to skip. Repositories accept the wrong client “just in case”, and `phi_clients` queries retry with older column lists when migrations were not applied. Eighty-two TypeScript/JavaScript duplicates and three generations of `CREATE TABLE` for contracts mean a change can land in the file that is not the one the server runs.

This is the spaghetti. Business rules are not in one module. They are in whichever store answered last.

### 2. God objects on both sides of the wire

`clientController.ts` (3,444) and `LeadProfileModal.tsx` (3,873) are the system. Route aliases (`/client`, `/clients`, `/api/client`, `/api/clients`) and three response envelopes spread the same client concept across controllers, use cases, mappers, and feature dialogs. A field rename (birth location, home type, insurance) already requires paired backend prompts in `docs/` because the client and the SQL column list drift independently.

### 3. Identity and authorization were never reduced to one model

Cookie session, Supabase JWT, and Firebase email-OTP all work, with different defaults in code, example env, Cloud Build, and docs. Authorization is a string compare against `admin | doula | client | billing` on each route, copied again in the SPA. There is no tenant, so there is nowhere to put “this user is an admin of organization A and a doula of organization B”. Session tokens in `localStorage` and a service-role database login mean the current controls do not survive an untrusted multi-customer deployment.

## What a strictly isolated multi-tenant SaaS would have to replace

Adding `organization_id` to `phi_clients` and filtering in the repository would not produce isolation. The privileged Postgres role, the optional broker, the Supabase service role, the shared Stripe/QuickBooks/SignNow accounts, the shared GCS bucket, and the global role string would all still see across customers. HIPAA expects access control, audit, minimum necessary, and a defined boundary for ePHI. This codebase’s boundary is “the one Cloud SQL database”.

**Rewrite. Do not retrofit.**

| Area | Verdict |
| --- | --- |
| Database, migrations, and every repository | **New.** One tenancy model (row-level with forced RLS and a non-owner role, or schema/database per tenant). One migration history. No column-fallback queries. PHI tables are not readable by the application role without a tenant predicate. |
| PHI broker vs direct SQL | **Pick one enforcement point and delete the other path.** Today both exist and the direct path wins. |
| AuthN | **New.** One identity provider. No parallel Supabase and Firebase sessions. No long-lived API token in `localStorage`. Staff and portal users are members of a tenant, not global roles. |
| AuthZ | **New.** Tenant-scoped roles and assignment checks in one policy layer, applied once, not copied onto every mount and every React guard. |
| Public signup and intake | **New.** Signup creates a tenant or accepts an invite. Intake writes only into that tenant. Current public `POST /auth/signup` cannot be reused as-is. |
| Stripe, QuickBooks, SignNow, DocuSign, GCS, email | **New per tenant** (Connect-style or equivalent isolated accounts, per-tenant buckets and webhook secrets). The current single-org clients are not salvageable as shared services. |
| Express route table | **Replace the alias surface.** A versioned API with one prefix. The native `src/features/contracts/` module is the only backend package shaped well enough to port as a design, and even that is single-tenant. |
| Frontend data layer | **New client** against the new API: one auth mode, one cache, no envelope guessing. Screen flows can be copied. The 2,000–4,000 line dialogs should not be moved. |
| Logging, audit, exports | **New.** Admin “export every column of `phi_clients`” is a single-tenant operator tool. A SaaS needs tenant-scoped audit of who read which record. |

## What can be salvaged

Use these as specifications and as UI material, not as the platform:

- **Product workflows:** public intake, pipeline statuses, doula assignment, hours, client vs staff vs billing portals, contract send/sign/pay. The ticket tests and Playwright specs are a behavioral spec for that product.
- **Domain language:** client, doula, assignment, hour, contract, installment, portal invite. The Zod intake DTO and payment-rule helpers are small enough to reimplement cleanly.
- **`src/features/contracts/` on the backend:** status machine, signing session, outbox, and its tests. Port the ideas after tenancy and storage are decided. Do not mount it beside the legacy SignNow controllers again.
- **Security work that is already pointed the right way:** helmet, CORS allowlist, webhook signature checks, intake rate limits, production error redaction, inactive-account denial, sensitive-log tests. Keep the requirements. Reimplement them on the new request path.
- **Visual primitives:** the Radix/shadcn set, Tailwind tokens, and the route map in `Routes.tsx` as a screen inventory.
- **Operational knowledge in `docs/`:** field lists for insurance, birth location, and home type. Treat January 2025 architecture docs as historical.

## Effort

For a strictly isolated, HIPAA-oriented multi-tenant product, plan on a **new backend and a new data model**, with the current SPA used as a screen-by-screen reference. A realistic sequence is: tenancy and identity first, then client/intake, then assignments and hours, then contracts and payments with per-tenant vendors. The existing API and SQL cannot be the substrate of that sequence.

Carrying the current repositories forward and “adding tenants later” would preserve the three-database split, the god controllers, and a database role that can read every patient row. That is the debt. The salvage value is the product behavior and the small modules that already have tests, not the persistence and auth stack.
