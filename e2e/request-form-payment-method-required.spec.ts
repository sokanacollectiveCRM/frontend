import { test, expect } from '@playwright/test';
import {
  clickFormNext,
  reachPaymentStep,
} from './helpers/requestForm';

test.describe('Request form — payment method required (E2E)', () => {
  test.use({ viewport: { width: 500, height: 900 } });

  test('cannot proceed past Payment step without selecting payment method', async ({ page }) => {
    await reachPaymentStep(page);

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
