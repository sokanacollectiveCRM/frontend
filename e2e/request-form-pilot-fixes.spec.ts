/**
 * Playwright proof of the Oct 2026 public intake / request-form pilot fixes.
 *
 * Local (mocked branding + submit — this is the VM command):
 *   npm run test:intake-pilot:e2e
 *
 * After frontend deploy, re-run against the live SPA (submit stays mocked):
 *   PLAYWRIGHT_BASE_URL=https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app npm run test:intake-pilot:e2e
 *
 * Do not run the PLAYWRIGHT_BASE_URL command from the Cloud Agent VM.
 */
import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'fs';
import {
  clickFormNext,
  clickFormSubmit,
  completeStep0Services,
  completeStep1ClientDetails,
  completeStep2HomeDetailsAddress,
  completeStep4Referral,
  completeStep5HealthHistory,
  fillRequestFormDueDate,
  openRequestForm,
  reachDemographicsNancyRequired,
  reachDemographicsStep,
  reachPastPregnanciesStep,
  selectHadPastPregnancies,
  selectNoPastPregnancies,
  stubIntakeSubmitNetworkError,
  stubIntakeSubmitServerError,
  stubIntakeSubmitSuccess,
} from './helpers/requestForm';

const ARTIFACT_DIR = '/opt/cursor/artifacts';

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
});

async function saveShot(page: Page, name: string) {
  await page.screenshot({
    path: `${ARTIFACT_DIR}/${name}.png`,
    fullPage: true,
  });
}

test.describe('Request form — Oct 2026 pilot fixes', () => {
  test('no duplicate pet, pronouns, or age questions', async ({ page }) => {
    await openRequestForm(page);
    await completeStep0Services(page);
    await expect(
      page.getByRole('heading', { name: 'Client Details' })
    ).toBeVisible();

    await expect(page.locator('#pronouns')).toHaveCount(1);
    await expect(page.locator('label[for="pronouns"]')).toHaveCount(1);
    await expect(page.locator('#age')).toHaveCount(1);
    await expect(page.locator('label[for="age"]')).toHaveCount(1);
    await expect(page.locator('#client_age_range')).toHaveCount(0);
    await expect(page.getByText(/age range/i)).toHaveCount(0);
    await saveShot(page, 'intake-client-details-pronouns-age');

    await completeStep1ClientDetails(page);
    await expect(
      page.getByText('Home type (check all that apply)')
    ).toBeVisible();

    await expect(page.locator('#pets')).toHaveCount(1);
    await expect(page.locator('label[for="pets"]')).toHaveCount(1);
    await expect(page.getByText(/Pets in the home/i)).toHaveCount(1);
    await expect(
      page.getByText(
        /list the types of any pets\/animals that are in the home/i
      )
    ).toHaveCount(0);
    await expect(page.locator('#pronouns')).toHaveCount(0);
    await expect(page.getByText('Support person pronouns')).toHaveCount(1);
    await expect(page.locator('#family_pronouns')).toHaveCount(1);
    await saveShot(page, 'intake-home-pets-pronouns');

    await completeStep2HomeDetailsAddress(page);
    await clickFormNext(page);
    await completeStep4Referral(page);
    await completeStep5HealthHistory(page);
    await fillRequestFormDueDate(page);
    await clickFormNext(page);
    await expect(
      page.getByRole('heading', { name: 'Past Pregnancies' })
    ).toBeVisible();
    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
    await clickFormNext(page);
    await expect(
      page.getByRole('heading', { name: 'Client Demographics' })
    ).toBeVisible({
      timeout: 15000,
    });

    await expect(page.locator('#age')).toHaveCount(0);
    await expect(page.locator('#client_age_range')).toHaveCount(0);
    await expect(page.getByText(/age range/i)).toHaveCount(0);
    await expect(page.locator('#pronouns')).toHaveCount(0);
    await expect(page.locator('#pets')).toHaveCount(0);
    await expect(page.locator('#primary_language')).toHaveCount(1);
    await saveShot(page, 'intake-demographics-no-duplicate-age');
  });

  test('Other language shows a required specify field', async ({ page }) => {
    await reachDemographicsStep(page);

    await expect(page.locator('#primary_language_other')).toHaveCount(0);
    await page.locator('#primary_language').selectOption({ label: 'Other' });
    await expect(page.locator('#primary_language_other')).toBeVisible();
    await expect(
      page.locator('label[for="primary_language_other"]')
    ).toContainText('Other language (please specify)');
    await expect(
      page.locator('label[for="primary_language_other"]')
    ).toContainText('*');
    await saveShot(page, 'intake-other-language-specify');

    await clickFormSubmit(page);
    await expect(
      page.getByText('Please specify the other language.')
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /thank you/i })).toHaveCount(
      0
    );
    await saveShot(page, 'intake-other-language-required-error');

    await page.locator('#primary_language_other').fill('Yoruba');
    await expect(page.locator('#primary_language_other')).toHaveValue('Yoruba');
  });

  test('pregnancy-count validation blocks inconsistent answers', async ({
    page,
  }) => {
    await reachPastPregnanciesStep(page, { pregnancyNumber: '2' });

    await selectNoPastPregnancies(page);
    await clickFormNext(page);
    await expect(page.getByText(/pregnancy #2/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payment' })).toHaveCount(0);
    await saveShot(page, 'intake-pregnancy-mismatch');

    await selectHadPastPregnancies(page);
    await expect(page.locator('#previous_pregnancies_count')).toBeVisible();
    await page.locator('#previous_pregnancies_count').fill('0');
    await clickFormNext(page);
    await expect(
      page.getByText(/number of prior pregnancies must be at least 1/i)
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payment' })).toHaveCount(0);
    await saveShot(page, 'intake-pregnancy-count-too-low');

    await page.locator('#previous_pregnancies_count').fill('1');
    await clickFormNext(page);
    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
  });

  test('Nancy required-only fields submit with a clear success message', async ({
    page,
  }) => {
    await stubIntakeSubmitSuccess(page);
    await reachDemographicsNancyRequired(page, 'nancy.success@example.com');

    await expect(page.locator('#firstname')).toHaveCount(0);
    await clickFormSubmit(page);
    await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible(
      {
        timeout: 20000,
      }
    );
    await expect(
      page.getByText(/received your request for service|working on your match/i)
    ).toBeVisible();
    await expect(page.getByText(/failed to fetch/i)).toHaveCount(0);
    await saveShot(page, 'intake-success');
  });

  test('network error shows a clear message instead of Failed to fetch', async ({
    page,
  }) => {
    await stubIntakeSubmitNetworkError(page);
    await reachDemographicsNancyRequired(page, 'nancy.network@example.com');
    await clickFormSubmit(page);

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 15000 });
    await expect(alert).toContainText('We could not reach the server');
    await expect(alert).not.toContainText(/failed to fetch/i);
    await expect(page.getByRole('heading', { name: /thank you/i })).toHaveCount(
      0
    );
    await saveShot(page, 'intake-network-error');
  });

  test('server error shows a clear message instead of Failed to fetch', async ({
    page,
  }) => {
    await stubIntakeSubmitServerError(page);
    await reachDemographicsNancyRequired(page, 'nancy.server@example.com');
    await clickFormSubmit(page);

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 15000 });
    await expect(alert).toContainText(
      'The intake service is temporarily unavailable.'
    );
    await expect(alert).not.toContainText(/failed to fetch/i);
    await expect(page.getByRole('heading', { name: /thank you/i })).toHaveCount(
      0
    );
    await saveShot(page, 'intake-server-error');
  });
});
