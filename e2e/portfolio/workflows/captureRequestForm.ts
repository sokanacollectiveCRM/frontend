import type { Page } from '@playwright/test';
import { captureFullPage } from '../helpers/screenshot';
import { stabilizePage } from '../helpers/waits';

/** Mirrors `src/features/request/stepConfig.ts` for stable step navigation in E2E. */
const REQUEST_STEPS: { id: number; title: string }[] = [
  { id: 0, title: 'Services Interested In' },
  { id: 1, title: 'Client Details' },
  { id: 2, title: 'Home Details' },
  { id: 3, title: 'How did you hear about us?' },
  { id: 4, title: 'Health information' },
  { id: 5, title: 'Pregnancy/Baby' },
  { id: 6, title: 'Past Pregnancies' },
  { id: 7, title: 'Payment' },
  { id: 8, title: 'Client Demographics' },
];

/**
 * Filename slugs per request form step (1-based for portfolio folders).
 */
const REQUEST_STEP_FILES: Record<number, string> = {
  0: 'request-step-01-services-interested-in',
  1: 'request-step-02-client-details',
  2: 'request-step-03-home-details',
  3: 'request-step-05-referral',
  4: 'request-step-06-health-information',
  5: 'request-step-07-pregnancy-baby',
  6: 'request-step-08-past-pregnancies',
  7: 'request-step-09-payment-insurance',
  8: 'request-step-10-client-demographics',
};

/**
 * Public /request intake — all 9 steps.
 *
 * Operational systems demonstrated (see also README):
 * - Multi-step state management (RequestFormContext + react-hook-form)
 * - Dynamic conditional rendering (payment method, past pregnancies, home type)
 * - Payment workflow switching (insurance vs not sure vs self-pay paths)
 * - Public intake funnel architecture → CRM lead ingestion on submit
 * - Progress-bar / step-rail navigation with non-linear jumpToStep
 * - Built-in "Fill with test data" QA utility (dummyTestLead.ts)
 * - Equity-aware demographics collection (final step)
 */
export async function captureRequestFormPortfolio(page: Page): Promise<void> {
  await page.goto('/request', { waitUntil: 'load' });
  await page
    .getByRole('heading', { name: /Services Interested In/i })
    .waitFor({ state: 'visible', timeout: 25_000 });

  // Populate full lead via built-in test utility — resets to step 0 with valid cross-step data.
  await page.getByRole('button', { name: 'Fill with test data' }).click();
  await stabilizePage(page);

  await captureFullPage(page, 'request-form-progress-bar-navigation');

  for (const step of REQUEST_STEPS) {
    const buttonName = new RegExp(
      `${step.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, step ${step.id + 1} of`,
      'i'
    );
    const stepButton = page.getByRole('button', { name: buttonName });
    if (step.id > 0) {
      await stepButton.click();
      await stabilizePage(page);
    }

    const filename = REQUEST_STEP_FILES[step.id] ?? `request-step-${step.id + 1}`;
    await captureFullPage(page, filename);

    // Extra highlights for key operational steps
    if (step.id === 0) {
      await captureFullPage(page, 'request-step-01-overnight-care-preference');
    }
    if (step.id === 6) {
      await captureFullPage(page, 'request-step-08-past-pregnancies-conditional');
    }
    if (step.id === 7) {
      await captureFullPage(page, 'request-step-09-primary-secondary-insurance');
    }
    if (step.id === 8) {
      await captureFullPage(page, 'request-step-10-equity-reporting-demographics');
    }
  }

  // Payment path contrast: "Not sure" hides insurance fields (conditional UI)
  await page.getByRole('button', { name: buttonNameForStep(7) }).click();
  await page.locator('#payment_method').click();
  await page.getByText('Not sure / Need help figuring this out', { exact: true }).click();
  await stabilizePage(page);
  await captureFullPage(page, 'request-step-09-payment-not-sure-conditional');
}

function buttonNameForStep(stepId: number): RegExp {
  const step = REQUEST_STEPS.find((s) => s.id === stepId);
  const title = step?.title ?? `Step ${stepId + 1}`;
  return new RegExp(`${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, step ${stepId + 1} of`, 'i');
}
