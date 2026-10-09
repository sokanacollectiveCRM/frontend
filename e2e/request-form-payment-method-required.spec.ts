import { test, expect } from '@playwright/test';
import {
  clickFormNext,
  reachPaymentStep,
} from './helpers/requestForm';

test.describe('Request form — payment method optional (E2E)', () => {
  test.use({ viewport: { width: 500, height: 900 } });

  test('can proceed past Payment step without selecting payment method', async ({ page }) => {
    await reachPaymentStep(page);

    await clickFormNext(page);
    await expect(page.getByText('Client Demographics')).toBeVisible();
  });
});
