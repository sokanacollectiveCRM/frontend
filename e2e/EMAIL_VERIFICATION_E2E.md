# Email verification E2E (Playwright + video)

Automates the client verification journey against a **local backend** (email-verification code must be running on port 5050).

## Prerequisites

1. **Cloud SQL proxy (dev DB)** — e.g.  
   `cloud-sql-proxy sokana-private-data:us-central1:sokana-phi-postgres-dev --address 127.0.0.1 --port 5434`
2. **Backend** — `npm run dev` on port **5050** with `CLOUD_SQL_*` from `scripts/dev-env/.local/dev.env`.
3. **Env** — `DEV_ENV_CLIENT_EMAIL` / `DEV_ENV_CLIENT_PASSWORD` / `DEV_ENV_CLIENT_UID` in dev.env.
4. **Firebase Web API key** — in `frontend-crm/.env` (`VITE_FIREBASE_API_KEY`, same Identity project).
5. **ADC** — `gcloud auth application-default login` for Firebase Admin in fixture scripts.

## Run (records video)

```bash
cd frontend-crm
npm run test:email-verification:e2e
```

Optional:

- `E2E_SLOW_MO=400` — slower actions for demos
- `E2E_API_BASE_URL=http://localhost:5050`
- Headed: `npx playwright test --config=playwright.email-verification.config.ts --headed`

## Artifacts

| Output | Location |
|--------|----------|
| Videos | `e2e/test-results/email-verification/` |
| HTML report | `e2e/reports/email-verification/` |
| Fixture (generated) | `e2e/.fixtures/email-verification.json` (gitignored) |

## Scenarios

1. Unverified session cookie → `/profile` redirects to `/auth/verify-email`
2. Open Firebase verification URL → success message on verify page
3. After verify → `/auth/login` session + `/profile` loads without verify gate

Doula staff login uses email MFA; use this client path for full UI recording or extend with MFA mail capture separately.
