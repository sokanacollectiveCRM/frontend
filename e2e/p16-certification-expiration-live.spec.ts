import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const baseURL =
  process.env.P16_BASE_URL ??
  'https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app';
const api =
  process.env.P16_API_URL ??
  'https://sokana-private-api-dev-46lcr3n2qa-uc.a.run.app';
const fixturePath = process.env.P16_FIXTURE_PATH;
test.skip(!fixturePath, 'Requires fictional dev P-16 authenticated fixtures');

test('P-16 expiration persists and matches doula, admin detail and review displays', async ({
  browser,
}) => {
  test.setTimeout(180000);
  if (
    ![baseURL, api].every(
      (url) =>
        new URL(url).hostname === 'localhost' ||
        new URL(url).hostname.includes('-dev-')
    )
  ) {
    throw new Error('This verification may only target localhost or dev.');
  }
  const fixture = JSON.parse(readFileSync(fixturePath!, 'utf8'));
  const local = new URL(api).hostname === 'localhost';
  const doula = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 1100 },
  });
  const admin = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 1100 },
  });
  try {
    const page = await doula.newPage();
    await page.goto('/login');
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    for (const [context, user] of [
      [doula, fixture.doula],
      [admin, fixture.admin],
    ] as const) {
      await context.addCookies([
        {
          name: 'sokana_session_token',
          value: user.cookie,
          domain: new URL(api).hostname,
          path: '/',
          httpOnly: true,
          secure: !local,
          sameSite: local ? 'Lax' : 'None',
        },
      ]);
    }
    await page.goto('/doula-dashboard/profile');
    await page.getByLabel('Phone number', { exact: true }).fill('5555550100');
    await page
      .getByRole('button', { name: 'Certifications step', exact: true })
      .click();
    const certs = page.getByRole('region', { name: 'Saved certifications' });
    await expect(
      certs.getByRole('button', { name: 'Add certification' })
    ).toBeVisible();
    // Reset only this dedicated fictional test account to make the live check repeatable.
    while (
      await certs.getByRole('button', { name: /Remove certification/ }).count()
    ) {
      await certs
        .getByRole('button', { name: /Remove certification/ })
        .first()
        .click();
    }
    await certs.getByRole('button', { name: 'Add certification' }).click();
    await certs
      .getByLabel('Certification name')
      .fill('P-16 Fictional Birth Training');
    await certs
      .getByLabel('Issuing organization')
      .fill('Example Training Academy');
    await expect(certs.getByLabel('Expiration date')).toHaveAttribute(
      'type',
      'date'
    );
    await expect(certs.getByLabel('Year')).toHaveCount(0);
    await certs.getByLabel('Expiration date').fill('2030-03-31');
    await expect(
      certs.getByRole('button', { name: 'Cancel certification 1' })
    ).toBeVisible();
    // Leave a second untouched row open. Saving must ignore it.
    await certs.getByRole('button', { name: 'Add certification' }).click();
    const saved = page.waitForResponse(
      (r) =>
        r.url() === `${api}/api/doulas/profile` &&
        r.request().method() === 'PUT'
    );
    await page
      .getByRole('button', { name: 'Save Changes', exact: true })
      .click();
    expect((await saved).status()).toBe(200);
    await expect(
      certs.getByText('Example Training Academy · Expires Mar 31, 2030')
    ).toBeVisible();
    await expect(certs.getByLabel('Certification name')).toHaveCount(0);
    await page.reload();
    await page
      .getByRole('button', { name: 'Certifications step', exact: true })
      .click();
    await expect(
      certs.getByText('P-16 Fictional Birth Training', { exact: true })
    ).toHaveCount(1);
    await expect(
      certs.getByText('Example Training Academy · Expires Mar 31, 2030')
    ).toBeVisible();
    await certs.getByRole('button', { name: 'Edit certification 1' }).click();
    await expect(certs.getByLabel('Expiration date')).toHaveValue('2030-03-31');
    await certs.getByLabel('Certification name').fill('Unsaved fictional edit');
    await certs.getByRole('button', { name: 'Cancel certification 1' }).click();
    await expect(
      certs.getByText('P-16 Fictional Birth Training', { exact: true })
    ).toBeVisible();

    await certs.getByRole('button', { name: 'Add certification' }).click();
    await certs
      .getByLabel('Certification name')
      .fill('P-16 Fictional Lifetime Training');
    await certs.getByLabel('No expiration', { exact: true }).check();
    await expect(certs.getByLabel('Expiration date')).toBeDisabled();
    await certs.getByRole('button', { name: 'Add certification' }).click();
    await certs
      .getByLabel('Certification name')
      .last()
      .fill('P-16 Fictional Expired Training');
    await certs.getByLabel('Expiration date').last().fill('2000-03-31');
    const savedMore = page.waitForResponse(
      (r) =>
        r.url() === `${api}/api/doulas/profile` &&
        r.request().method() === 'PUT'
    );
    await page
      .getByRole('button', { name: 'Save Changes', exact: true })
      .click();
    expect((await savedMore).status()).toBe(200);
    await page.reload();
    await page
      .getByRole('button', { name: 'Certifications step', exact: true })
      .click();
    await expect(
      certs.getByText('No expiration', { exact: true })
    ).toBeVisible();
    await expect(certs.getByText('Expired', { exact: true })).toBeVisible();

    const adminPage = await admin.newPage();
    await adminPage.goto(`/hours/${fixture.doula.id}`);
    const detail = adminPage.getByRole('region', {
      name: 'Saved certifications',
    });
    await expect(
      detail.getByText('Example Training Academy · Expires Mar 31, 2030')
    ).toBeVisible();
    await expect(
      detail.getByText('No expiration', { exact: true })
    ).toBeVisible();
    await expect(detail.getByText('Expired', { exact: true })).toBeVisible();
    await adminPage.goto(`/team?review=${fixture.doula.id}`);
    const review = adminPage.getByRole('dialog');
    await expect(
      review.getByText('Example Training Academy · Expires Mar 31, 2030')
    ).toBeVisible();
    await expect(
      review.getByText('No expiration', { exact: true })
    ).toBeVisible();
    await expect(review.getByText('Expired', { exact: true })).toBeVisible();

    const invalid = await page.request.put(`${api}/api/doulas/profile`, {
      headers: {
        'X-Session-Token': fixture.doula.cookie,
        'X-Tenant-Id': fixture.tenant,
      },
      data: {
        phone_number: '5555550100',
        certifications: [
          {
            name: 'Invalid fictional date',
            issuingOrganization: 'Example',
            expiration_date: '2028-02-30',
            no_expiration: false,
          },
        ],
      },
    });
    expect(invalid.status()).toBe(400);
  } finally {
    await doula.close();
    await admin.close();
  }
});
