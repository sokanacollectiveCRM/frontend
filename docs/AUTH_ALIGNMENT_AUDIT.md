# Frontend Auth Alignment Audit

Audit date: 2025-02-09. Aligns with backend contract:

- **Header**: `X-Session-Token: <token>` or `Authorization: Bearer <token>`
- **Cookie**: `sb-access-token=<token>`

---

## 1. Auth mode

| Item | Status | Details |
|------|--------|---------|
| Where auth mode is decided | OK | `src/api/config.ts`: `getAuthMode()` reads `import.meta.env.VITE_AUTH_MODE` |
| Default when unset | OK | Default is `'cookie'` (line 9: `return 'cookie'`) |
| Type | OK | `AuthMode = 'supabase' | 'cookie'` |

---

## 2. Login flow

| Item | Status | Details |
|------|--------|---------|
| Cookie mode login | OK | `UserContext.login()` calls `POST /auth/login` via `fetch(buildUrl('/auth/login'), { method: 'POST', credentials: 'include', ... })` |
| Supabase mode login | OK | Uses `supabase.auth.signInWithPassword({ email, password })` then `checkAuth()` |
| Login fetch credentials | OK | Cookie mode uses `credentials: 'include'` |

---

## 3. API client

| Item | Status | Details |
|------|--------|---------|
| Cookie mode – central client | OK | `src/api/http.ts` `getRequestAuth()` returns `credentials: 'include'`, applied in `requestLegacy` / `requestCanonical` |
| Supabase mode – central client | OK | `getRequestAuth()` uses `getAuthToken()` (Supabase `session.access_token`) and sets `Authorization: Bearer <token>` and `X-Session-Token: <token>`; `credentials: 'omit'` |
| Direct fetches | Fixed | Many modules used raw `fetch()` without auth. Now use `fetchWithAuth()` or central `get`/`post`/`put`/`del` where updated (see below). |

---

## 4. Central HTTP client

| Item | Status | Details |
|------|--------|---------|
| Shared wrapper | OK | `src/api/http.ts`: `get`, `post`, `put`, `del`, `buildUrl`, and (new) `fetchWithAuth` |
| Auth injection | OK | `getRequestAuth()` used by all request paths; cookie → `credentials: 'include'`, supabase → Bearer + X-Session-Token |
| Direct fetch bypass | Mitigated | `main.tsx` patches `window.fetch` to default `credentials: init?.credentials ?? 'include'`, so unpatched fetches still send cookies in cookie mode. Prefer `fetchWithAuth` or central client so supabase mode gets Bearer. |

---

## 5. `/auth/me`

| Item | Status | Details |
|------|--------|---------|
| Cookie mode | OK | `UserContext.checkAuth()` uses `fetch(buildUrl('/auth/me'), { credentials: 'include' })` |
| Supabase mode | OK | Uses `get<User>('/auth/me')` (central client sends Bearer + X-Session-Token) |

---

## 6. Cross-origin (production)

| Item | Status | Details |
|------|--------|---------|
| Cookie mode | Backend/CORS | Backend must set `Set-Cookie` with `SameSite=None; Secure` and CORS `Access-Control-Allow-Credentials: true` and allow frontend origin. Frontend uses `credentials: 'include'`. |
| Bearer mode | Backend/CORS | CORS must allow frontend origin; no credentials needed. |

---

## Changes made (this audit)

1. **`src/api/http.ts`**
   - Exported `getRequestAuth()`.
   - Added `fetchWithAuth(url, init)` so any direct backend fetch can get cookie or Bearer + X-Session-Token by auth mode.

2. **`UserContext.tsx`**
   - `requestPasswordReset` and `updatePassword` now use `fetchWithAuth(buildUrl(...), ...)` so session (cookie or Bearer) is sent when backend requires it.

3. **`ClientContractsTab.tsx`** and **`ClientPaymentHistoryTab.tsx`**
   - Replaced raw `fetch(VITE_APP_BACKEND_URL/...)` with `fetchWithAuth(buildUrl('/api/clients/me/contracts'|'.../payments'), ...)` so cookie or Bearer is sent.

4. **`useClientProfileData.ts`**
   - Replaced raw `fetch(.../clients/${clientId}?detailed=true)` with `fetchWithAuth(buildUrl(\`/clients/${clientId}\`, { detailed: true }))`.

5. **`utils/paymentApi.ts`**
   - `fetchPaymentDetails` and `createPaymentIntent` now use `fetchWithAuth(buildUrl(...), ...)`.

6. **`common/utils/createContract.ts`**
   - All backend fetches (generate-contract, postpartum/calculate, stripe create-payment, contracts) now use `fetchWithAuth(buildUrl(...), ...)`.

---

## Remaining raw `fetch` usage

Many modules still use raw `fetch()` with `credentials: 'include'` (or rely on `main.tsx`’s global default). For **cookie** mode this is fine. For **supabase** mode they do **not** send Bearer/X-Session-Token unless they use the central client or `fetchWithAuth`. Consider migrating remaining backend calls to:

- `get`/`post`/`put`/`del` from `@/api/http` when the backend returns the canonical `{ success, data }` shape, or  
- `fetchWithAuth(buildUrl(path), init)` for other shapes.

Files that still use raw `fetch` to the backend (with or without `credentials: 'include'`) include, among others:

- `src/features/clients/Clients.tsx`
- `src/features/teams/teams.tsx`
- `src/api/clients/doulaAssignments.ts`, `notes.ts`
- `src/api/doulas/doulaApi.ts`, `doulaService.ts`
- `src/api/admin/adminService.ts`
- `src/api/quickbooks/**`
- `src/api/payments/stripe.ts`
- `src/features/auth/SignUp.tsx` (signup may be public)
- `src/common/utils/updateClient.ts`, `updateClientStatus.ts`, `deleteClient.ts`
- Others under `src/` that call the backend

If you see “No session token provided” on a specific route, switch that call to `fetchWithAuth(buildUrl(path), init)` or to the central client.

---

## Quick reference: what the backend expects

| Source   | Header / Cookie       | Example                     |
|----------|------------------------|-----------------------------|
| Header   | `X-Session-Token`      | `X-Session-Token: eyJ...`   |
| Header   | `Authorization`        | `Authorization: Bearer eyJ...` |
| Cookie   | `sb-access-token`      | `Cookie: sb-access-token=eyJ...` |
