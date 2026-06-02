import { expect, type Page } from '@playwright/test';

export const HOME_ADULTS_COUNT_LABEL = 'Adult(s) (18 and older)';
export const HOME_YOUTH_COUNT_LABEL = 'Youth (under 18)';
export const HOME_PEOPLE_IN_HOME_QUESTION =
  'How many other people live in the home with you? (not including you or the baby)';
export const SUPPORT_PERSON_SECTION_LABEL = 'Support Person';
export const REFERRAL_CONTACT_FIELD_ID = 'referral_email';

export const VIEWPORT_PRESETS = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
} as const;

export type ViewportPreset = keyof typeof VIEWPORT_PRESETS;

/** Open the public /request form and wait for step 0. */
export async function openRequestForm(
  page: Page,
  viewport: { width: number; height: number } = VIEWPORT_PRESETS.mobile
) {
  await page.setViewportSize(viewport);
  await page.goto('/request', { waitUntil: 'load' });
  await page
    .getByRole('heading', { name: /Services Interested In/i })
    .waitFor({ state: 'visible', timeout: 20000 });
}

/**
 * Returns visible option-label issues: bad CSS or a word split mid-character across lines.
 */
export async function getOptionLabelWordWrapIssues(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll(
        '[class*="form-option-label"], [class*="form-option-box"], [class*="form-option-menu-item"], [class*="form-option-button"]'
      )
    ).filter((el) => (el.textContent?.trim()?.length ?? 0) > 0);

    const issues: string[] = [];

    for (const el of elements) {
      const style = window.getComputedStyle(el);
      if (style.wordBreak === 'break-all' || style.overflowWrap === 'anywhere') {
        issues.push(
          `Bad CSS on "${el.textContent?.trim()}": word-break=${style.wordBreak}, overflow-wrap=${style.overflowWrap}`
        );
      }

      const fullText = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      const words = fullText.split(' ').filter((word) => word.length >= 4);
      const lines = (el as HTMLElement).innerText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length <= 1) continue;

      for (const word of words) {
        for (let splitAt = 1; splitAt < word.length; splitAt += 1) {
          const prefix = word.slice(0, splitAt);
          const suffix = word.slice(splitAt);
          for (let lineIndex = 0; lineIndex < lines.length - 1; lineIndex += 1) {
            if (
              lines[lineIndex].endsWith(prefix) &&
              lines[lineIndex + 1].startsWith(suffix)
            ) {
              issues.push(`Word "${word}" split across lines in "${fullText}"`);
            }
          }
        }
      }
    }

    return issues;
  });
}

export async function assertOptionLabelsDoNotSplitWords(page: Page) {
  const issues = await getOptionLabelWordWrapIssues(page);
  expect(issues, issues.join('\n')).toEqual([]);
}

export async function clickFormNext(page: Page) {
  const next = page.getByRole('button', { name: 'Next', exact: true });
  await expect(next).toBeEnabled({ timeout: 25000 });
  await next.click();
}

export async function clickFormSubmit(page: Page) {
  const submit = page.getByRole('button', { name: 'Submit', exact: true });
  await expect(submit).toBeEnabled({ timeout: 25000 });
  await submit.click();
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
  await input.focus();
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

export const HOME_TYPE_CHECKBOX_LABELS = {
  rent: 'Rent, apartment or house',
  own: 'Own, apartment, condo, or house',
  family: 'Living with family or friends',
  subsidized: 'Subsidized or public housing',
  transitional: 'Transitional housing',
  shelter: 'Shelter or emergency housing',
  homelessness: 'Experiencing homelessness',
  other: 'Other',
  preferNot: 'Prefer not to answer',
} as const;

/** Step 0 — services interested (required). */
export async function completeStep0Services(page: Page) {
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByRole('checkbox', { name: 'Labor Support' }).check();
  await page.locator('#service_support_details').fill('Support details for testing.');
  await clickFormNext(page);
}

/** Step 1 — client details (required). */
export async function completeStep1ClientDetails(
  page: Page,
  email = 'test.user@example.com'
) {
  await page.locator('#firstname').fill('Test');
  await page.locator('#lastname').fill('User');
  await page.locator('#email').fill(email);
  await page.locator('#phone_number').fill('555-555-5555');
  await page.locator('#preferred_contact_method').selectOption({ label: 'Email' });
  await page.locator('#pronouns').selectOption({ label: 'They/Them' });
  await page.locator('#age').fill('28');
  await clickFormNext(page);
}

/** Step 2 — home details address + pets (home type optional). */
export async function completeStep2HomeDetailsAddress(page: Page) {
  await page.locator('#address').fill('123 Main St');
  await page.locator('#city').fill('Chicago');
  await page.locator('#state').fill('IL');
  await page.locator('#zip_code').fill('60601');
  await page.locator('#home_adults_count').selectOption({ label: '1' });
  await page.locator('#home_youth_count').selectOption({ label: '0' });
  await page.locator('#pets').fill('None');
}

export async function checkHomeTypeOptions(page: Page, labels: string[]) {
  for (const label of labels) {
    await page.getByRole('checkbox', { name: label, exact: true }).check();
  }
}

export async function reachHomeDetailsStep(
  page: Page,
  viewport: { width: number; height: number } = VIEWPORT_PRESETS.mobile
) {
  await openRequestForm(page, viewport);
  await completeStep0Services(page);
  await expect(page.getByRole('heading', { name: 'Client Details' })).toBeVisible();
  await completeStep1ClientDetails(page);
  await expect(page.getByText('Home type (check all that apply)')).toBeVisible();
}

/** Home Details → Referral step (How did you hear about us?). */
export async function reachReferralStep(page: Page) {
  await reachHomeDetailsStep(page);
  await completeStep2HomeDetailsAddress(page);
  await clickFormNext(page);
  await expect(page.locator('#referral_source')).toBeVisible({ timeout: 15000 });
}

/** Full path to Past Pregnancies step. */
export async function reachPastPregnanciesStep(page: Page) {
  await reachReferralStep(page);
  await completeStep4Referral(page);
  await completeStep5HealthHistory(page);
  await fillPregnancyStepMinimum(page);
  await clickFormNext(page);
  await expect(page.getByRole('heading', { name: 'Past Pregnancies' })).toBeVisible();
}

/** Home Details → Payment step (past pregnancies = no history). */
export async function reachPaymentStep(page: Page) {
  await reachPastPregnanciesStep(page);
  await completeStep6PastPregnanciesNoHistory(page);
  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
}

/** @deprecated Family/support fields are on Home Details; advances to Referral. */
export async function completeStep3FamilyMembers(page: Page) {
  await clickFormNext(page);
}

export async function completeStep4Referral(page: Page) {
  const referral = page.locator('#referral_source');
  await expect(referral).toBeVisible({ timeout: 15000 });
  const current = await referral.inputValue();
  if (!current?.trim()) {
    await referral.selectOption({ label: 'Google' });
  }
  await clickFormNext(page);
}

export async function completeStep5HealthHistory(page: Page) {
  await clickFormNext(page);
}

export async function selectNoPastPregnancies(page: Page) {
  await page.getByRole('checkbox', { name: 'No past pregnancies' }).check();
}

export async function selectHadPastPregnancies(page: Page) {
  await page.getByRole('checkbox', { name: 'Had past pregnancies' }).check();
}

export async function completeStep6PastPregnanciesNoHistory(page: Page) {
  await selectNoPastPregnancies(page);
  await clickFormNext(page);
}

export async function completeStep6PastPregnanciesWithHistory(page: Page) {
  await selectHadPastPregnancies(page);
  await expect(page.locator('#previous_pregnancies_count')).toBeVisible();
  await clickFormNext(page);
}

/** Advance from Home Details through demographics and submit (assumes prior steps filled). */
export async function advanceFromHomeDetailsToSubmit(page: Page) {
  await clickFormNext(page);
  await completeStep4Referral(page);
  await completeStep5HealthHistory(page);

  await fillPregnancyStepMinimum(page);
  await clickFormNext(page);
  await completeStep6PastPregnanciesNoHistory(page);

  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
  await page.locator('#payment_method').click();
  await page.getByText('Not sure / Need help figuring this out', { exact: true }).click();
  await clickFormNext(page);

  await expect(page.getByRole('heading', { name: 'Client Demographics' })).toBeVisible({
    timeout: 15000,
  });
}

/** Call after `advanceFromHomeDetailsToSubmit` when on the demographics step. */
export async function submitRequestForm(page: Page) {
  await clickFormSubmit(page);
}
