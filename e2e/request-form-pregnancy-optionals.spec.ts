import { test, expect } from '@playwright/test';

async function completeStep0Services(page: any) {
  // Multi-select uses a button that initially shows "Select"
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByLabel('Labor Support').check();

  await page.locator('#service_support_details').fill('Support details for testing.');
  await page.locator('#service_needed').fill('Labor support.');
  await page.getByRole('button', { name: 'Next' }).click();
}

async function completeStep1ClientDetails(page: any) {
  await page.locator('#firstname').fill('Test');
  await page.locator('#lastname').fill('User');
  await page.locator('#email').fill('test.user@example.com');
  await page.locator('#phone_number').fill('555-555-5555');
  await page.locator('#preferred_contact_method').selectOption({ label: 'Email' });
  await page.locator('#pronouns').selectOption({ label: 'They/Them' });
  await page.getByRole('button', { name: 'Next' }).click();
}

async function completeStep2HomeDetails(page: any) {
  await page.locator('#address').fill('123 Main St');
  await page.locator('#city').fill('Chicago');
  await page.locator('#state').fill('IL');
  await page.locator('#zip_code').fill('60601');
  await page.getByRole('button', { name: 'Next' }).click();
}

async function completeStep3FamilyMembers(page: any) {
  // This step is optional; proceed without filling.
  await page.getByRole('button', { name: 'Next' }).click();
}

async function completeStep4Referral(page: any) {
  await page.locator('#referral_source').selectOption({ label: 'Google' });
  await page.getByRole('button', { name: 'Next' }).click();
}

async function completeStep5HealthHistory(page: any) {
  // Optional; proceed.
  await page.getByRole('button', { name: 'Next' }).click();
}

async function reachPregnancyStep(page: any) {
  await page.setViewportSize({ width: 500, height: 900 });
  await page.goto('/request', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('What service(s) are you interested in?')).toBeVisible();
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

    await page.locator('input[name="due_date"]').fill('01/01/2027');
    await page.locator('#birth_location').selectOption({ label: 'Home' });
    await page.locator('#number_of_babies').selectOption({ label: 'Singleton' });
    await page.locator('#pregnancy_number').fill('1');

    // Leave these blank (tickets: hospital optional for Home Birth, baby name optional)
    await expect(page.locator('#birth_hospital')).toHaveValue('');
    await expect(page.locator('#baby_name')).toHaveValue('');

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Past Pregnancie(s)')).toBeVisible();
  });

  test('Hospital & Birth Center: hospital name remains optional and does not block Next', async ({ page }) => {
    await reachPregnancyStep(page);

    await page.locator('input[name="due_date"]').fill('01/01/2027');

    await page.locator('#birth_location').selectOption({ label: 'Hospital' });
    await page.locator('#number_of_babies').selectOption({ label: 'Singleton' });
    await page.locator('#pregnancy_number').fill('1');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Past Pregnancie(s)')).toBeVisible();

    // Go back and try Birth Center as well.
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Pregnancy/Baby', { exact: true })).toBeVisible();
    await page.locator('#birth_location').selectOption({ label: 'Birth Center' });
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Past Pregnancie(s)')).toBeVisible();
  });
});

