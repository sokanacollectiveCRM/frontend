# Sokana CRM — Portfolio Screenshot Capture

Internal Playwright utility for generating **consulting-case-study** and **portfolio** assets from the Sokana Collective CRM frontend. Every PNG is written to a **single centralized folder** for manual sorting into deck folders later.

## Output directory

```text
portfolio-assets/sokana-all-screenshots/
```

(Path is relative to the **repository root** `sokana-crm-frontend/`, not `frontend-crm/`.)

Override:

```bash
PORTFOLIO_SCREENSHOT_DIR=/absolute/path/to/folder npm run portfolio:capture
```

## Project structure

```text
frontend-crm/
├── playwright.portfolio.config.ts    # Dedicated Playwright config (1600×1200)
├── e2e/portfolio/
│   ├── README.md                     # This file
│   ├── config.ts                     # Paths, viewport, auth mode
│   ├── auth.setup.ts                 # Save storageState after login
│   ├── capture-portfolio.spec.ts     # Orchestrator (serial run)
│   ├── helpers/
│   │   ├── screenshot.ts             # captureFullPage, captureElement
│   │   ├── waits.ts                  # waitForDashboardReady, waitForTableLoad
│   │   ├── navigation.ts             # navigateAndCapture
│   │   └── auth.ts                   # stub | storage | login
│   ├── fixtures/
│   │   ├── portfolioData.ts          # Rich fictional CRM payloads
│   │   └── portfolioStubs.ts         # API route mocks (repeatable UI)
│   └── workflows/
│       ├── captureCrm.ts             # Admin CRM checklist
│       └── captureRequestForm.ts     # Public /request (10 steps)
portfolio-assets/
└── sokana-all-screenshots/           # All PNG output (git-friendly .gitkeep)
```

## Setup

From `frontend-crm/`:

```bash
npm install
npx playwright install chromium
```

Ensure the dev API is reachable when using **live** auth (default stub mode does not require backend).

Start dev server (or let Playwright start it on port **3001**):

```bash
npm run dev -- --port 3001
```

## How to run

### Recommended — stubbed APIs (repeatable, no login)

```bash
cd frontend-crm
PORTFOLIO_AUTH_MODE=stub npm run portfolio:capture
```

### Live admin session (real data)

1. Save session once:

```bash
# Automated login
PORTFOLIO_ADMIN_EMAIL=you@example.com PORTFOLIO_ADMIN_PASSWORD='***' npm run portfolio:auth

# Or headed manual login (MFA / SSO)
npm run portfolio:auth -- --headed
```

2. Capture with saved cookies:

```bash
npm run portfolio:capture:live
```

### Headed debugging

```bash
npm run portfolio:capture:headed
```

## Authentication recommendations

| Mode | When to use | How |
|------|-------------|-----|
| `stub` | Portfolio mocks, CI, repeatable decks | `PORTFOLIO_AUTH_MODE=stub` (default) |
| `storage` | Production-like screenshots | Run `portfolio:auth`, then `portfolio:capture:live` |
| `login` | Scripted login each run | Set `PORTFOLIO_ADMIN_EMAIL` / `PORTFOLIO_ADMIN_PASSWORD` + `PORTFOLIO_AUTH_MODE=login` |

**Best practices**

- Prefer **`storageState`** (`e2e/portfolio/.auth/admin.json`) over embedding passwords in scripts.
- Add `e2e/portfolio/.auth/` to `.gitignore` (already ignored) — never commit cookies.
- For QuickBooks OAuth, stub mode captures **disconnected** and **connected** UI; live OAuth still needs a real connection for marketing shots.
- Optional: `PORTFOLIO_STUB_APIS=1` with `storage` to overlay mocks on weak staging data.

## Screenshot naming conventions

| Pattern | Example | Use |
|---------|---------|-----|
| `module-feature.png` | `clients-table.png` | CRM screens |
| `module-feature-detail.png` | `assignment-detail-sidebar.png` | Panels / sidebars |
| `request-step-NN-slug.png` | `request-step-09-payment-insurance.png` | Intake funnel (01–10) |
| `dashboard-kpi-*.png` | `dashboard-kpi-monthly-revenue.png` | KPI highlights |

Sort into portfolio folders manually, e.g. `01-dashboard/`, `02-clients/`, `03-operations/`, `04-integrations/`, `05-public-intake/`.

## CRM capture checklist (automated)

- Main dashboard (overview, calendar, KPI row)
- Leads/clients table, status badges, export / send contract affordances
- Client profile modal (intake, contact, services, demographics, admin notes)
- Customers / QuickBooks sync (`/clients/new`)
- Team directory, invite workflow, role filters
- Doulas directory + assignment counts (`/hours`)
- Assignments tab, filters, birth-outcome filters, assignment sidebar
- Payments ledger, reconciliation engine, invoices + invoice modal
- QuickBooks integration (disconnected + connected states)
- Demographics analytics

## Request form (`/request`) — operational highlights

The script documents and captures:

- **Multi-step state management** — `RequestFormContext` + react-hook-form
- **Dynamic conditional rendering** — payment method, past pregnancies, home type
- **Payment workflow switching** — insurance vs “Not sure” paths
- **Public intake funnel** → CRM lead ingestion on submit
- **Progress-bar / step-rail navigation** — non-linear `jumpToStep` with validation gates
- **Built-in test data utility** — “Fill with test data” (`dummyTestLead.ts`)
- **Equity-aware demographics** — Step 10 collection

Uses **Fill with test data**, then visits each step via the desktop step rail (1600×1200 viewport).

## Optional future enhancements

- [ ] PDF / WebM walkthrough per workflow
- [ ] `PORTFOLIO_ONLY=clients,request` env filter for partial runs
- [ ] Visual regression baselines (Playwright `toHaveScreenshot`) for release QA
- [ ] Separate `portfolio-assets/sokana-all-screenshots-mobile/` for client portal
- [ ] Post-process script (ImageMagick) for consistent margins/watermarks
- [ ] Upload manifest JSON for DAM / Notion asset libraries

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Empty tables | Use `PORTFOLIO_AUTH_MODE=stub` or seed staging data |
| Redirect to `/login` | Run `npm run portfolio:auth` or use stub mode |
| Request step nav locked | Run **Fill with test data** first (script does this automatically) |
| Playwright browsers missing | `npx playwright install chromium` |

## Related E2E tests

Regression specs live in `frontend-crm/e2e/`. Portfolio capture is **intentionally separate** (`playwright.portfolio.config.ts`) so asset runs do not interfere with CI test suites.
