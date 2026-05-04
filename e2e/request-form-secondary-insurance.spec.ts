import { test, expect } from '@playwright/test';

async function goToPaymentStep(page: any) {
  await page.goto('/request', { waitUntil: 'domcontentloaded' });

  // Step 0
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByLabel('Labor Support').check();
  await page.locator('#service_support_details').fill('Support details for testing.');
  await page.locator('#service_needed').fill('Labor support.');
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 1
  await page.locator('#firstname').fill('Test');
  await page.locator('#lastname').fill('User');
  await page.locator('#email').fill('test.user@example.com');
  await page.locator('#phone_number').fill('555-555-5555');
  await page.locator('#preferred_contact_method').selectOption({ label: 'Email' });
  await page.locator('#pronouns').selectOption({ label: 'They/Them' });
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 2
  await page.locator('#address').fill('123 Main St');
  await page.locator('#city').fill('Chicago');
  await page.locator('#state').fill('IL');
  await page.locator('#zip_code').fill('60601');
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 3 optional
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 4 required
  await page.locator('#referral_source').selectOption({ label: 'Google' });
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 5 optional
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 6 required subset
  await page.locator('input[name="due_date"]').fill('01/01/2027');
  await page.locator('#birth_location').selectOption({ label: 'Home' });
  await page.locator('#number_of_babies').selectOption({ label: 'Singleton' });
  await page.locator('#pregnancy_number').fill('1');
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 7 optional
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  await expect(page.getByText('Payment')).toBeVisible();
}

test.describe('Request form — secondary insurance conditional required fields (E2E)', () => {
  test.use({ viewport: { width: 500, height: 900 } });

  test('when Secondary Insurance is checked, secondary fields are required', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await page.getByText('Commercial Insurance', { exact: true }).click();

    await page.locator('#insurance_provider').fill('Aetna');
    await page.locator('#insurance_member_id').fill('MEMBER-123');
    await page.locator('#policy_number').fill('POLICY-456');

    // Turn on secondary insurance.
    await page.locator('#has_secondary_insurance').check();

    // Try Next without filling secondary fields.
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Please enter the secondary insurance provider.')).toBeVisible();
    await expect(page.getByText('Please enter the secondary insurance member ID.')).toBeVisible();
    await expect(page.getByText('Please enter the secondary policy number.')).toBeVisible();

    await page.locator('#secondary_insurance_provider').fill('BCBS');
    await page.locator('#secondary_insurance_member_id').fill('SEC-999');
    await page.locator('#secondary_policy_number').fill('SEC-POL-999');

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Client Demographics')).toBeVisible();
  });

  test('unchecking Secondary Insurance clears secondary errors and allows progress', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await page.getByText('Commercial Insurance', { exact: true }).click();

    await page.locator('#insurance_provider').fill('Aetna');
    await page.locator('#insurance_member_id').fill('MEMBER-123');
    await page.locator('#policy_number').fill('POLICY-456');

    await page.locator('#has_secondary_insurance').check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Please enter the secondary policy number.')).toBeVisible();

    // Turn it off; Next should work without secondary fields.
    await page.locator('#has_secondary_insurance').uncheck();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Client Demographics')).toBeVisible();
  });
});

