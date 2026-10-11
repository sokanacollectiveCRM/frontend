import { expect, test } from '@playwright/test';

/**
 * Live-dev run against a deployed or local full stack.
 * Skips unless every required credential env var is present.
 */
const requiredEnv = [
  'SCHEDULING_DEV_DOULA_EMAIL',
  'SCHEDULING_DEV_DOULA_PASSWORD',
  'SCHEDULING_DEV_CLIENT_EMAIL',
  'SCHEDULING_DEV_CLIENT_PASSWORD',
  'SCHEDULING_DEV_ADMIN_EMAIL',
  'SCHEDULING_DEV_ADMIN_PASSWORD',
] as const;

function missingEnv(): string[] {
  return requiredEnv.filter((key) => !process.env[key]);
}

async function loginStaff(
  page: import('@playwright/test').Page,
  email: string,
  password: string
) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#email, input[name="email"]').first().fill(email);
  await page
    .locator('#password, input[name="password"]')
    .first()
    .fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();

  const mfa = page.getByLabel('Verification code');
  if (await mfa.isVisible({ timeout: 5_000 }).catch(() => false)) {
    const code = process.env.SCHEDULING_DEV_MFA_CODE;
    if (!code) {
      throw new Error(
        'Identity MFA is required. Set SCHEDULING_DEV_MFA_CODE or disable MFA on the test accounts.'
      );
    }
    await mfa.fill(code);
    await page.getByRole('button', { name: /verify and continue/i }).click();
  }

  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 45_000,
  });
}

async function loginClient(
  page: import('@playwright/test').Page,
  email: string,
  password: string
) {
  await page.goto('/auth/client-login', { waitUntil: 'domcontentloaded' });
  await page.locator('#email, input[name="email"]').first().fill(email);
  await page
    .locator('#password, input[name="password"]')
    .first()
    .fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  await page.waitForURL(
    (url) =>
      !url.pathname.includes('/login') &&
      !url.pathname.includes('/client-login'),
    { timeout: 45_000 }
  );
}

test.describe('Scheduling live-dev smoke', () => {
  test('logs in as doula, client, and admin when credentials are provided', async ({
    page,
  }) => {
    const missing = missingEnv();
    test.skip(
      missing.length > 0,
      `Set ${missing.join(', ')} to run the live scheduling video.`
    );

    await loginStaff(
      page,
      process.env.SCHEDULING_DEV_DOULA_EMAIL as string,
      process.env.SCHEDULING_DEV_DOULA_PASSWORD as string
    );
    await page.goto('/doula-dashboard/schedule');
    await expect(page.getByRole('heading', { name: 'Schedule' })).toBeVisible();

    await loginClient(
      page,
      process.env.SCHEDULING_DEV_CLIENT_EMAIL as string,
      process.env.SCHEDULING_DEV_CLIENT_PASSWORD as string
    );
    await page.goto('/profile');
    await expect(page.getByTestId('book-visit-card').first()).toBeVisible();

    await loginStaff(
      page,
      process.env.SCHEDULING_DEV_ADMIN_EMAIL as string,
      process.env.SCHEDULING_DEV_ADMIN_PASSWORD as string
    );
    await page.goto('/scheduling');
    await expect(page.getByRole('heading', { name: 'Visits' })).toBeVisible();
  });
});
