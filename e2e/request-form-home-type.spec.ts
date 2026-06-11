import { test, expect } from '@playwright/test';
import {
  advanceFromHomeDetailsToSubmit,
  checkHomeTypeOptions,
  clickFormNext,
  completeStep2HomeDetailsAddress,
  HOME_TYPE_CHECKBOX_LABELS,
  reachHomeDetailsStep,
  submitRequestForm,
} from './helpers/requestForm';

test.describe('Request form — Home Type multi-select (E2E)', () => {
  test('shows check-all-that-apply options on Home Details step', async ({ page }) => {
    await reachHomeDetailsStep(page);

    await expect(page.getByText('Home type (check all that apply)')).toBeVisible();
    for (const label of Object.values(HOME_TYPE_CHECKBOX_LABELS)) {
      await expect(page.getByRole('checkbox', { name: label, exact: true })).toBeVisible();
    }
  });

  test('allows multiple selections and advances', async ({ page }) => {
    await reachHomeDetailsStep(page);
    await completeStep2HomeDetailsAddress(page);

    await checkHomeTypeOptions(page, [
      HOME_TYPE_CHECKBOX_LABELS.rent,
      HOME_TYPE_CHECKBOX_LABELS.transitional,
    ]);

    await clickFormNext(page);
    await expect(page.locator('#referral_source')).toBeVisible();
  });

  test('requires description when Other is selected', async ({ page }) => {
    await reachHomeDetailsStep(page);
    await completeStep2HomeDetailsAddress(page);

    await page.getByRole('checkbox', { name: HOME_TYPE_CHECKBOX_LABELS.other, exact: true }).check();
    await clickFormNext(page);

    await expect(page.locator('[class*="form-error"]').filter({
      hasText: 'Please describe your housing situation',
    })).toBeVisible();

    await page.locator('#home_type_other').fill('Co-living in a converted garage unit');
    await clickFormNext(page);
    await expect(page.locator('#referral_source')).toBeVisible();
  });

  test('Prefer not to answer is mutually exclusive with other options', async ({ page }) => {
    await reachHomeDetailsStep(page);

    await page
      .getByRole('checkbox', { name: HOME_TYPE_CHECKBOX_LABELS.rent, exact: true })
      .check();
    await page
      .getByRole('checkbox', { name: HOME_TYPE_CHECKBOX_LABELS.preferNot, exact: true })
      .check();

    await expect(
      page.getByRole('checkbox', { name: HOME_TYPE_CHECKBOX_LABELS.rent, exact: true })
    ).not.toBeChecked();
    await expect(
      page.getByRole('checkbox', { name: HOME_TYPE_CHECKBOX_LABELS.preferNot, exact: true })
    ).toBeChecked();
  });

  test('submits home_type array and home_type_other to backend', async ({ page }) => {
    test.setTimeout(120000);
    const uniqueEmail = `home-type-e2e-${Date.now()}@example.com`;
    let capturedPayload:
      | {
          home_type?: string[];
          home_type_other?: string;
          email?: string;
          skip_email_notifications?: boolean;
        }
      | undefined;

    await page.route('**/requestService/requestSubmission', async (route) => {
      capturedPayload = route.request().postDataJSON() as typeof capturedPayload;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, clientId: 'e2e-mock-client' }),
      });
    });

    await page.setViewportSize({ width: 500, height: 900 });
    await page.goto('/request', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Fill with test data' }).click();
    await page
      .getByRole('heading', { name: /Services Interested In/i })
      .waitFor({ state: 'visible', timeout: 20000 });

    await clickFormNext(page);
    await page.locator('#email').fill(uniqueEmail);
    await clickFormNext(page);

    await expect(page.getByText('Home type (check all that apply)')).toBeVisible();
    await page
      .getByRole('checkbox', { name: HOME_TYPE_CHECKBOX_LABELS.rent, exact: true })
      .uncheck()
      .catch(() => {});
    await checkHomeTypeOptions(page, [
      HOME_TYPE_CHECKBOX_LABELS.other,
      HOME_TYPE_CHECKBOX_LABELS.shelter,
    ]);
    await page.locator('#home_type_other').fill('Emergency shelter placement — week 32');
    await clickFormNext(page);

    await advanceFromHomeDetailsToSubmit(page);

    await submitRequestForm(page);
    expect(capturedPayload?.email).toBe(uniqueEmail);
    expect(capturedPayload?.home_type).toEqual(
      expect.arrayContaining([
        HOME_TYPE_CHECKBOX_LABELS.other,
        HOME_TYPE_CHECKBOX_LABELS.shelter,
      ])
    );
    expect(capturedPayload?.home_type_other).toBe('Emergency shelter placement — week 32');
    expect(capturedPayload?.skip_email_notifications).toBe(true);

    await expect(page.getByText('Request Form Submitted Successfully', { exact: false })).toBeVisible({
      timeout: 15000,
    });
  });
});
