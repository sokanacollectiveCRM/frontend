import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { AUTH_STORAGE_PATH, BASE_URL } from './config';

/**
 * One-time (or occasional) auth bootstrap for live portfolio captures.
 *
 * Usage:
 *   PORTFOLIO_AUTH_MODE=login PORTFOLIO_ADMIN_EMAIL=... PORTFOLIO_ADMIN_PASSWORD=... \
 *     npx playwright test --config=playwright.portfolio.config.ts --project=setup
 *
 * Or run headed and complete login manually when env credentials are not set:
 *   npx playwright test --config=playwright.portfolio.config.ts --project=setup --headed
 */
setup('save admin storage state', async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_STORAGE_PATH), { recursive: true });

  const email = process.env.PORTFOLIO_ADMIN_EMAIL;
  const password = process.env.PORTFOLIO_ADMIN_PASSWORD;

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

  if (email && password) {
    await page.locator('#email, input[name="email"]').first().fill(email);
    await page.locator('#password, input[name="password"]').first().fill(password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 60_000 });
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({
      timeout: 30_000,
    });
  } else {
    // Manual login window (60s) — best practice when MFA or SSO is enabled.
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 120_000 });
  }

  await page.context().storageState({ path: AUTH_STORAGE_PATH });
});
