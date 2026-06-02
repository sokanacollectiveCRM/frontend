/**
 * Sokana Collective CRM — Portfolio Screenshot Capture
 *
 * Production utility for generating consulting-case-study assets from the
 * running frontend. All images land in one folder for manual sorting later:
 *   portfolio-assets/sokana-all-screenshots/
 *
 * @see e2e/portfolio/README.md
 */

import { test } from '@playwright/test';
import { SCREENSHOT_OUTPUT_DIR } from './config';
import { ensureScreenshotDir } from './helpers/screenshot';
import { preparePortfolioAuth } from './helpers/auth';
import { captureCrmPortfolio } from './workflows/captureCrm';
import { captureRequestFormPortfolio } from './workflows/captureRequestForm';

test.describe.configure({ mode: 'serial', timeout: 10 * 60_000 });

test.beforeAll(() => {
  const dir = ensureScreenshotDir();
  console.log(`[portfolio] Screenshot output: ${dir}`);
});

test('CRM — authenticated admin workflows', async ({ page }) => {
  await preparePortfolioAuth(page);
  await captureCrmPortfolio(page);
});

test('Public request form — 9-step intake funnel', async ({ page }) => {
  // No auth required for /request
  await captureRequestFormPortfolio(page);
});

test.afterAll(() => {
  console.log(`[portfolio] Done. Review PNGs in: ${SCREENSHOT_OUTPUT_DIR}`);
});
