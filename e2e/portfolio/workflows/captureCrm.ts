import { expect, type Page } from '@playwright/test';
import { PORTFOLIO_CLIENT_ID } from '../fixtures/portfolioData';
import { stubQuickBooksConnected, stubQuickBooksDisconnected } from '../fixtures/portfolioStubs';
import { captureElement, captureFullPage } from '../helpers/screenshot';
import { navigateAndCapture } from '../helpers/navigation';
import { waitForDashboardReady, waitForTableLoad, stabilizePage } from '../helpers/waits';

function leadProfileDialog(page: Page) {
  return page.getByRole('dialog', { name: /Jordan Rivera/i });
}

/**
 * CRM admin workflow screenshots (authenticated).
 * Filenames map to portfolio sorting conventions (prefix by module).
 */
export async function captureCrmPortfolio(page: Page): Promise<void> {
  // Warm up session before first capture (auth + layout).
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForDashboardReady(page);

  // ─── 1. Main Dashboard ───────────────────────────────────────────────
  await navigateAndCapture(page, '/', {
    filename: 'dashboard-overview',
    waitForDashboard: true,
  });

  await captureElement(
    page.getByText('Due Date Calendar').locator('xpath=ancestor::div[contains(@class,"rounded")]').first(),
    'dashboard-due-date-calendar',
    { stabilize: true }
  ).catch(async () => {
    await captureFullPage(page, 'dashboard-due-date-calendar-fallback');
  });

  const statsSection = page.getByRole('heading', { name: 'Dashboard Overview' }).locator('..');
  if (await statsSection.isVisible().catch(() => false)) {
    await captureElement(statsSection, 'dashboard-kpi-row');
    await captureFullPage(page, 'dashboard-kpi-total-doulas-55');
    await captureFullPage(page, 'dashboard-kpi-total-clients-422');
    await captureFullPage(page, 'dashboard-kpi-pending-contracts');
    await captureFullPage(page, 'dashboard-kpi-overdue-notes');
    await captureFullPage(page, 'dashboard-kpi-monthly-revenue');
  }

  // ─── 2. Leads / Clients ──────────────────────────────────────────────
  await navigateAndCapture(page, '/clients', {
    filename: 'clients-table',
    waitForTable: true,
    afterNavigate: async (p) => {
      await expect(p.getByRole('heading', { name: 'Clients' })).toBeVisible();
    },
  });

  await captureFullPage(page, 'clients-status-badges');
  await captureElement(
    page.locator('button').filter({ hasText: 'Export' }).first(),
    'clients-export-action'
  ).catch(() => {});
  await captureElement(
    page.locator('button').filter({ hasText: 'Send Contract' }).first(),
    'clients-send-contract-action'
  ).catch(() => {});

  // ─── 3. Client profile modal ─────────────────────────────────────────
  await page.goto(`/clients/${PORTFOLIO_CLIENT_ID}`, { waitUntil: 'domcontentloaded' });
  await expect(leadProfileDialog(page)).toBeVisible({ timeout: 20_000 });
  await stabilizePage(page);
  await captureFullPage(page, 'client-detail-profile-modal');
  await captureFullPage(page, 'client-detail-intake-sections');
  await captureFullPage(page, 'client-detail-contact-info');
  await captureFullPage(page, 'client-detail-services-requested');
  await captureFullPage(page, 'client-detail-demographics');
  await captureFullPage(page, 'client-detail-admin-notes');
  await page.keyboard.press('Escape');
  await leadProfileDialog(page).waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

  // ─── 4. Customers / QuickBooks sync ──────────────────────────────────
  await page.goto('/clients/new', { waitUntil: 'domcontentloaded' });
  await waitForTableLoad(page).catch(() => {});
  await stabilizePage(page);
  await captureFullPage(page, 'customers-quickbooks-sync-panel');
  await captureFullPage(page, 'customers-quickbooks-connection-state');

  // ─── 5. Team management ──────────────────────────────────────────────
  await navigateAndCapture(page, '/team', {
    filename: 'team-directory',
    afterNavigate: async (p) => {
      await expect(p.getByRole('heading', { name: 'Team Members', exact: true })).toBeVisible();
      await waitForTableLoad(p);
    },
  });

  await page.getByRole('button', { name: 'Invite Member' }).click();
  await expect(page.getByText('Invite Team Member')).toBeVisible();
  await captureFullPage(page, 'team-invite-workflow');
  await page.keyboard.press('Escape');

  await captureElement(
    page.locator('select').filter({ has: page.locator('option[value="doula"]') }).first(),
    'team-role-dropdowns'
  ).catch(() => {});

  // ─── 6. Doulas directory ─────────────────────────────────────────────
  await navigateAndCapture(page, '/hours', {
    filename: 'doulas-directory-listing',
    waitForTable: true,
    afterNavigate: async (p) => {
      await expect(p.getByRole('heading', { name: 'Doulas' })).toBeVisible();
    },
  });
  await captureFullPage(page, 'doulas-assignment-counts');

  // ─── 7. Doula assignments ────────────────────────────────────────────
  await page.getByRole('tab', { name: 'Assignments' }).click();
  await waitForTableLoad(page);
  await captureFullPage(page, 'doula-assignments-table');
  await captureFullPage(page, 'doula-assignments-filters');

  await page.getByText('All birth outcomes', { exact: false }).first().click().catch(() => {});
  await captureFullPage(page, 'doula-assignments-birth-outcome-filters');
  await page.keyboard.press('Escape');
  await stabilizePage(page);

  // ─── 8. Assignment detail sidebar ────────────────────────────────────
  await page.locator('table tbody tr').first().click({ force: true });
  await expect(page.getByRole('heading', { name: 'Assignment Details' })).toBeVisible({
    timeout: 15_000,
  });
  await stabilizePage(page);
  await captureFullPage(page, 'assignment-detail-sidebar');
  await captureFullPage(page, 'assignment-detail-pairing-hospital-services');
  await captureFullPage(page, 'assignment-detail-role-edd-tracking');
  await page.keyboard.press('Escape');

  // ─── 9. Payments ledger ──────────────────────────────────────────────
  await navigateAndCapture(page, '/payments', {
    filename: 'payments-ledger-table',
    waitForTable: true,
    afterNavigate: async (p) => {
      await expect(p.getByRole('heading', { name: 'Payments' })).toBeVisible();
    },
  });
  await captureFullPage(page, 'payments-ledger-filters');
  await captureFullPage(page, 'payments-stripe-quickbooks-examples');

  // ─── 10. Reconciliation engine ───────────────────────────────────────
  await page.keyboard.press('Escape');
  await navigateAndCapture(page, '/payments/reconciliation', {
    filename: 'reconciliation-engine',
    waitForTable: true,
    afterNavigate: async (p) => {
      await expect(p.getByRole('heading', { name: 'Reconciliation', exact: true })).toBeVisible({
        timeout: 20_000,
      });
    },
  });
  await captureFullPage(page, 'reconciliation-invoice-payment-matching');
  await captureFullPage(page, 'reconciliation-grouped-payments-states');

  // ─── 11. Invoices ────────────────────────────────────────────────────
  await navigateAndCapture(page, '/invoices', {
    filename: 'invoices-table',
    waitForTable: true,
    afterNavigate: async (p) => {
      await expect(p.getByRole('heading', { name: 'Invoices' })).toBeVisible();
    },
  });
  await captureFullPage(page, 'invoices-filters-status-badges');

  // ─── 12. Invoice edit modal ──────────────────────────────────────────
  const firstInvoiceRow = page.locator('table tbody tr').first();
  if (await firstInvoiceRow.isVisible().catch(() => false)) {
    await firstInvoiceRow.click();
    await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 10_000 });
    await stabilizePage(page);
    await captureFullPage(page, 'invoice-edit-modal');
    await page.keyboard.press('Escape');
  }

  // ─── 13. QuickBooks integration ──────────────────────────────────────
  await stubQuickBooksDisconnected(page);
  await navigateAndCapture(page, '/integrations/quickbooks', {
    filename: 'quickbooks-oauth-disconnected',
    afterNavigate: async (p) => {
      await expect(p.getByText('QuickBooks Integration')).toBeVisible({ timeout: 20_000 });
    },
  });

  await stubQuickBooksConnected(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await stabilizePage(page);
  await captureFullPage(page, 'quickbooks-connection-workflow-connected');

  // ─── 14. Demographics analytics ──────────────────────────────────────
  await navigateAndCapture(page, '/demographics', {
    filename: 'demographics-analytics-dashboard',
    afterNavigate: async (p) => {
      await expect(p.getByRole('heading', { name: 'Demographics' })).toBeVisible();
    },
  });
}
