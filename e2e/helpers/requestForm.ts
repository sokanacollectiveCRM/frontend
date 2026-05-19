import { expect, type Page } from '@playwright/test';

export async function clickFormNext(page: Page) {
  const next = page.getByRole('button', { name: 'Next', exact: true });
  await expect(next).toBeEnabled({ timeout: 25000 });
  await next.click();
}

/**
 * Sets due date so react-hook-form receives it. Plain `.fill()` on react-datepicker
 * often leaves the popper open and does not reliably commit the value for Step6 validation.
 */
export async function fillRequestFormDueDate(
  page: Page,
  displayDate = '01/01/2027'
) {
  const input = page.locator('input[name="due_date"]');
  await input.click();
  await page.keyboard.press('Escape');
  await input.clear();
  await input.pressSequentially(displayDate, { delay: 25 });
  await input.blur();
  await page.keyboard.press('Escape').catch(() => {});
}

/** Minimum required fields for Pregnancy/Baby (matches step validation + zod). */
export async function fillPregnancyStepMinimum(page: Page) {
  await fillPregnancyStepWithBirthLocation(page, 'Home');
}

const BIRTH_LOCATION_NAME_SAMPLES: Record<
  'Home' | 'Hospital' | 'Birth Center' | 'Other',
  string
> = {
  Home: '123 Main St, Chicago',
  Hospital: 'Springfield General Hospital',
  'Birth Center': 'Sunrise Birth Center',
  Other: 'Planned birth location',
};

export async function fillPregnancyStepWithBirthLocation(
  page: Page,
  birthLocation: 'Home' | 'Hospital' | 'Birth Center' | 'Other'
) {
  await fillRequestFormDueDate(page);
  await page.locator('#birth_location').selectOption({ label: birthLocation });
  await page.locator('#birth_hospital').fill(BIRTH_LOCATION_NAME_SAMPLES[birthLocation]);
  await page.locator('#number_of_babies').selectOption({ label: 'Singleton' });
  await page.locator('#provider_type').selectOption({ label: 'Midwife' });
  await page.locator('#pregnancy_number').fill('1');
}
