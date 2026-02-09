# PHI Broker E2E QA Test Plan (Manual)

## Goal
Verify PHI Broker integration works end-to-end:
- UI loads client detail
- Browser only calls Vercel backend (never Cloud Run)
- Vercel backend hydrates PHI from broker
- PHI fields show correctly
- Clear debugging path when something fails

## Environment choice (Local vs Prod)
Same test steps for both. Only swap base URLs + ensure secrets match the environment.

### Local
- BROKER_URL=http://localhost:8080
- VERCEL_BASE=http://localhost:<your-backend-port>
- SHARED_SECRET=<local-secret>
- Use a local auth session/JWT/cookie your local backend accepts

### Prod
- BROKER_URL=https://sokana-phi-broker-634744984887.us-central1.run.app
- VERCEL_BASE=https://crmbackend-six-wine.vercel.app
- SHARED_SECRET=<prod-secret>
- Use a prod auth session/JWT/cookie your prod backend accepts

Rule: Do not mix environments (prod↔local). Secrets and auth must match the environment.

## Prereqs
- Frontend deployed URL: <YOUR FRONTEND URL>
- Vercel backend deployed URL: https://crmbackend-six-wine.vercel.app
- A known client_id that has a row in public.phi_clients (Cloud SQL DB: sokana_private)

## 1) UI flow
1. Log into the frontend (role that can view client details).
2. Open client list.
3. Click a client or navigate to the detail page route you use.
4. Confirm the page loads (no infinite spinner / no generic fetch error toast).
5. Confirm PHI fields appear (at minimum phone_number and due_date if present for that client).

## 2) Chrome DevTools Network checks (critical boundary test)
1. Open DevTools → Network → Fetch/XHR → check "Preserve log".
2. Load client detail.
3. Confirm the client detail request goes ONLY to Vercel backend:
   - Example path contains /clients/<id> (or your actual route)
4. Confirm there are ZERO requests to:
   - https://sokana-phi-broker-634744984887.us-central1.run.app
   - any *.run.app
5. Inspect response body from the Vercel backend request and verify PHI keys exist.

## 3) Expected response shape (don't assume wrapper)
The backend response may be one of these:

A) Wrapped:
{
  "success": true,
  "data": { <client fields + PHI fields> }
}

B) Raw:
{ <client fields + PHI fields> }

In either case, confirm these keys exist when PHI is available:
- phone_number (broker alias)
- due_date (string date)

Optional PHI keys (if used in UI):
- date_of_birth, address_line1, health_history, allergies, medications, health_notes, etc.

## 4) "No PHI direct-to-broker" checklist
- Network tab search: "run.app" → 0 results
- Network tab search: "phi-broker" → 0 results
- PHI appears only in the Vercel response payload, never via a browser call to Cloud Run.

## 5) If it fails, fastest debug path
A) UI shows no PHI / errors:
- Check Network response from Vercel endpoint:
  - Is it 200?
  - Is PHI missing?
  - Is the response wrapped vs raw mismatch breaking parsing?

B) Broker health:
- Hit broker: GET https://sokana-phi-broker-634744984887.us-central1.run.app/health
  - must be {"status":"healthy","db":"connected"}

C) Vercel env:
- PHI_BROKER_URL matches broker base URL
- PHI_BROKER_SHARED_SECRET matches broker's secret

D) Logs
- Vercel logs: confirm backend attempted broker call and didn't swallow errors
- Cloud Run logs: confirm broker received request + query succeeded (no PHI in logs)

## Pass criteria
- Client detail loads
- Browser only calls Vercel
- PHI fields present in Vercel response + render in UI
- No browser call to Cloud Run

---

## Network boundary verification runbook (Chrome)

**Goal:** Confirm the browser never calls Cloud Run and only calls Vercel backend for client detail, while PHI still shows in the UI.

**Prereqs:**
- Logged into the frontend as admin (or role authorized to view PHI).
- A known `CLIENT_ID` that has a row in Cloud SQL `public.phi_clients`.

### Steps

**1) Open Chrome DevTools → Network**
- Click **Fetch/XHR**
- Check **Preserve log**
- Clear the network log

**2) In the app**
- Go to **Clients** list
- Click the client with the known `CLIENT_ID` (or navigate directly to its detail view)

**3) Verify network boundary**
- In Network, filter: `clients`
- Find the **GET** request for `/clients/<id>`

**Expected:**
- Request URL host is Vercel backend: `https://crmbackend-six-wine.vercel.app/clients/<id>` (or your configured backend domain)
- Status **200**
- Response JSON includes PHI keys when present (`phone_number`, `due_date`)

**4) Verify NO broker calls**
- In Network search box, type: `run.app`  
  **Expected:** 0 results
- Search: `phi-broker`  
  **Expected:** 0 results

**5) UI validation**
- Confirm PHI fields show (at minimum `phone_number` and `due_date` if the UI renders them)
- If the UI does not render those fields yet, still confirm they exist in the Vercel response payload

### Runbook pass criteria
- Browser calls **only** Vercel backend (no `*.run.app` in Network)
- Vercel response contains PHI fields
- UI loads without errors
