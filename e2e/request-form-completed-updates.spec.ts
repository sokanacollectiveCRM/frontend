import { test, expect } from '@playwright/test';
import {
  HOME_ADULTS_COUNT_LABEL,
  HOME_PEOPLE_IN_HOME_QUESTION,
  REFERRAL_CONTACT_FIELD_ID,
  SUPPORT_PERSON_SECTION_LABEL,
  VIEWPORT_PRESETS,
  assertOptionLabelsDoNotSplitWords,
  clickFormNext,
  completeStep2HomeDetailsAddress,
  completeStep4Referral,
  completeStep5HealthHistory,
  completeStep6PastPregnanciesNoHistory,
  completeStep6PastPregnanciesWithHistory,
  fillPregnancyStepMinimum,
  openRequestForm,
  reachHomeDetailsStep,
  reachPastPregnanciesStep,
  reachReferralStep,
  selectHadPastPregnancies,
  selectNoPastPregnancies,
  submitRequestForm,
} from './helpers/requestForm';

const REFERRAL_CONTACT_SAMPLE = 'Call or text 555-123-4567';

test.describe('Ticket 1 — Home Access removal', () => {
  test('Home Details does not show home access and user can continue without it', async ({
    page,
  }) => {
    await reachHomeDetailsStep(page);

    await expect(page.locator('#home_access')).toHaveCount(0);
    await expect(page.getByLabel(/home access/i)).toHaveCount(0);
    await expect(page.getByText(/home access/i)).toHaveCount(0);

    await completeStep2HomeDetailsAddress(page);
    await clickFormNext(page);

    await expect(page.locator('#referral_source')).toBeVisible();
  });
});

test.describe('Ticket 2 — Adult(s) label', () => {
  test('Home Details shows Adult(s) label and not the old standalone Adult label', async ({
    page,
  }) => {
    await reachHomeDetailsStep(page);

    await expect(page.getByText(HOME_ADULTS_COUNT_LABEL)).toBeVisible();
    await expect(page.locator('label[for="home_adults_count"]')).toContainText(
      HOME_ADULTS_COUNT_LABEL
    );
    await expect(page.locator('label[for="home_adults_count"]')).not.toHaveText(
      /^Adult \(18 and older\)$/
    );
    await expect(page.getByText(/^Adult \(18 and older\)$/)).toHaveCount(0);
  });
});

test.describe('Ticket 3 — Support Person rename and placement', () => {
  test('Support Person is shown on Home Details after core fields, not Family Members', async ({
    page,
  }) => {
    await reachHomeDetailsStep(page);

    await expect(page.getByText(SUPPORT_PERSON_SECTION_LABEL, { exact: true })).toBeVisible();
    await expect(page.getByText('Family Members')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Family Members/i })
    ).toHaveCount(0);

    const addressBox = await page.locator('#address').boundingBox();
    const petsBox = await page.locator('#pets').boundingBox();
    const supportHeading = await page
      .getByText(SUPPORT_PERSON_SECTION_LABEL, { exact: true })
      .boundingBox();
    const peopleQuestionBox = await page.getByText(HOME_PEOPLE_IN_HOME_QUESTION).boundingBox();

    expect(addressBox).toBeTruthy();
    expect(petsBox).toBeTruthy();
    expect(supportHeading).toBeTruthy();
    expect(peopleQuestionBox).toBeTruthy();

    expect(supportHeading!.y).toBeGreaterThan(petsBox!.y);
    expect(supportHeading!.y).toBeGreaterThan(peopleQuestionBox!.y);
    expect(addressBox!.y).toBeLessThan(supportHeading!.y);
  });
});

test.describe('Ticket 4 — Referral Contact Info label and flexible validation', () => {
  test('Referral step shows Contact Info label, accepts non-email contact text, and continues', async ({
    page,
  }) => {
    await reachReferralStep(page);

    await expect(page.locator('label[for="referral_email"]')).toHaveText('Contact Info');
    await expect(page.locator('label[for="referral_email"]')).not.toHaveText(/^Email$/);
    await expect(page.getByLabel(/^Email$/)).toHaveCount(0);

    await page.locator('#referral_source').selectOption({ label: 'Google' });
    await page.locator(`#${REFERRAL_CONTACT_FIELD_ID}`).fill(REFERRAL_CONTACT_SAMPLE);

    await clickFormNext(page);

    await expect(page.getByText('Health information', { exact: true })).toBeVisible();
    await expect(page.getByText(/valid email/i)).toHaveCount(0);
    await expect(
      page.locator('[class*="form-error"]').filter({ hasText: /valid email/i })
    ).toHaveCount(0);
  });

  test('POST body sends referral contact text under referral_email key', async ({ page }) => {
    test.setTimeout(120000);
    const uniqueEmail = `referral-contact-e2e-${Date.now()}@example.com`;
    let capturedReferralEmail: string | undefined;

    await page.route('**/requestService/requestSubmission', async (route) => {
      const postData = route.request().postDataJSON() as { referral_email?: string };
      capturedReferralEmail = postData.referral_email;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, clientId: 'e2e-mock-client' }),
      });
    });

    await openRequestForm(page);
    await page.getByRole('button', { name: 'Fill with test data' }).click();
    await page
      .getByRole('heading', { name: /Services Interested In/i })
      .waitFor({ state: 'visible', timeout: 20000 });

    await clickFormNext(page);
    await page.locator('#email').fill(uniqueEmail);
    await clickFormNext(page);
    await clickFormNext(page);

    await page.locator('#referral_source').selectOption({ label: 'Google' });
    await page.locator(`#${REFERRAL_CONTACT_FIELD_ID}`).fill(REFERRAL_CONTACT_SAMPLE);
    await clickFormNext(page);
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

    await submitRequestForm(page);

    expect(capturedReferralEmail).toBe(REFERRAL_CONTACT_SAMPLE);

    await expect(
      page.getByText('Request Form Submitted Successfully', { exact: false })
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Ticket 5 — Past Pregnancies two-option flow', () => {
  test('Had past pregnancies: exclusive selection, follow-up visible, can continue', async ({
    page,
  }) => {
    await reachPastPregnanciesStep(page);

    await selectHadPastPregnancies(page);

    await expect(page.getByRole('checkbox', { name: 'Had past pregnancies' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'No past pregnancies' })).not.toBeChecked();
    await expect(page.locator('#previous_pregnancies_count')).toBeVisible();
    await expect(page.locator('#living_children_count')).toBeVisible();
    await expect(page.locator('#past_pregnancy_experience')).toBeVisible();

    await completeStep6PastPregnanciesWithHistory(page);
    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
  });

  test('No past pregnancies: exclusive selection, follow-up hidden, can continue', async ({
    page,
  }) => {
    await reachPastPregnanciesStep(page);

    await selectNoPastPregnancies(page);

    await expect(page.getByRole('checkbox', { name: 'No past pregnancies' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Had past pregnancies' })).not.toBeChecked();
    await expect(page.locator('#previous_pregnancies_count')).toHaveCount(0);
    await expect(page.locator('#living_children_count')).toHaveCount(0);
    await expect(page.locator('#past_pregnancy_experience')).toHaveCount(0);

    await completeStep6PastPregnanciesNoHistory(page);
    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
  });
});

test.describe('Ticket 6 — Option label word wrapping', () => {
  for (const [preset, viewport] of Object.entries(VIEWPORT_PRESETS) as [
    keyof typeof VIEWPORT_PRESETS,
    { width: number; height: number },
  ][]) {
    test(`${preset} viewport: option labels do not split words mid-character`, async ({
      page,
    }) => {
      await reachHomeDetailsStep(page, viewport);

      await expect(
        page.getByRole('checkbox', { name: 'Transitional housing', exact: true })
      ).toBeVisible();
      await assertOptionLabelsDoNotSplitWords(page);

      await completeStep2HomeDetailsAddress(page);
      await clickFormNext(page);
      await completeStep4Referral(page);
      await completeStep5HealthHistory(page);
      await fillPregnancyStepMinimum(page);
      await clickFormNext(page);

      await expect(page.getByRole('heading', { name: 'Past Pregnancies' })).toBeVisible();
      await expect(page.getByRole('checkbox', { name: 'Had past pregnancies' })).toBeVisible();
      await expect(page.getByRole('checkbox', { name: 'No past pregnancies' })).toBeVisible();
      await assertOptionLabelsDoNotSplitWords(page);

      await completeStep6PastPregnanciesNoHistory(page);
      await page.locator('#payment_method').click();
      await expect(
        page.getByText('Not sure / Need help figuring this out', { exact: true })
      ).toBeVisible();
      await assertOptionLabelsDoNotSplitWords(page);

      await expect(page.getByText('Pregnan', { exact: true })).toHaveCount(0);
    });
  }
});

test.describe('Ticket 7 — Step navigation card layout', () => {
  test('desktop step cards keep equal heights and centered wrapped labels without overflow', async ({
    page,
  }) => {
    await openRequestForm(page, VIEWPORT_PRESETS.desktop);

    const metrics = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Form step navigation"]');
      const buttons = Array.from(
        document.querySelectorAll('nav[aria-label="Form step navigation"] button')
      ) as HTMLButtonElement[];

      return {
        buttonCount: buttons.length,
        navScrollWidth: nav?.scrollWidth ?? 0,
        navClientWidth: nav?.clientWidth ?? 0,
        heights: buttons.map((button) => Math.round(button.getBoundingClientRect().height)),
        alignments: buttons.map((button) => {
          const circle = button.querySelector('span') as HTMLElement | null;
          const title = button.querySelectorAll('span')[1] as HTMLElement | null;
          if (!circle || !title) return null;

          const circleRect = circle.getBoundingClientRect();
          const titleRect = title.getBoundingClientRect();
          return {
            circleCenterX: Math.round(circleRect.left + circleRect.width / 2),
            titleCenterX: Math.round(titleRect.left + titleRect.width / 2),
            titleBottom: Math.round(titleRect.bottom),
            circleBottom: Math.round(circleRect.bottom),
            titleLineHeight: parseFloat(window.getComputedStyle(title).lineHeight),
            titleText: title.textContent?.trim() ?? '',
            titleHeight: Math.round(titleRect.height),
          };
        }),
      };
    });

    expect(metrics.buttonCount).toBe(9);
    expect(new Set(metrics.heights).size).toBe(1);
    expect(metrics.navScrollWidth).toBeLessThanOrEqual(metrics.navClientWidth + 1);

    for (const alignment of metrics.alignments) {
      expect(alignment).toBeTruthy();
      expect(Math.abs(alignment!.circleCenterX - alignment!.titleCenterX)).toBeLessThanOrEqual(2);
      expect(alignment!.titleBottom).toBeGreaterThan(alignment!.circleBottom);
      expect(alignment!.titleLineHeight).toBeGreaterThan(0);
    }

    expect(new Set(metrics.alignments.map((alignment) => alignment?.titleLineHeight)).size).toBe(1);
    const pregnancyTitle = metrics.alignments.find(
      (alignment) => alignment?.titleText === 'Pregnancy/Baby'
    );
    expect(pregnancyTitle).toBeTruthy();
    expect(pregnancyTitle!.titleHeight).toBeGreaterThan(pregnancyTitle!.titleLineHeight * 1.5);
  });
});

test.describe('Ticket 8 — Services multi-select layout', () => {
  test('services popover renders options as vertical rows', async ({ page }) => {
    await openRequestForm(page, VIEWPORT_PRESETS.desktop);

    await page.getByRole('button', { name: /select/i }).first().click();

    const metrics = await page.evaluate(() => {
      const list = document.querySelector('[data-testid="services-popover-list"]') as HTMLElement | null;
      const labels = Array.from(
        document.querySelectorAll('[data-testid="services-popover-option"]')
      ) as HTMLElement[];

      const listStyle = list ? window.getComputedStyle(list) : null;
      const listRect = list?.getBoundingClientRect();
      const optionRects = labels.slice(0, 2).map((label) => {
        const rect = label.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          left: Math.round(rect.left),
        };
      });

      return {
        optionCount: labels.length,
        listDisplay: listStyle?.display ?? '',
        listFlexDirection: listStyle?.flexDirection ?? '',
        listWidth: Math.round(listRect?.width ?? 0),
        optionRects,
      };
    });

    expect(metrics.optionCount).toBeGreaterThanOrEqual(2);
    expect(metrics.listDisplay).toBe('flex');
    expect(metrics.listFlexDirection).toBe('column');
    expect(metrics.optionRects[0].width).toBeGreaterThanOrEqual(metrics.listWidth - 2);
    expect(metrics.optionRects[1].width).toBeGreaterThanOrEqual(metrics.listWidth - 2);
    expect(Math.abs(metrics.optionRects[0].left - metrics.optionRects[1].left)).toBeLessThanOrEqual(2);
  });

  test('mobile services trigger keeps Select text visible below the label', async ({
    page,
  }) => {
    await openRequestForm(page, VIEWPORT_PRESETS.mobile);

    const metrics = await page.evaluate(() => {
      const trigger = document.querySelector(
        'button[class*="form-option-trigger-text"]'
      ) as HTMLElement | null;
      const label = document.querySelector(
        '[class*="services-select-field"] label'
      ) as HTMLElement | null;

      if (!trigger || !label) return null;

      const triggerRect = trigger.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();

      return {
        triggerText: trigger.textContent?.trim() ?? '',
        triggerTop: Math.round(triggerRect.top),
        labelBottom: Math.round(labelRect.bottom),
      };
    });

    expect(metrics).toBeTruthy();
    expect(metrics!.triggerText).toContain('Select');
    expect(metrics!.triggerTop).toBeGreaterThanOrEqual(metrics!.labelBottom);
  });
});
