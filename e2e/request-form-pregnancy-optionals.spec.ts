import { test, expect } from '@playwright/test';
import {
  clickFormNext,
  completeStep0Services,
  completeStep1ClientDetails,
  completeStep2HomeDetailsAddress,
  completeStep3FamilyMembers,
  completeStep4Referral,
  completeStep5HealthHistory,
  fillPregnancyStepWithBirthLocation,
  fillRequestFormDueDate,
} from './helpers/requestForm';

async function reachPregnancyStep(page: import('@playwright/test').Page) {
  await page.setViewportSize({ width: 500, height: 900 });
  await page.goto('/request', { waitUntil: 'load' });
  await page.getByRole('heading', { name: /Services Interested In/i }).waitFor({ state: 'visible', timeout: 20000 });
  await expect(page.getByRole('heading', { name: /Services Interested In/i })).toBeVisible();
  await completeStep0Services(page);
  await expect(page.getByText('Client Details')).toBeVisible();
  await completeStep1ClientDetails(page);
  await completeStep2HomeDetailsAddress(page);
  await clickFormNext(page);
  await completeStep3FamilyMembers(page);
  await completeStep4Referral(page);
  await completeStep5HealthHistory(page);
  await expect(page.getByText('Pregnancy/Baby', { exact: true })).toBeVisible();
}

test.describe('Request form — pregnancy step (E2E)', () => {
  test('Home birth: birth location name is required; baby name stays optional', async ({ page }) => {
    await reachPregnancyStep(page);

    await fillRequestFormDueDate(page);
    await page.locator('#birth_location').selectOption({ label: 'Home' });
    await page.locator('#number_of_babies').selectOption({ label: 'Singleton' });
    await page.locator('#provider_type').selectOption({ label: 'Midwife' });
    await page.locator('#pregnancy_number').fill('1');

    await expect(page.locator('label[for="birth_hospital"]')).toContainText('Home birth location');
    await expect(page.locator('#birth_hospital')).toHaveValue('');
    await expect(page.locator('#baby_name')).toHaveValue('');

    await clickFormNext(page);
    await expect(page.getByText('Please enter your home birth location', { exact: false })).toBeVisible();

    await page.locator('#birth_hospital').fill('123 Main St');
    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Past Pregnancies' })).toBeVisible();
  });

  test('Hospital & Birth Center: location name is required with contextual labels', async ({
    page,
  }) => {
    await reachPregnancyStep(page);

    await fillPregnancyStepWithBirthLocation(page, 'Hospital');
    await expect(page.locator('label[for="birth_hospital"]')).toContainText('Hospital name');

    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Past Pregnancies' })).toBeVisible();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Pregnancy/Baby', { exact: true })).toBeVisible();
    await page.locator('#birth_location').selectOption({ label: 'Birth Center' });
    await page.locator('#birth_hospital').clear();
    await expect(page.locator('label[for="birth_hospital"]')).toContainText('Birth center name or location');

    await clickFormNext(page);
    await expect(page.getByText('Please enter the birth center name or location', { exact: false })).toBeVisible();

    await page.locator('#birth_hospital').fill('Sunrise Birth Center');
    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Past Pregnancies' })).toBeVisible();
  });
});
