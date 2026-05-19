import { test, expect } from '@playwright/test';
import {
  clickFormNext,
  fillPregnancyStepMinimum,
} from './helpers/requestForm';

async function goToPaymentStep(page: import('@playwright/test').Page) {
  await page.setViewportSize({ width: 500, height: 900 });
  await page.goto('/request', { waitUntil: 'load' });
  await page.getByRole('heading', { name: /Services Interested In/i }).waitFor({ state: 'visible', timeout: 20000 });

  // Step 0 (services interested)
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByRole('checkbox', { name: 'Labor Support' }).check();
  await page.locator('#service_support_details').fill('Support details for testing.');
  await clickFormNext(page);

  // Step 1 (client details)
  await page.locator('#firstname').fill('Test');
  await page.locator('#lastname').fill('User');
  await page.locator('#email').fill('test.user@example.com');
  await page.locator('#phone_number').fill('555-555-5555');
  await page.locator('#preferred_contact_method').selectOption({ label: 'Email' });
  await page.locator('#pronouns').selectOption({ label: 'They/Them' });
  await page.locator('#age').fill('28');
  await clickFormNext(page);

  // Step 2 (home details)
  await page.locator('#address').fill('123 Main St');
  await page.locator('#city').fill('Chicago');
  await page.locator('#state').fill('IL');
  await page.locator('#zip_code').fill('60601');
  await page.locator('#pets').fill('None');
  await clickFormNext(page);

  // Step 3 (family) optional
  await clickFormNext(page);

  // Step 4 (referral) required
  await page.locator('#referral_source').selectOption({ label: 'Google' });
  await clickFormNext(page);

  // Step 5 (health) optional
  await clickFormNext(page);

  // Step 6 (pregnancy) required subset
  await fillPregnancyStepMinimum(page);
  await clickFormNext(page);

  // Step 7 (past pregnancies) optional
  await clickFormNext(page);

  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
}

test.describe('Request form — payment method selection (E2E)', () => {
  test('Not sure: insurance detail fields stay hidden', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await page.getByText('Not sure / Need help figuring this out', { exact: true }).click();

    await expect(page.locator('#insurance_provider')).toHaveCount(0);
    await expect(page.locator('#insurance_member_id')).toHaveCount(0);
    await expect(page.locator('#policy_number')).toHaveCount(0);
  });

  test('Private/Commercial Insurance: insurance fields render and are required', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await page.getByText('Private/Commercial Insurance', { exact: true }).click();

    await expect(page.locator('#insurance_policy_holder_name')).toBeVisible();
    await expect(page.locator('#insurance_provider')).toBeVisible();
    await expect(page.locator('#insurance_member_id')).toBeVisible();
    await expect(page.locator('#policy_number')).toBeVisible();
    await expect(page.locator('#insurance_plan_type')).toBeVisible();

    // Try Next without filling; should show required errors.
    await clickFormNext(page);
    await expect(page.getByText('Please enter the policy holder name.', { exact: true })).toBeVisible();
    await expect(page.getByText('Please enter your insurance company name.', { exact: true })).toBeVisible();

    // Fill required insurance fields and proceed.
    await page.locator('#insurance_policy_holder_name').fill('Test User');
    await page.locator('#insurance_policy_holder_dob').fill('1990-01-15');
    await page.locator('#insurance_policy_holder_relationship').selectOption({ label: 'Self' });
    await page.locator('#insurance_provider').fill('Aetna');
    await page.locator('#insurance_member_id').fill('MEMBER-123');
    await page.locator('#insurance_plan_type').selectOption({ label: 'PPO' });

    await clickFormNext(page);
    await expect(page.getByText('Client Demographics')).toBeVisible();
  });

  test('Medicaid is not offered on the request form payment step', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await expect(page.getByText('Medicaid', { exact: true })).toHaveCount(0);
  });
});

