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
  stubVerificationInvoiceTransition,
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
  const readinessHeading = dialog.getByText('Portal onboarding readiness');
  if (await readinessHeading.isVisible().catch(() => false)) {
    return;
  }
  const billingButton = dialog.getByRole('button', { name: /Billing Information/i });
  await billingButton.scrollIntoViewIfNeeded();
  await billingButton.click({ force: true });
  await expect(readinessHeading).toBeVisible();
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

async function clickVerificationInvoiceAndWaitForRefresh(page: Page) {
  const sendResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/clients/${JORDAN_CLIENT_ID}/billing/send-verification-invoice`) &&
      response.ok()
  );
  const refreshResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.url().includes(`/clients/${JORDAN_CLIENT_ID}`) &&
      response.ok()
  );

  await page
    .getByTestId(`lead-profile-dialog-${JORDAN_CLIENT_ID}`)
    .getByRole('button', { name: /Send \$1 verification invoice/i })
    .click();

  await sendResponse;
  await refreshResponse;
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

  test('Scenario 2 — Insurance missing card: invite blocked, verification visible', async ({ page }) => {
    await setupAdminClientsPage(page, SCENARIOS.insuranceMissingCard);
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

  test('Scenario 3 — Self-Pay + card: eligible, invite enabled', async ({ page }) => {
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

  test('Scenario 4 — Medicaid, no card: eligible, invite enabled', async ({ page }) => {
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

  test('Scenario 5 — Unsigned contract: invite blocked, verification hidden', async ({ page }) => {
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

  test('Scenario 6 — Unknown billing path: invite blocked, verification hidden', async ({ page }) => {
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

  test('Scenario 7 — Verification invoice shows payment link while backend still reports missing card', async ({
    page,
  }) => {
    const paymentLink = 'https://pay.example.com/invoice_123';
    const sentButStillBlocked = {
      ...SCENARIOS.selfPayMissingCard,
      verification_invoice_id: 'invoice_123',
      verification_invoice_sent_at: '2026-01-02T12:00:00.000Z',
    };

    await installCorsPreflightStub(page, defaultCorsHeaders());
    await stubAuthMe(page, ADMIN_USER, defaultCorsHeaders());
    await stubVerificationInvoiceTransition(page, {
      initialClient: SCENARIOS.selfPayMissingCard,
      refreshedClient: sentButStillBlocked,
      paymentLink,
      headers: defaultCorsHeaders(),
    });

    await openProfileModal(page);
    await assertProfilePortalReadiness(page, {
      eligibility: 'Locked',
      verificationVisible: true,
      primaryBlocker: /Missing card on file/i,
    });

    await clickVerificationInvoiceAndWaitForRefresh(page);

    const dialog = page.getByTestId(`lead-profile-dialog-${JORDAN_CLIENT_ID}`);
    await expect(dialog.getByRole('link', { name: /Open invoice \/ payment link/i })).toHaveAttribute(
      'href',
      paymentLink
    );
    await assertProfilePortalReadiness(page, {
      eligibility: 'Locked',
      verificationVisible: true,
      primaryBlocker: /Missing card on file/i,
    });
  });

  test('Scenario 8 — Verification invoice refresh unlocks invite after backend reports card on file', async ({
    page,
  }) => {
    const paymentLink = 'https://pay.example.com/invoice_123';
    await installCorsPreflightStub(page, defaultCorsHeaders());
    await stubAuthMe(page, ADMIN_USER, defaultCorsHeaders());
    await stubVerificationInvoiceTransition(page, {
      initialClient: SCENARIOS.selfPayMissingCard,
      refreshedClient: {
        ...SCENARIOS.selfPayEligibleWithCard,
        verification_invoice_id: 'invoice_123',
        verification_invoice_sent_at: '2026-01-02T12:00:00.000Z',
        qb_stored_payment_method_id: 'pm_123',
      },
      paymentLink,
      headers: defaultCorsHeaders(),
    });

    await openCustomersTab(page);
    await assertInviteButtonInPortalColumn(page, false);

    await openProfileModal(page);
    await assertProfilePortalReadiness(page, {
      eligibility: 'Locked',
      verificationVisible: true,
      primaryBlocker: /Missing card on file/i,
    });

    await clickVerificationInvoiceAndWaitForRefresh(page);

    await assertProfilePortalReadiness(page, {
      eligibility: 'Eligible',
      verificationVisible: false,
    });

    const dialog = page.getByTestId(`lead-profile-dialog-${JORDAN_CLIENT_ID}`);
    await dialog.getByRole('button', { name: 'Close' }).first().click();
    await openCustomersTab(page);
    await assertEligibleBadge(page, true);
    await assertInviteButtonInPortalColumn(page, true);
  });
});
