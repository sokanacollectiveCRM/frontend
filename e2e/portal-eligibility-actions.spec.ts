/**
 * Portal eligibility E2E — invite allowed/blocked + verification invoice visibility.
 *
 * Run: npm run test:portal-eligibility:e2e
 *
 * Stubbed against GET /clients (no backend, QBO, or real portal invites).
 * Matrix scenarios match backend oracle: run-portal-readiness-matrix.sh
 */

import { test, expect, type Page } from '@playwright/test';
import { installCorsPreflightStub, stubAuthMe, defaultCorsHeaders } from './fixtures/httpStubs';
import {
  JORDAN_CLIENT_ID,
  SCENARIOS,
  stubJordanScenario,
} from './helpers/portalEligibilityStubs';

const ADMIN_USER = {
  id: 'admin-1',
  firstname: 'Admin',
  lastname: 'User',
  email: 'info@techluminateacademy.com',
  role: 'admin',
};

async function setupAdminClientsPage(page: Page, client: Record<string, unknown>) {
  const headers = defaultCorsHeaders();
  await installCorsPreflightStub(page, headers);
  await stubAuthMe(page, ADMIN_USER, headers);
  await stubJordanScenario(page, client, headers);
}

async function openCustomersTab(page: Page) {
  await page.goto('/clients', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
  await page.getByRole('tab', { name: /Customers/i }).click();
  await expect(page.getByRole('tabpanel').getByText('Jordan Bony')).toBeVisible();
}

async function jordanRow(page: Page) {
  return page.getByRole('row', { name: /Jordan Bony/i });
}

async function assertInviteButtonInPortalColumn(page: Page, visible: boolean) {
  const row = await jordanRow(page);
  const invite = row.getByRole('button', { name: 'Invite' });
  if (visible) {
    await expect(invite).toBeVisible();
    await expect(invite).toBeEnabled();
  } else {
    await expect(invite).toHaveCount(0);
  }
}

async function assertEligibleBadge(page: Page, visible: boolean) {
  const row = await jordanRow(page);
  const badge = row.getByText('Eligible', { exact: true });
  if (visible) {
    await expect(badge).toBeVisible();
  } else {
    await expect(badge).toHaveCount(0);
  }
}

async function assertBlockerBadge(page: Page, label: RegExp) {
  const row = await jordanRow(page);
  await expect(row.getByText(label).first()).toBeVisible();
}

async function assertRowMenuInvite(page: Page, enabled: boolean, blockedReason?: RegExp) {
  const row = await jordanRow(page);
  await row.getByRole('button', { name: 'Open menu' }).click();
  const menuItem = page.getByRole('menuitem', { name: /Invite to portal/i });
  await expect(menuItem).toBeVisible();

  if (enabled) {
    await expect(menuItem).toBeEnabled();
  } else {
    await expect(menuItem).toBeDisabled();
    if (blockedReason) {
      await expect(menuItem).toHaveAttribute('title', blockedReason);
    }
  }

  await page.keyboard.press('Escape');
}

async function openProfileModal(page: Page) {
  const detailResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.url().includes(`/clients/${JORDAN_CLIENT_ID}`) &&
      response.ok()
  );

  await page.goto(`/clients/${JORDAN_CLIENT_ID}`, { waitUntil: 'domcontentloaded' });
  await detailResponse;

  const dialog = page.getByTestId(`lead-profile-dialog-${JORDAN_CLIENT_ID}`);
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await expect(dialog.getByRole('heading', { name: 'Jordan Bony' })).toBeVisible();
}

async function expandBillingReadinessSection(page: Page) {
  const dialog = page.getByTestId(`lead-profile-dialog-${JORDAN_CLIENT_ID}`);
  const billingButton = dialog.getByRole('button', { name: /Billing Information/i });
  await billingButton.scrollIntoViewIfNeeded();
  await billingButton.click({ force: true });
  await expect(dialog.getByText('Portal onboarding readiness')).toBeVisible();
}

async function assertProfilePortalReadiness(
  page: Page,
  options: {
    eligibility: 'Eligible' | 'Locked';
    verificationVisible: boolean;
    primaryBlocker?: RegExp;
  }
) {
  await expandBillingReadinessSection(page);

  const dialog = page.getByTestId(`lead-profile-dialog-${JORDAN_CLIENT_ID}`);
  const section = dialog.locator('div').filter({ hasText: 'Portal onboarding readiness' }).first();
  await section.scrollIntoViewIfNeeded();

  const eligibilityRow = section.locator('div').filter({ hasText: 'Portal eligibility' }).first();
  await expect(eligibilityRow.getByText(options.eligibility, { exact: true })).toBeVisible();

  if (options.primaryBlocker) {
    const blockerRow = section.locator('div').filter({ hasText: 'Primary blocker' }).first();
    await expect(blockerRow.getByText(options.primaryBlocker)).toBeVisible();
  }

  const verificationButton = dialog.getByRole('button', { name: /Send \$1 verification invoice/i });
  if (options.verificationVisible) {
    await expect(verificationButton).toBeVisible();
    await expect(verificationButton).toBeEnabled();
  } else {
    await expect(verificationButton).toHaveCount(0);
  }
}

test.describe('Portal eligibility — invite & verification actions', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(60_000);
  test('Scenario 1 — Self-Pay missing card: invite blocked, verification visible', async ({ page }) => {
    await setupAdminClientsPage(page, SCENARIOS.selfPayMissingCard);
    await openCustomersTab(page);

    await assertInviteButtonInPortalColumn(page, false);
    await assertEligibleBadge(page, false);
    await assertBlockerBadge(page, /Missing card on file/i);

    await assertRowMenuInvite(
      page,
      false,
      /Deposit paid, but no reusable payment method was saved in QuickBooks/i
    );

    await openProfileModal(page);
    await assertProfilePortalReadiness(page, {
      eligibility: 'Locked',
      verificationVisible: true,
      primaryBlocker: /Missing card on file/i,
    });
  });

  test('Scenario 2 — Self-Pay + card: eligible, invite enabled', async ({ page }) => {
    await setupAdminClientsPage(page, SCENARIOS.selfPayEligibleWithCard);
    await openCustomersTab(page);

    await assertEligibleBadge(page, true);
    await assertInviteButtonInPortalColumn(page, true);

    await assertRowMenuInvite(page, true);

    await openProfileModal(page);
    await assertProfilePortalReadiness(page, {
      eligibility: 'Eligible',
      verificationVisible: false,
    });
  });

  test('Scenario 3 — Medicaid, no card: eligible, invite enabled', async ({ page }) => {
    await setupAdminClientsPage(page, SCENARIOS.medicaidEligibleNoCard);
    await openCustomersTab(page);

    await assertEligibleBadge(page, true);
    await assertInviteButtonInPortalColumn(page, true);

    await assertRowMenuInvite(page, true);

    await openProfileModal(page);
    await assertProfilePortalReadiness(page, {
      eligibility: 'Eligible',
      verificationVisible: false,
    });
  });

  test('Scenario 4 — Unsigned contract: invite blocked, verification hidden', async ({ page }) => {
    await setupAdminClientsPage(page, SCENARIOS.unsignedContract);
    await openCustomersTab(page);

    await assertInviteButtonInPortalColumn(page, false);
    await assertEligibleBadge(page, false);
    await assertBlockerBadge(page, /Contract unsigned/i);

    await assertRowMenuInvite(page, false, /signed contract is required/i);

    await openProfileModal(page);
    await assertProfilePortalReadiness(page, {
      eligibility: 'Locked',
      verificationVisible: false,
      primaryBlocker: /Contract unsigned/i,
    });
  });

  test('Scenario 5 — Unknown billing path: invite blocked, verification hidden', async ({ page }) => {
    await setupAdminClientsPage(page, SCENARIOS.billingPathUnknown);
    await openCustomersTab(page);

    await assertInviteButtonInPortalColumn(page, false);
    await assertEligibleBadge(page, false);
    await assertBlockerBadge(page, /Billing path unknown/i);

    await assertRowMenuInvite(page, false, /Billing path could not be determined/i);

    await openProfileModal(page);
    await assertProfilePortalReadiness(page, {
      eligibility: 'Locked',
      verificationVisible: false,
      primaryBlocker: /Billing path unknown/i,
    });
  });
});
