import { test, expect } from '@playwright/test';

async function clickNext(page: any) {
  await page.getByRole('button', { name: 'Next', exact: true }).click();
}

async function goToPaymentStep(page: any) {
  await page.setViewportSize({ width: 500, height: 900 });
  await page.goto('/request', { waitUntil: 'domcontentloaded' });

  // Step 0 (services interested)
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByLabel('Labor Support').check();
  await page.locator('#service_support_details').fill('Support details for testing.');
  await page.locator('#service_needed').fill('Labor support.');
  await clickNext(page);

  // Step 1 (client details)
  await page.locator('#firstname').fill('Test');
  await page.locator('#lastname').fill('User');
  await page.locator('#email').fill('test.user@example.com');
  await page.locator('#phone_number').fill('555-555-5555');
  await page.locator('#preferred_contact_method').selectOption({ label: 'Email' });
  await page.locator('#pronouns').selectOption({ label: 'They/Them' });
  await clickNext(page);

  // Step 2 (home details)
  await page.locator('#address').fill('123 Main St');
  await page.locator('#city').fill('Chicago');
  await page.locator('#state').fill('IL');
  await page.locator('#zip_code').fill('60601');
  await clickNext(page);

  // Step 3 (family) optional
  await clickNext(page);

  // Step 4 (referral) required
  await page.locator('#referral_source').selectOption({ label: 'Google' });
  await clickNext(page);

  // Step 5 (health) optional
  await clickNext(page);

  // Step 6 (pregnancy) required subset
  await page.locator('input[name="due_date"]').fill('01/01/2027');
  await page.locator('#birth_location').selectOption({ label: 'Home' });
  await page.locator('#number_of_babies').selectOption({ label: 'Singleton' });
  await page.locator('#pregnancy_number').fill('1');
  await clickNext(page);

  // Step 7 (past pregnancies) optional
  await clickNext(page);

  await expect(page.getByText('Payment')).toBeVisible();
}

test.describe('Request form — payment method selection (E2E)', () => {
  test('Self-Pay: insurance detail fields stay hidden', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await page.getByText('Self-Pay', { exact: true }).click();

    await expect(page.locator('#insurance_provider')).toHaveCount(0);
    await expect(page.locator('#insurance_member_id')).toHaveCount(0);
    await expect(page.locator('#policy_number')).toHaveCount(0);
  });

  test('Commercial Insurance: insurance fields render and are required', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await page.getByText('Commercial Insurance', { exact: true }).click();

    await expect(page.locator('#insurance_provider')).toBeVisible();
    await expect(page.locator('#insurance_member_id')).toBeVisible();
    await expect(page.locator('#policy_number')).toBeVisible();

    // Try Next without filling; should show required errors.
    await clickNext(page);
    await expect(page.getByText('Please enter your insurance provider.')).toBeVisible();
    await expect(page.getByText('Please enter your insurance member ID.')).toBeVisible();
    await expect(page.getByText('Please enter your policy number.')).toBeVisible();

    // Fill required insurance fields and proceed.
    await page.locator('#insurance_provider').fill('Aetna');
    await page.locator('#insurance_member_id').fill('MEMBER-123');
    await page.locator('#policy_number').fill('POLICY-456');

    await clickNext(page);
    await expect(page.getByText('Client Demographics')).toBeVisible();
  });

  test('Medicaid: insurance detail fields stay hidden', async ({ page }) => {
    await goToPaymentStep(page);

    await page.locator('#payment_method').click();
    await page.getByText('Medicaid', { exact: true }).click();

    await expect(page.locator('#insurance_provider')).toHaveCount(0);
    await expect(page.locator('#insurance_member_id')).toHaveCount(0);
    await expect(page.locator('#policy_number')).toHaveCount(0);
    await expect(page.getByText('billed through Medicaid', { exact: false })).toBeVisible();
  });
});

