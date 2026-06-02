import fs from 'node:fs';
import type { Page } from '@playwright/test';
import { AUTH_STORAGE_PATH, BASE_URL, getAuthMode, type PortfolioAuthMode } from '../config';
import { installPortfolioStubs } from '../fixtures/portfolioStubs';

/**
 * Prepare page session before CRM captures.
 * - stub: install API mocks (no real backend required)
 * - storage: rely on playwright storageState from setup project
 * - login: fill /login when env credentials are set
 */
export async function preparePortfolioAuth(page: Page): Promise<PortfolioAuthMode> {
  const mode = getAuthMode();
  if (mode === 'stub') {
    await installPortfolioStubs(page);
    return mode;
  }
  if (mode === 'login') {
    await loginWithEnvCredentials(page);
    return mode;
  }
  // storage — storageState applied in config; still allow optional stub overlay
  if (process.env.PORTFOLIO_STUB_APIS === '1') {
    await installPortfolioStubs(page);
  }
  return mode;
}

/**
 * Automated login when PORTFOLIO_ADMIN_EMAIL and PORTFOLIO_ADMIN_PASSWORD are set.
 */
export async function loginWithEnvCredentials(page: Page): Promise<void> {
  const email = process.env.PORTFOLIO_ADMIN_EMAIL;
  const password = process.env.PORTFOLIO_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'PORTFOLIO_AUTH_MODE=login requires PORTFOLIO_ADMIN_EMAIL and PORTFOLIO_ADMIN_PASSWORD'
    );
  }
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.locator('#email, input[name="email"]').first().fill(email);
  await page.locator('#password, input[name="password"]').first().fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30_000 });
}

export function authStorageFileExists(): boolean {
  return fs.existsSync(AUTH_STORAGE_PATH);
}
