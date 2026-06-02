import { test, expect } from '@playwright/test';
import {
  advanceFromHomeDetailsToSubmit,
  clickFormNext,
  completeStep2HomeDetailsAddress,
  reachHomeDetailsStep,
  submitRequestForm,
} from './helpers/requestForm';

const HOME_PEOPLE_QUESTION =
  'How many other people live in the home with you? (not including you or the baby)';

const HOME_PEOPLE_COUNT_OPTIONS = ['0', '1', '2', '3', '4', '5+'] as const;

test.describe('Request form — People in the Home counts (E2E)', () => {
  test('shows question and adult/youth count dropdowns on Home Details', async ({ page }) => {
    await reachHomeDetailsStep(page);

    await expect(page.getByText('Support Person')).toBeVisible();
    await expect(page.getByText(HOME_PEOPLE_QUESTION)).toBeVisible();
    await expect(page.locator('#home_adults_count')).toBeVisible();
    await expect(page.locator('#home_youth_count')).toBeVisible();

    for (const value of HOME_PEOPLE_COUNT_OPTIONS) {
      await expect(page.locator('#home_adults_count')).toContainText(value);
      await expect(page.locator('#home_youth_count')).toContainText(value);
    }
  });

  test('requires adult and youth counts before advancing', async ({ page }) => {
    await reachHomeDetailsStep(page);

    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Chicago');
    await page.locator('#state').fill('IL');
    await page.locator('#zip_code').fill('60601');
    await page.locator('#pets').fill('None');

    await clickFormNext(page);

    await expect(page.getByText('Home type (check all that apply)')).toBeVisible();
    await expect(
      page.locator('[class*="form-error"]').filter({
        hasText: /adults live in the home/i,
      })
    ).toBeVisible();
    await expect(
      page.locator('[class*="form-error"]').filter({
        hasText: /youth live in the home/i,
      })
    ).toBeVisible();
  });

  test('allows Next when both counts are selected', async ({ page }) => {
    await reachHomeDetailsStep(page);
    await completeStep2HomeDetailsAddress(page);

    await page.locator('#home_adults_count').selectOption({ label: '5+' });
    await page.locator('#home_youth_count').selectOption({ label: '2' });

    await clickFormNext(page);
    await expect(page.locator('#referral_source')).toBeVisible();
  });

  test('submits home_adults_count and home_youth_count to backend', async ({ page }) => {
    test.setTimeout(120000);
    const uniqueEmail = `home-people-e2e-${Date.now()}@example.com`;

    await page.setViewportSize({ width: 500, height: 900 });
    await page.goto('/request', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Fill with test data' }).click();
    await page
      .getByRole('heading', { name: /Services Interested In/i })
      .waitFor({ state: 'visible', timeout: 20000 });

    await clickFormNext(page);
    await page.locator('#email').fill(uniqueEmail);
    await clickFormNext(page);

    await expect(page.getByText(HOME_PEOPLE_QUESTION)).toBeVisible();
    await page.locator('#home_adults_count').selectOption({ label: '5+' });
    await page.locator('#home_youth_count').selectOption({ label: '3' });
    await clickFormNext(page);

    await advanceFromHomeDetailsToSubmit(page);

    const submissionResponse = page.waitForResponse(
      (res) =>
        res.url().includes('requestSubmission') &&
        res.request().method() === 'POST',
      { timeout: 90000 }
    );
    await submitRequestForm(page);

    const response = await submissionResponse;
    const postData = response.request().postDataJSON() as {
      home_adults_count?: string;
      home_youth_count?: string;
      email?: string;
    };

    expect(response.ok(), `submission failed: ${response.status()} ${await response.text()}`).toBe(
      true
    );
    expect(postData.email).toBe(uniqueEmail);
    expect(postData.home_adults_count).toBe('5+');
    expect(postData.home_youth_count).toBe('3');

    await expect(page.getByText('Request Form Submitted Successfully', { exact: false })).toBeVisible({
      timeout: 15000,
    });
  });
});
