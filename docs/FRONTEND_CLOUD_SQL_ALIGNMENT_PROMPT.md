# Frontend–Cloud SQL alignment prompt

Backend summary: **client data comes only from Cloud SQL (phi_clients)**. Supabase is used for **auth only**. List and detail responses use the envelope `{ success, data [, meta ] }`; all fields are **snake_case**.

---

## Backend setup (for this frontend)

1. **API base URL**  
   Use an env var pointing at the backend (e.g. `VITE_APP_BACKEND_URL` or `VITE_API_BASE_URL`). All client API calls (login, `/clients`, `/clients/:id`) use that base URL.

2. **Login**  
   - **Request:** `POST /auth/login` with JSON body `{ "email": "...", "password": "..." }`.  
   - **Success:** Backend returns `{ message, user, token }` and sets cookie `sb-access-token`.  
   - **Failure:** Backend returns `{ "error": "..." }` (e.g. `"Invalid login credentials"`).  
   - **Frontend:** After success, rely on the cookie (`credentials: 'include'`) or read `token` and send `Authorization: Bearer <token>` on later requests.

3. **Authenticated requests (e.g. GET /clients, GET /clients/:id)**  
   Send the session on every request: **Cookie** via `credentials: 'include'` (and CORS allowing the frontend origin), or **Header** `Authorization: Bearer <token>` if you store the token. Backend accepts either.

4. **Response shape**  
   - **List:** GET /clients → `{ success: true, data: ClientListItem[], meta?: { count } }`. Use list from `response.data`, total from `response.meta?.count` if present.  
   - **Detail:** GET /clients/:id → `{ success: true, data: ClientDetailDTO }`. Use detail from `response.data`.  
   - All API fields are **snake_case**; map to camelCase in app state if desired.

5. **Detail modal**  
   When opening the client/lead detail modal, always call GET /clients/:id and use that response as the source of truth for the form, not only the list row.

6. **CORS**  
   Backend must allow the frontend origin (e.g. `http://localhost:3002`, `http://localhost:5173`). If the frontend runs on a different port or domain, add that origin to the backend CORS config.

**Login troubleshooting (“Invalid login credentials”)**  
The frontend sends `POST /auth/login` and shows the backend’s `error` message. If you see “Invalid login credentials”, the backend is rejecting the credentials. Fix it on the backend/data side:

- **Backend logs:** On failed login the server logs e.g. `[auth] Login failed { email: '...', reason: 'Invalid login credentials' }`. Check the terminal where the backend runs (`npm run dev`) to see the email used and the exact Supabase reason (e.g. “Email not confirmed”).
- **Where credentials are checked:** Supabase Auth only (no Cloud SQL users table). Backend `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must point to the **same** Supabase project where the user was created.
- **User exists / email confirmed:** Supabase Dashboard → Authentication → Users.
- **Reset password:** Backend repo usually has a script, e.g. `ADMIN_EMAIL=... ADMIN_NEW_PASSWORD=... npx tsx scripts/set-admin-password.ts`; then log in with that email/password. See backend `docs/CLOUD_SQL_LOCAL_TEST.md` (or equivalent) for the full “Login troubleshooting” section.

---

## 1. Exact API contract

| Endpoint | Response envelope | Payload |
|----------|-------------------|---------|
| **GET /clients** | `{ success: true, data: ClientListItem[], meta?: { count: number } }` | List in `data`; total count in `meta.count` (when present). |
| **GET /clients/:id** | `{ success: true, data: ClientDetailDTO }` | Single client in `data`; snake_case (operational + PHI when authorized). |

- **ClientListItem** / **ClientDetailDTO**: see backend DTOs; fields are snake_case (`first_name`, `last_name`, `email`, `service_needed`, `phone_number`, `requested_at`, `updated_at`, etc.).

---

## 2. Analyze first

### List (GET /clients)

| Question | Where in this repo |
|----------|--------------------|
| Where is the list fetched? | `useClients().getClients` → `fetchClients()` in `src/api/services/clients.service.ts`; calls `get('/clients')`. |
| Where is it stored? | `useClients()` state `clients`; `Clients.tsx` parses with `userListSchema` and stores in `userList` / `userListWithPortal`. |
| Where is it rendered? | `Clients.tsx` → `UsersTable` with `columns` from `src/features/clients/components/users-columns.tsx`; data = `userListWithPortal`. |

**List columns → API fields (snake_case)**

| Column (UI) | API field(s) | Notes |
|-------------|--------------|--------|
| Client | `first_name`, `last_name`, `email`, `id` | Display: `first_name + last_name`, else `email`, else `Client {id}`. |
| Contract | `service_needed` | Also accept `serviceNeeded` (camelCase) for compatibility. |
| Requested | `requested_at` | Date. |
| Updated | `updated_at` | Date. |
| Status | `status` | |
| Portal | `portal_status`, eligibility derived | |
| Actions | — | Row actions. |

- List **must** use `response.data` for the array. If the backend returns `meta.count`, use it for total count (pagination/total) where needed.

### Detail (GET /clients/:id)

| Question | Where in this repo |
|----------|--------------------|
| Where is GET /clients/:id used? | `useClients().getClientById(id)` → `fetchClientById(id)` in `src/api/services/clients.service.ts`; also `LeadProfileModal` (on open), `RouteAwareLeadProfileLoader`, `DueDatePopover`, `useClientProfileData`. |
| Where is the result shown? | **LeadProfileModal** (form/modal); form fields bound to `editedData` / `detailSource`. |

**Detail form fields → API keys (snake_case)**

| Form field (display) | API key (snake_case) | Notes |
|-----------------------|----------------------|--------|
| First Name | `first_name` | Also map `firstname` / `firstName`. |
| Last Name | `last_name` | Also map `lastname` / `lastName`. |
| Email | `email` | |
| Phone Number | `phone_number` | Also map `phoneNumber`. |
| Service needed | `service_needed` | Also map `serviceNeeded`. |
| Due date | `due_date` | |
| Address | `address_line1`, `address` | |
| Date of birth | `date_of_birth` | |
| Status | `status` | |
| Portal / PHI fields | per ClientDetailDTO | Map all snake_case from `data` to form (camelCase in state if desired). |

- Detail **must** use `response.data` as the single client object. Map snake_case to display/form keys (and to camelCase in state where the rest of the app expects it).

---

## 3. Quick search (frontend repo)

Run from repo root (e.g. `sokana-crm-frontend/frontend-crm`):

```bash
# List: where clients are fetched, stored, rendered
rg "getClients|setClients|/clients" --type-add 'src:*.{ts,tsx}' -t src -l
rg "clients\.length|userList|userListWithPortal" -t src -l

# Detail: where GET /clients/:id is used and result shown
rg "getClientById|/clients/" -t src -l
rg "LeadProfileModal|detailSource|editedData" -t src -l

# API field names (snake_case)
rg "first_name|last_name|service_needed|phone_number|requested_at|updated_at" -t src -l
```

---

## 4. Prompt to run in the frontend repo

Copy-paste the block below for an AI or developer working on the frontend:

---

**Alignment with Cloud SQL backend**

1. **List (GET /clients)**  
   - Backend returns `{ success: true, data: ClientListItem[], meta?: { count } }`.  
   - Use the **list** from `response.data` (array).  
   - Use **total count** from top-level `response.meta?.count` when the HTTP client exposes the full envelope (list is in `response.data`).  
   - Columns: Client (from `first_name`, `last_name`, `email`, or `Client {id}`), Contract (from `service_needed`), Requested (`requested_at`), Updated (`updated_at`), Status (`status`).  
   - Accept both snake_case and camelCase from the API; normalize to one shape for the table.

2. **Detail (GET /clients/:id)**  
   - Backend returns `{ success: true, data: ClientDetailDTO }`.  
   - Use the **detail** from `response.data` (single object).  
   - Map **snake_case** to display/form (and to camelCase in state if needed): `first_name`, `last_name`, `email`, `phone_number`, `service_needed`, `due_date`, `address_line1`, `date_of_birth`, etc.

3. **Detail modal**  
   - **Always** call GET /clients/:id when opening the client/lead detail modal (e.g. on row click or route open).  
   - Use that response as the **primary source** for the form (not only the list row).  
   - Do not rely solely on list row data for the detail view.

4. **Envelope**  
   - All list/detail responses use `{ success, data [, meta ] }`.  
   - Read list from `data` (array), detail from `data` (object), count from `meta.count` when present.

---

## 5. Summary checklist

| Item | Backend contract | Frontend action |
|------|------------------|------------------|
| List payload | `data` = array, `meta.count` = total | Use `response.data` for list; use `meta.count` for total if needed. |
| List columns | snake_case: `first_name`, `last_name`, `email`, `service_needed`, etc. | Map to table columns; accept snake_case and camelCase. |
| Detail payload | `data` = single ClientDetailDTO | Use `response.data` for detail. |
| Detail form | snake_case in API | Map snake_case → form/display (and camelCase in state if used). |
| Detail on open | GET /clients/:id | Always fetch GET /clients/:id when opening detail modal; use as primary form source. |

---

## 6. Backend reference

- **ClientListItemDTO** – list item (snake_case).  
- **ClientDetailDTO** – detail (snake_case).  
- **ApiResponse** – `{ success: boolean, data: T, meta?: { count?: number } }`.

Backend repo may define these in its DTO layer and document the exact list/detail shapes.

---

## 7. How to use this doc

1. Open the frontend repo (e.g. `sokana-crm-frontend` or `frontend-crm`).  
2. Use the **Quick search** commands in §3 to find where the clients list and detail are fetched and rendered.  
3. Fill or confirm the **List columns → API fields** and **Detail form fields → API fields** tables (§2) with your real component and field names.  
4. Run the **Prompt** (§4) in the frontend repo (or follow the same steps) and implement:  
   - list from `data` (+ `meta.count` if needed),  
   - detail from `data`,  
   - snake_case mapping where needed,  
   - and always fetch GET /clients/:id when opening the detail modal and use it as the form source.

This doc can live in the frontend repo and be shared with the backend team or an AI working on the frontend.
