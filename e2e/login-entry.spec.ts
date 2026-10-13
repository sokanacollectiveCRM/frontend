import { test, expect } from '@playwright/test';

test('unauthenticated entry uses the Cove login without legacy signup links', async ({
  page,
}) => {
  await page.route('**/auth/me', (route) =>
    route.fulfill({
      status: 401,
      json: { error: 'No session token provided' },
    })
  );
  for (const path of ['/', '/login?next=%2F']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page.getByText('Cove', { exact: true })).toHaveCount(2);
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Log In', exact: true })
    ).toBeVisible();
    await expect(page.locator('img[src="/logo.jpeg"]')).toHaveCount(0);
    await expect(page.locator('a[href="/signup"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /sign up/i })).toHaveCount(0);
    await expect(page.getByText(/Don't have an account/)).toHaveCount(0);
  }
});
