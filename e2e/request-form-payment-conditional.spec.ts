import { test, expect } from '@playwright/test';
import {
  reachPaymentStep,
  clickFormNext,
} from './helpers/requestForm';

async function goToPaymentStep(page: import('@playwright/test').Page) {
  await reachPaymentStep(page);
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
