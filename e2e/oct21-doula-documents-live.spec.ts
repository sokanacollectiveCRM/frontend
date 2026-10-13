import { test, expect, type Browser, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const api = 'https://sokana-private-api-dev-46lcr3n2qa-uc.a.run.app';
const fixturePath = process.env.OCT21_FIXTURE_PATH;
test.skip(
  !fixturePath,
  'Set OCT21_FIXTURE_PATH to isolated fictional dev sessions'
);
type Fixture = {
  tenant: string;
  doula: { id: string; cookie: string; token: string };
  admin: { id: string; cookie: string; token: string };
};
const pdf = Buffer.from('%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

async function authenticatedPage(browser: Browser, user: Fixture['doula']) {
  const context = await browser.newContext({
    baseURL: 'https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app',
    viewport: { width: 1440, height: 1000 },
  });
  await context.addCookies([
    {
      name: 'sokana_session_token',
      value: user.cookie,
      domain: new URL(api).hostname,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    },
  ]);
  return context.newPage();
}
async function upload(page: Page, type: string, name: string) {
  const card = page.getByTestId(`document-slot-${type}`);
  await card.getByRole('button', { name: /Upload|Replace/ }).click();
  await page
    .locator('#file')
    .setInputFiles({ name, mimeType: 'application/pdf', buffer: pdf });
  const response = page.waitForResponse(
    (r) =>
      r.url() === `${api}/api/doulas/documents` &&
      r.request().method() === 'POST'
  );
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Upload', exact: true })
    .click();
  expect((await response).status()).toBe(201);
  await expect(card.getByText(name, { exact: true })).toBeVisible();
}

test('dev document uploads, archived files, and training-only approval', async ({
  browser,
}) => {
  const fixture: Fixture = JSON.parse(readFileSync(fixturePath!, 'utf8'));
  const page = await authenticatedPage(browser, fixture.doula);
  const adminPage = await authenticatedPage(browser, fixture.admin);
  try {
    await page.goto('/doula-dashboard/documents');
    await expect(
      page.getByText('Doula training certificate', { exact: true })
    ).toBeVisible();
    await expect(page.locator('[data-testid^="document-slot-"]')).toHaveCount(
      4
    );
    await expect(page.getByText('Required', { exact: true })).toHaveCount(1);
    await expect(page.getByText('Optional', { exact: true })).toHaveCount(3);
    await expect(
      page.getByText('Required for Medicaid clients', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(/W9|Direct deposit form|Background check/i)
    ).toHaveCount(0);

    const headers = {
      Authorization: `Bearer ${fixture.doula.token}`,
      'X-Tenant-Id': fixture.tenant,
    };
    for (const type of ['w9', 'direct_deposit_form', 'background_check']) {
      const response = await page.request.post(`${api}/api/doulas/documents`, {
        headers,
        multipart: {
          document_type: type,
          file: {
            name: 'fictional-retired.pdf',
            mimeType: 'application/pdf',
            buffer: pdf,
          },
        },
      });
      expect(response.status()).toBe(400);
      expect((await response.json()).error).toMatch(/no longer accepted/i);
    }
    const initial = await page.request.get(`${api}/api/doulas/documents`, {
      headers,
    });
    expect(initial.ok()).toBeTruthy();
    const before = await initial.json();
    expect(before.completeness.total_required).toBe(1);
    expect(before.completeness.can_be_active).toBe(false);
    expect(before.documents).toHaveLength(0);

    await upload(page, 'training_certificate', 'fictional-training.pdf');
    await upload(
      page,
      'illinois_medicaid_certification',
      'fictional-medicaid.pdf'
    );
    await upload(page, 'miscellaneous', 'fictional-misc-one.pdf');
    await upload(page, 'miscellaneous', 'fictional-misc-two.pdf');
    await page.reload();
    await expect(
      page.getByText('fictional-misc-one.pdf', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('fictional-misc-two.pdf', { exact: true })
    ).toBeVisible();
    const uploaded = await (
      await page.request.get(`${api}/api/doulas/documents`, { headers })
    ).json();
    expect(uploaded.completeness.can_be_active).toBe(false);
    expect(
      uploaded.documents.filter(
        (d: { document_type: string }) => d.document_type === 'miscellaneous'
      )
    ).toHaveLength(2);
    expect(
      uploaded.documents.some(
        (d: { document_type: string }) =>
          d.document_type === 'liability_insurance_certificate'
      )
    ).toBe(false);

    await adminPage.goto(`/hours/${fixture.doula.id}`);
    await expect(
      adminPage.getByText('Doula training certificate', { exact: true })
    ).toBeVisible();
    const archive = adminPage.locator('details').filter({
      has: adminPage.locator('summary', { hasText: 'Archived documents' }),
    });
    await expect(archive).not.toHaveAttribute('open', '');
    await archive.locator('summary').click();
    for (const type of ['w9', 'background_check', 'direct_deposit_form']) {
      await expect(
        archive.getByText(`fictional-archived-${type}.pdf`, { exact: true })
      ).toBeVisible();
    }
    const row = adminPage
      .getByText('Doula training certificate', { exact: true })
      .locator('..')
      .locator('..');
    await row.getByRole('button', { name: 'Review', exact: true }).click();
    await adminPage
      .getByRole('dialog')
      .getByRole('button', { name: 'Approve', exact: true })
      .click();
    await expect(
      adminPage.getByText(
        'All required documents are approved. Doula is eligible to be active.'
      )
    ).toBeVisible();
    await page.reload();
    const complete = await (
      await page.request.get(`${api}/api/doulas/documents`, { headers })
    ).json();
    expect(complete.completeness.can_be_active).toBe(true);
    expect(complete.completeness.total_complete).toBe(1);
    expect(complete.completeness.total_required).toBe(1);
    expect(complete.documents).toHaveLength(4);
    console.log(
      'Verified four upload types, retired-type rejection, two persistent miscellaneous files, archived admin visibility, and training-only approval.'
    );
  } finally {
    await page.context().close();
    await adminPage.context().close();
  }
});
