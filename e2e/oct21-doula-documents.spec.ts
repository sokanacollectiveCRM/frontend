/**
 * Oct 21 doula document video.
 * Logs in as a fictional test doula, then an admin, on the dev stack.
 *
 *   OCT21_DOULA_EMAIL OCT21_DOULA_PASSWORD
 *   OCT21_ADMIN_EMAIL OCT21_ADMIN_PASSWORD
 *   OCT21_DOULA_ID
 *   OCT21_BASE_URL (optional; local dev server when omitted)
 */
import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { resolve } from 'path';

test.use({
  video: 'on',
  launchOptions: { slowMo: 500 },
});

const doulaEmail = process.env.OCT21_DOULA_EMAIL || '';
const doulaPassword = process.env.OCT21_DOULA_PASSWORD || '';
const adminEmail = process.env.OCT21_ADMIN_EMAIL || '';
const adminPassword = process.env.OCT21_ADMIN_PASSWORD || '';
const doulaId = process.env.OCT21_DOULA_ID || '';

async function caption(page: Page, text: string) {
  await page.evaluate((message) => {
    let el = document.getElementById('e2e-caption');
    if (!el) {
      el = document.createElement('div');
      el.id = 'e2e-caption';
      el.style.position = 'fixed';
      el.style.left = '24px';
      el.style.bottom = '24px';
      el.style.zIndex = '2147483647';
      el.style.background = 'rgba(17, 24, 39, 0.92)';
      el.style.color = 'white';
      el.style.padding = '16px 20px';
      el.style.borderRadius = '12px';
      el.style.font = '600 22px/1.3 system-ui, sans-serif';
      el.style.maxWidth = '760px';
      el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
      document.body.appendChild(el);
    }
    el.textContent = message;
  }, text);
  await page.waitForTimeout(3000);
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 30000,
  });
}

test.describe('Oct 21 doula documents', () => {
  test.skip(
    !doulaEmail || !doulaPassword || !adminEmail || !adminPassword || !doulaId,
    'Set OCT21_DOULA_EMAIL, OCT21_DOULA_PASSWORD, OCT21_ADMIN_EMAIL, OCT21_ADMIN_PASSWORD, and OCT21_DOULA_ID'
  );

  test('doula uploads new documents and admin approves the training certificate', async ({
    page,
  }) => {
    const pdfDir = resolve(tmpdir(), 'oct21-doula-documents');
    mkdirSync(pdfDir, { recursive: true });
    const medicaidPdf = resolve(pdfDir, 'illinois-medicaid-fictional.pdf');
    const miscPdf = resolve(pdfDir, 'miscellaneous-fictional.pdf');
    writeFileSync(
      medicaidPdf,
      '%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'
    );
    writeFileSync(miscPdf, '%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

    await login(page, doulaEmail, doulaPassword);
    await page.goto('/doula-dashboard/documents');
    await expect(page.getByText('Doula training certificate')).toBeVisible();
    await caption(page, 'Doula opens Documents');

    await expect(page.getByText('W9')).toHaveCount(0);
    await expect(page.getByText(/Direct Deposit/i)).toHaveCount(0);
    await expect(page.getByText(/Background Check/i)).toHaveCount(0);
    await caption(page, 'W9, direct deposit and background check are gone');

    await expect(page.getByText('Liability insurance')).toBeVisible();
    await expect(page.getByText('Required for Medicaid clients')).toBeVisible();
    const liabilityCard = page.getByTestId(
      'document-slot-liability_insurance_certificate'
    );
    await expect(liabilityCard.getByText('Optional')).toBeVisible();
    await caption(
      page,
      'Liability insurance is optional, required for Medicaid clients'
    );

    const trainingPdf = resolve(pdfDir, 'training-certificate-fictional.pdf');
    writeFileSync(
      trainingPdf,
      '%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'
    );
    const trainingCard = page.getByTestId('document-slot-training_certificate');
    const trainingUpload = trainingCard.getByRole('button', {
      name: /Upload|Replace/,
    });
    if (await trainingUpload.isVisible()) {
      await trainingUpload.click();
      await page.locator('#file').setInputFiles(trainingPdf);
      await page.getByRole('button', { name: 'Upload', exact: true }).click();
      await expect(
        page.getByText(/training-certificate-fictional/i)
      ).toBeVisible({
        timeout: 20000,
      });
      await page.waitForTimeout(1000);
    }

    const medicaidCard = page.getByTestId(
      'document-slot-illinois_medicaid_certification'
    );
    await medicaidCard.getByRole('button', { name: 'Upload' }).click();
    await page.locator('#file').setInputFiles(medicaidPdf);
    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    await expect(page.getByText(/illinois-medicaid-fictional/i)).toBeVisible({
      timeout: 20000,
    });
    await caption(page, 'Upload a fake PDF as Illinois Medicaid certification');

    const miscCard = page.getByTestId('document-slot-miscellaneous');
    await miscCard.getByRole('button', { name: 'Upload' }).click();
    await page.locator('#file').setInputFiles(miscPdf);
    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    await expect(page.getByText(/miscellaneous-fictional/i)).toBeVisible({
      timeout: 20000,
    });
    await caption(page, 'Upload a fake PDF as Miscellaneous documents');

    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await login(page, adminEmail, adminPassword);
    await page.goto(`/hours/${doulaId}`);
    await expect(page.getByText('Doula training certificate')).toBeVisible({
      timeout: 20000,
    });
    const review = page.getByRole('button', { name: 'Review' });
    if (await review.first().isVisible()) {
      await review.first().click();
      await page.getByRole('button', { name: 'Approve' }).click();
    }
    await expect(
      page.getByText(
        'All required documents are approved. Doula is eligible to be active.'
      )
    ).toBeVisible({ timeout: 20000 });
    await caption(
      page,
      'Admin view: approve the training certificate, and the doula shows as complete'
    );
  });
});
