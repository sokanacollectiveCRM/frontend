# Multi-organization sign-in and staff invitations

Existing staff accept an invitation by entering their current password. The
frontend signs in through Firebase, obtains a fresh ID token, and submits only
the invitation token and ID token to the backend. It omits any old session cookie
so another signed-in account cannot take precedence. After acceptance, it clears
the previous session and returns to the normal MFA sign-in flow. New users still
choose a password and verify their inbox.

After MFA or session restoration, `TENANT_SELECTION_REQUIRED` opens
`/choose-organization`. Only the backend's permitted organizations are offered.
Selecting an organization verifies `/auth/me` with `X-Tenant-Id`, stores the
organization ID in session storage for this tab, and reloads into the workspace.
Authentication tokens are not stored with this selection. All shared API clients
and authenticated downloads include the organization header.

Switch organization is available in the sidebar user menu and profile menu.
Switching uses a full navigation so component state and module caches from the
previous organization are discarded. Expired or removed memberships cannot be
selected; stale selections are cleared and currently permitted memberships are
requested again. Late auth responses from a previous login are ignored.

## Dev migration and deployment

The staff-identity migration was applied to `sokana_private_dev` on
`sokana-phi-postgres-dev` on October 24, 2026. The backend migration now handles
legacy global normalized email and name indexes as well as login-ID uniqueness.
Preflight and postflight duplicate-group counts were zero. No accounts or
memberships were merged or deleted.

The frontend and backend service updates have **not been deployed**. The
currently deployed dev API has `TENANCY_ENFORCE` unset. The dev backend deployment
environment generator now sets it to `on`; deploy the updated backend and
frontend together to activate this flow. Production was not changed.

## Validation

- 27 focused frontend unit/component/regression tests passed.
- 2 Chromium browser tests passed with mocked Firebase and API responses:
  MFA/selection/restoration/switching, and existing-account invitation acceptance.
- 15 PostgreSQL integration tests passed with synthetic data and enforced RLS,
  including the actual legacy normalized email/name indexes from dev.
- 2 dev deployment environment tests passed.
- Frontend production build and TypeScript checks passed.

Run the frontend browser checks without connecting to live accounts:

```sh
npx playwright test --config=playwright.organizations.config.ts
```

The browser configuration supplies a synthetic Firebase project and API URL;
network routes are mocked. The database integration runner is documented in the
backend's `docs/verification/P07_MULTI_ORGANIZATION_INVITATIONS.md`.
