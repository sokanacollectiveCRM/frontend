import { test, expect } from '@playwright/test';

test.describe('Request form — payment method required (E2E)', () => {
  test.use({ viewport: { width: 500, height: 900 } });

  test('cannot proceed past Payment step without selecting payment method', async ({ page }) => {
    // Reuse the same “fast path” to the Payment step by leveraging the fact that
    // earlier steps are validated by ids.
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

    // Try Next without selecting a payment method
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Please select how you plan to pay for services.')).toBeVisible();

    // Selecting a payment method should clear the error.
    await page.locator('#payment_method').click();
    await page.getByText('Self-Pay', { exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Client Demographics')).toBeVisible();
  });
});

