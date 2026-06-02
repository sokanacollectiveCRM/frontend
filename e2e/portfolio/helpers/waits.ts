import { expect, type Page } from '@playwright/test';
import { TIMEOUTS } from '../config';

const SPINNER_SELECTORS = [
  '[class*="animate-spin"]',
  '[class*="skeleton"]',
  '[data-slot="skeleton"]',
  'svg.animate-spin',
  '.Loader2',
].join(', ');

/**
 * Wait until common loading spinners and skeletons are gone.
 */
export async function waitForSpinnersGone(page: Page, timeout = TIMEOUTS.table): Promise<void> {
  const spinner = page.locator(SPINNER_SELECTORS).first();
  try {
    await spinner.waitFor({ state: 'hidden', timeout });
  } catch {
    // No spinner or already hidden — continue.
  }
}

/**
 * Dashboard home: welcome copy + calendar or stats (admin).
 */
export async function waitForDashboardReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.navigation });
  await page
    .waitForURL((url) => !url.pathname.includes('/login'), { timeout: TIMEOUTS.dashboard })
    .catch(() => {});

  // Session bootstrap copy on PrivateRoute
  await page.getByText('Loading session').waitFor({ state: 'hidden', timeout: TIMEOUTS.dashboard }).catch(() => {});

  await expect(
    page.getByRole('heading', { name: /Welcome back/i })
  ).toBeVisible({ timeout: TIMEOUTS.dashboard });
  await waitForSpinnersGone(page);
  // Calendar is shown for all staff; stats grid is admin-only.
  const calendar = page.getByText('Due Date Calendar', { exact: false });
  const statsHeading = page.getByRole('heading', { name: 'Dashboard Overview' });
  await Promise.race([
    calendar.waitFor({ state: 'visible', timeout: TIMEOUTS.dashboard }).catch(() => {}),
    statsHeading.waitFor({ state: 'visible', timeout: TIMEOUTS.dashboard }).catch(() => {}),
  ]);
  await waitForSpinnersGone(page);
}

/**
 * Data tables: wait for at least one row or empty-state message (not loading).
 */
export async function waitForTableLoad(
  page: Page,
  options?: { rowSelector?: string; emptyText?: RegExp | string }
): Promise<void> {
  const rowSelector = options?.rowSelector ?? 'table tbody tr';
  const rows = page.locator(rowSelector);
  const empty = options?.emptyText
    ? page.getByText(options.emptyText)
    : page.getByText(/no .* found|no data|no results/i);

  await waitForSpinnersGone(page);
  await Promise.race([
    rows.first().waitFor({ state: 'visible', timeout: TIMEOUTS.table }),
    empty.first().waitFor({ state: 'visible', timeout: TIMEOUTS.table }),
  ]).catch(async () => {
    // Some views use div-based grids — fall back to network idle.
    await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.table }).catch(() => {});
  });
  await waitForSpinnersGone(page);
}

/**
 * Brief settle + optional network idle for dynamic charts/modals.
 */
export async function stabilizePage(
  page: Page,
  options?: { networkIdle?: boolean; delayMs?: number }
): Promise<void> {
  const delayMs = options?.delayMs ?? TIMEOUTS.stabilize;
  if (options?.networkIdle !== false) {
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
  }
  await waitForSpinnersGone(page);
  if (delayMs > 0) {
    await page.waitForTimeout(delayMs);
  }
}
