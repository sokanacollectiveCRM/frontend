import { test, expect } from '@playwright/test';
import {
  reachPaymentStep,
  clickFormNext,
} from './helpers/requestForm';

async function goToPaymentStep(page: import('@playwright/test').Page) {
  await reachPaymentStep(page);
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
