import { test, expect } from '@playwright/test';

for (const invalid of [false, true]) {
  test(
    invalid
      ? 'expired invitation cannot set a password'
      : 'invitation asks only for matching passwords then opens login',
    async ({ page }) => {
      let submitted = 0;
      await page.route('**/auth/me', (route) =>
        route.fulfill({ status: 401, json: {} })
      );
      await page.route(
        'https://identitytoolkit.googleapis.com/**',
        async (route) => {
          const data = route.request().postDataJSON();
          if (invalid)
            return route.fulfill({
              status: 400,
              json: { error: { message: 'EXPIRED_OOB_CODE' } },
            });
          if (data.newPassword) submitted++;
          await route.fulfill({
            json: {
              email: 'invited@example.com',
              requestType: 'PASSWORD_RESET',
            },
          });
        }
      );
      await page.goto('/signup?oobCode=fictional-invite-code');
      await expect(
        page.getByRole('heading', { name: 'Create your password' })
      ).toBeVisible();
      if (invalid) {
        await expect(page.getByRole('alert')).toContainText(
          'expired or was already used'
        );
        await expect(page.locator('input')).toHaveCount(0);
        return;
      }
      await expect(page.locator('input')).toHaveCount(2);
      await expect(page.getByText('Sign up with Google')).toHaveCount(0);
      await page
        .getByLabel('Create password', { exact: true })
        .fill('ExamplePassword42!');
      await page
        .getByLabel('Confirm password', { exact: true })
        .fill('DifferentPassword42!');
      await page
        .getByRole('button', { name: 'Create password', exact: true })
        .click();
      await expect(page.getByRole('alert')).toHaveText(
        'Passwords do not match.'
      );
      expect(submitted).toBe(0);
      await page
        .getByLabel('Confirm password', { exact: true })
        .fill('ExamplePassword42!');
      await page
        .getByRole('button', { name: 'Create password', exact: true })
        .click();
      await expect(page).toHaveURL(/\/login$/);
      expect(submitted).toBe(1);
    }
  );
}

test('legacy invitation explains how to get a secure replacement', async ({
  page,
}) => {
  await page.goto(
    '/signup?email=invited@example.com&invite_token=old-tracking-token'
  );
  await expect(page.getByRole('alert')).toContainText('resend your invitation');
  await expect(page.locator('input')).toHaveCount(0);
});
