# Production readiness: split-db (PHI vs non-PHI) architecture

This doc explains how the frontend is production-ready for the split-db backend (Supabase operational + Cloud SQL PHI broker), auth modes, PHI safety, and where to set env vars.

## Supabase session token on API requests

The frontend **reads the Supabase session after sign-in** and **attaches it to all API requests** that go through the central HTTP client (`src/api/http.ts`):

1. **Read token:** `supabase.auth.getSession()` → `session?.access_token`.
2. **Attach to requests:** Every `get` / `post` / `put` / `del` from `src/api/http.ts` adds:
   - `Authorization: Bearer <token>`
   - `X-Session-Token: <token>` (so backend can accept either).
3. **Persist and refresh:** Supabase client uses `persistSession: true` and `autoRefreshToken: true`; `getSession()` returns the current (possibly refreshed) session on each request.

All calls that use the central client (e.g. `GET /clients`, `GET /clients/:id`, `PUT /clients/:id` from `src/api/services/clients.service.ts`) automatically send the token when the user has a Supabase session.

## Auth mode (production)

Controlled by **`VITE_AUTH_MODE`**:

- **`supabase`** (default): Frontend calls `supabase.auth.getSession()` and attaches `session.access_token` as `Authorization: Bearer` and `X-Session-Token`. Use when the Cloud Run backend validates Bearer/Supabase JWT. No need to set this on Vercel if you use Supabase for staff auth.
- **`cookie`**: Use only when the backend does **not** accept Bearer and relies on cookies. Frontend uses `credentials: 'include'` and does **not** send a token. Set `VITE_AUTH_MODE=cookie` in env.

## List vs detail data types (PHI leakage prevention)

- **List (GET /clients):** Backend returns **non-PHI** list items. The frontend treats list data as **ClientLite** (see `src/domain/client.ts`): id, name, status, serviceNeeded, dates, portal fields only. No phone, email, address, DOB, or other PHI in list responses.
- **Detail (GET /clients/:id):** Backend returns merged detail when the user is authorized (broker overwrites Supabase for PHI fields). The frontend may display PHI **only** in the detail view (e.g. Lead Profile modal) and only when the data came from the detail endpoint and the user role is admin/staff.
- **Defensive guard:** When rendering list rows, the app runs `assertNoPhiInListRow()` (see `src/config/phi.ts`). If any PHI key is present in list data (e.g. backend misconfiguration), values are redacted to `[redacted]` and never logged.

PHI keys are centralized in `src/config/phi.ts` (`PHI_KEYS`). List table data is passed through the guard in `src/features/clients/Clients.tsx` before being sent to the table.

## Data caching policy

- **No persistence of client detail to storage:** The app does not write client/lead detail objects (or any PHI) to `localStorage` or `sessionStorage`. Contract verification and other non-PHI data may still use storage where appropriate.
- **SWR/React Query:** If you add caching for `GET /clients/:id`, use a short cache time (e.g. 1–5 min) and ensure PHI is not written to disk (e.g. no persist plugin for detail endpoints).

## Environment variables (where to set)

Set these in your hosting provider (Vercel, Netlify, etc.) for production:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes (prod) | Cloud Run API base URL (e.g. `https://your-service-xxx.run.app`). Fallback: `VITE_APP_BACKEND_URL`. |
| `VITE_APP_BACKEND_URL` | Alternative | Same as above; used if `VITE_API_BASE_URL` is not set. |
| `VITE_APP_ENV` | Recommended | `production` \| `staging` \| `development`. Drives `isProd` and logger behavior. |
| `VITE_AUTH_MODE` | Optional | `supabase` (default) or `cookie`. Default sends Supabase token; set `cookie` only if backend uses cookies only. |

Optional:

- `VITE_SMOKE_CLIENT_ID`: Client UUID for smoke test `GET /clients/:id` when running `npm run smoke:api`.

### Vercel (deploy after frontend changes)

1. **Environment variables:** Project → Settings → Environment Variables. Add at least:
   - `VITE_API_BASE_URL` or `VITE_APP_BACKEND_URL` = your Cloud Run API URL.
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (required for Supabase session token).
   - Optionally `VITE_AUTH_MODE=supabase` (this is the default; set only if you need to override).
2. **Commit and push** your frontend changes; Vercel will redeploy. The production app will then send the Supabase token with API calls; the backend will accept `Authorization: Bearer` or `X-Session-Token`.

### Netlify

Site → Site configuration → Environment variables. Add each variable.

### Local development

Use `.env.local` (or `.env`) with `VITE_APP_BACKEND_URL=http://localhost:5050`, `VITE_AUTH_MODE=cookie`, and `VITE_APP_ENV=development`. Do not commit `.env.local` with secrets.

## Production checklist and smoke test

- **Checklist:** Run `npm run check:prod` before deploy. Ensure `VITE_API_BASE_URL` (or `VITE_APP_BACKEND_URL`) and `VITE_AUTH_MODE` are set when running in production. Example:  
  `VITE_API_BASE_URL=https://api.example.com VITE_AUTH_MODE=cookie npm run check:prod`
- **Smoke test:** Run `npm run smoke:api` to call GET /health, GET /clients, and optionally GET /clients/:id (set `VITE_SMOKE_CLIENT_ID`). Example:  
  `VITE_API_BASE_URL=https://api.example.com npm run smoke:api`

No debug endpoints were added. The frontend does not read HttpOnly cookies via JavaScript.
