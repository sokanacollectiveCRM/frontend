import { test, expect } from '@playwright/test';
import {
  clickFormNext,
  fillPregnancyStepMinimum,
  selectNoPastPregnancies,
} from './helpers/requestForm';

test.describe('Request form — payment method required (E2E)', () => {
  test.use({ viewport: { width: 500, height: 900 } });

  test('cannot proceed past Payment step without selecting payment method', async ({ page }) => {
    // Reuse the same “fast path” to the Payment step by leveraging the fact that
    // earlier steps are validated by ids.
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

    // Step 7 — explicit past pregnancies choice
    await selectNoPastPregnancies(page);
    await clickFormNext(page);

    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();

    // Try Next without selecting a payment method
    await clickFormNext(page);
    await expect(page.getByText('Please select how you plan to pay for services.')).toBeVisible();

    // Selecting a payment method should clear the error.
    await page.locator('#payment_method').click();
    await page.getByText('Not sure / Need help figuring this out', { exact: true }).click();
    await clickFormNext(page);
    await expect(page.getByText('Client Demographics')).toBeVisible();
  });
});

