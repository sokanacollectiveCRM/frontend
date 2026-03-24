# Local development (frontend + backend)

Use this to exercise features (e.g. doula Activities, client-visible notes, PATCH toggles) **before** deploying.

## 1. Run the API (backend repo)

From the **backend** repository (e.g. `backend/`):

```bash
npm install
# Configure .env: Supabase, Cloud SQL, PORT, SPLIT_DB_READ_MODE=primary, etc. (same as your team uses today)
npm run dev
```

- Default **PORT** in code is `8080` unless your `.env` sets `PORT=5050`.
- Note the URL in the log (e.g. `http://localhost:5050`).

### CORS

In non-production, the API allows common local frontends, including **Vite** on `http://localhost:5173`.  
If you use another origin, set:

```bash
FRONTEND_ORIGIN=http://localhost:YOUR_PORT
```

(comma-separated for multiple). Restart the API after changing env.

## 2. Run this CRM frontend

From **this repo** (`frontend-crm/`):

```bash
npm install
cp .env.example .env.local
```

Edit **`.env.local`** so the API base matches your running backend (no trailing `/api` — the app adds `/api` where needed):

```env
VITE_APP_BACKEND_URL=http://localhost:5050
# If your API runs on 8080 instead:
# VITE_APP_BACKEND_URL=http://localhost:8080

VITE_AUTH_MODE=cookie
# If you use Supabase session against the API:
# VITE_AUTH_MODE=supabase
# plus VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

VITE_APP_ENV=development
```

Start Vite:

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## 3. Quick check: doula activity visibility

1. Log in as a **doula** with an assigned client.
2. **Doula Dashboard → Activities** → pick a client.
3. **Add Activity** — use **Show to client**; save.
4. Toggle **Client portal** on an existing note — should `PATCH` to  
   `/api/doulas/clients/:clientId/activities/:activityId` without CORS errors.

If the toggle fails, check the browser **Network** tab for the PATCH status and response body; the toast should include HTTP status and a short server message.

## 4. Optional: smoke script

With a real client UUID and session/cookies as appropriate:

```bash
npm run smoke:api
```

(See `.env.example` for `VITE_SMOKE_CLIENT_ID`.)

---

**Summary:** API on one port, `VITE_APP_BACKEND_URL` pointing at that origin, frontend `npm run dev` on 5173 — CORS is allowed for 5173 in dev so you can test end-to-end locally.
