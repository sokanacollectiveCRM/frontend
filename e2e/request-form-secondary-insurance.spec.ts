import { test, expect } from '@playwright/test';
import {
  clickFormNext,
  fillPregnancyStepMinimum,
} from './helpers/requestForm';

async function goToPaymentStep(page: import('@playwright/test').Page) {
  await page.goto('/request', { waitUntil: 'load' });
  await page.getByRole('heading', { name: /Services Interested In/i }).waitFor({ state: 'visible', timeout: 20000 });

  // Step 0
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByRole('checkbox', { name: 'Labor Support' }).check();
  await page.locator('#service_support_details').fill('Support details for testing.');
  await clickFormNext(page);

  // Step 1
  await page.locator('#firstname').fill('Test');
  await page.locator('#lastname').fill('User');
  await page.locator('#email').fill('test.user@example.com');
  await page.locator('#phone_number').fill('555-555-5555');
  await page.locator('#preferred_contact_method').selectOption({ label: 'Email' });
  await page.locator('#pronouns').selectOption({ label: 'They/Them' });
  await page.locator('#age').fill('28');
  await clickFormNext(page);

  // Step 2
  await page.locator('#address').fill('123 Main St');
  await page.locator('#city').fill('Chicago');
  await page.locator('#state').fill('IL');
  await page.locator('#zip_code').fill('60601');
  await page.locator('#pets').fill('None');
  await clickFormNext(page);

  // Step 3 optional
  await clickFormNext(page);

  // Step 4 required
  await page.locator('#referral_source').selectOption({ label: 'Google' });
  await clickFormNext(page);

  // Step 5 optional
  await clickFormNext(page);

  // Step 6 required subset
  await fillPregnancyStepMinimum(page);
  await clickFormNext(page);

  // Step 7 optional
  await clickFormNext(page);

  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
}

test.describe('Request form — secondary insurance conditional required fields (E2E)', () => {
  test.use({ viewport: { width: 500, height: 900 } });

  test('when Secondary Insurance is checked, secondary fields are required', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await page.getByText('Private/Commercial Insurance', { exact: true }).click();

    await page.locator('#insurance_policy_holder_name').fill('Test User');
    await page.locator('#insurance_policy_holder_dob').fill('1990-01-15');
    await page.locator('#insurance_policy_holder_relationship').selectOption({ label: 'Self' });
    await page.locator('#insurance_provider').fill('Aetna');
    await page.locator('#insurance_member_id').fill('MEMBER-123');
    await page.locator('#policy_number').fill('POLICY-456');
    await page.locator('#insurance_plan_type').selectOption({ label: 'PPO' });

    // Turn on secondary insurance.
    await page.locator('#has_secondary_insurance').check();

    // Try Next without filling secondary fields.
    await clickFormNext(page);
    await expect(page.getByText('Please enter the secondary insurance provider.')).toBeVisible();
    await expect(page.getByText('Please enter the secondary insurance member ID.')).toBeVisible();
    await expect(page.getByText('Please enter the secondary policy number.')).toBeVisible();

    await page.locator('#secondary_insurance_provider').fill('BCBS');
    await page.locator('#secondary_insurance_member_id').fill('SEC-999');
    await page.locator('#secondary_policy_number').fill('SEC-POL-999');

    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Client Demographics' })).toBeVisible();
  });

  test('unchecking Secondary Insurance clears secondary errors and allows progress', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await page.getByText('Private/Commercial Insurance', { exact: true }).click();

    await page.locator('#insurance_policy_holder_name').fill('Test User');
    await page.locator('#insurance_policy_holder_dob').fill('1990-01-15');
    await page.locator('#insurance_policy_holder_relationship').selectOption({ label: 'Self' });
    await page.locator('#insurance_provider').fill('Aetna');
    await page.locator('#insurance_member_id').fill('MEMBER-123');
    await page.locator('#policy_number').fill('POLICY-456');
    await page.locator('#insurance_plan_type').selectOption({ label: 'PPO' });

    await page.locator('#has_secondary_insurance').check();
    await clickFormNext(page);
    await expect(page.getByText('Please enter the secondary policy number.')).toBeVisible();

    // Turn it off; Next should work without secondary fields.
    await page.locator('#has_secondary_insurance').uncheck();
    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Client Demographics' })).toBeVisible();
  });
});

