import type { Page } from '@playwright/test';
import { BASE_URL, TIMEOUTS } from '../config';
import { captureFullPage } from './screenshot';
import { waitForDashboardReady, waitForTableLoad, stabilizePage } from './waits';

export type NavigateCaptureOptions = {
  /** Filename without path (e.g. `clients-table`). */
  filename: string;
  subdir?: string;
  /** Extra wait hook after navigation. */
  afterNavigate?: (page: Page) => Promise<void>;
  waitForTable?: boolean;
  waitForDashboard?: boolean;
  fullPage?: boolean;
};

/**
 * Navigate to a CRM route and save a stabilized full-page screenshot.
 */
export async function navigateAndCapture(
  page: Page,
  routePath: string,
  options: NavigateCaptureOptions
): Promise<string> {
  const url = routePath.startsWith('http') ? routePath : `${BASE_URL}${routePath}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.navigation });

  if (options.waitForDashboard) {
    await waitForDashboardReady(page);
  }
  if (options.waitForTable) {
    await waitForTableLoad(page);
  }
  if (options.afterNavigate) {
    await options.afterNavigate(page);
  }

  await stabilizePage(page);
  return captureFullPage(page, options.filename, {
    subdir: options.subdir,
    stabilize: true,
  });
}

/**
 * Click sidebar link by visible title (Dashboard, Leads, etc.).
 */
export async function navigateViaSidebar(page: Page, linkName: string | RegExp): Promise<void> {
  const link = page.getByRole('link', { name: linkName });
  await link.click();
  await page.waitForLoadState('domcontentloaded');
}
