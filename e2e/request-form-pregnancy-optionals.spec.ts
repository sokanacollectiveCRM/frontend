import { test, expect } from '@playwright/test';
import {
  clickFormNext,
  fillPregnancyStepMinimum,
  fillPregnancyStepWithBirthLocation,
} from './helpers/requestForm';

async function completeStep0Services(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByRole('checkbox', { name: 'Labor Support' }).check();

  await page.locator('#service_support_details').fill('Support details for testing.');
  await clickFormNext(page);
}

async function completeStep1ClientDetails(page: import('@playwright/test').Page) {
  await page.locator('#firstname').fill('Test');
  await page.locator('#lastname').fill('User');
  await page.locator('#email').fill('test.user@example.com');
  await page.locator('#phone_number').fill('555-555-5555');
  await page.locator('#preferred_contact_method').selectOption({ label: 'Email' });
  await page.locator('#pronouns').selectOption({ label: 'They/Them' });
  await page.locator('#age').fill('28');
  await clickFormNext(page);
}

async function completeStep2HomeDetails(page: import('@playwright/test').Page) {
  await page.locator('#address').fill('123 Main St');
  await page.locator('#city').fill('Chicago');
  await page.locator('#state').fill('IL');
  await page.locator('#zip_code').fill('60601');
  await page.locator('#pets').fill('None');
  await clickFormNext(page);
}

async function completeStep3FamilyMembers(page: import('@playwright/test').Page) {
  await clickFormNext(page);
}

async function completeStep4Referral(page: import('@playwright/test').Page) {
  await page.locator('#referral_source').selectOption({ label: 'Google' });
  await clickFormNext(page);
}

async function completeStep5HealthHistory(page: import('@playwright/test').Page) {
  await clickFormNext(page);
}

async function reachPregnancyStep(page: import('@playwright/test').Page) {
  await page.setViewportSize({ width: 500, height: 900 });
  await page.goto('/request', { waitUntil: 'load' });
  await page.getByRole('heading', { name: /Services Interested In/i }).waitFor({ state: 'visible', timeout: 20000 });
  await expect(page.getByRole('heading', { name: /Services Interested In/i })).toBeVisible();
  await completeStep0Services(page);
  await expect(page.getByText('Client Details')).toBeVisible();
  await completeStep1ClientDetails(page);
  await completeStep2HomeDetails(page);
  await completeStep3FamilyMembers(page);
  await completeStep4Referral(page);
  await completeStep5HealthHistory(page);
  await expect(page.getByText('Pregnancy/Baby', { exact: true })).toBeVisible();
}

test.describe('Request form — pregnancy step optional fields (E2E)', () => {
  test('Home birth: can proceed without hospital and baby name', async ({ page }) => {
    await reachPregnancyStep(page);

    await fillPregnancyStepMinimum(page);

    // Leave these blank (tickets: hospital optional for Home Birth, baby name optional)
    await expect(page.locator('#birth_hospital')).toHaveValue('');
    await expect(page.locator('#baby_name')).toHaveValue('');

    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Past Pregnancies' })).toBeVisible();
  });

  test('Hospital & Birth Center: hospital name remains optional and does not block Next', async ({
    page,
  }) => {
    await reachPregnancyStep(page);

    await fillPregnancyStepWithBirthLocation(page, 'Hospital');

    await expect(page.locator('#birth_hospital')).toHaveValue('');

    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Past Pregnancies' })).toBeVisible();

    // Go back and try Birth Center as well.
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Pregnancy/Baby', { exact: true })).toBeVisible();
    await page.locator('#birth_location').selectOption({ label: 'Birth Center' });
    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Past Pregnancies' })).toBeVisible();
  });
});
