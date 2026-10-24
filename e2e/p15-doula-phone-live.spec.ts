import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const baseURL = 'https://sokana-front-end-dev-46lcr3n2qa-uc.a.run.app';
const api = 'https://sokana-private-api-dev-46lcr3n2qa-uc.a.run.app';
const fixturePath = process.env.P15_FIXTURE_PATH;
test.skip(!fixturePath, 'Requires dedicated fictional P-15 dev fixtures');

test('P-15 required phone persists, admins see it, and client UI/API exclude it', async ({
  browser,
}) => {
  test.setTimeout(180000);
  const fixture = JSON.parse(readFileSync(fixturePath!, 'utf8'));
  const doula = await browser.newContext({ baseURL });
  const admin = await browser.newContext({ baseURL });
  const client = await browser.newContext({ baseURL });
  try {
    const page = await doula.newPage();
    await page.goto('/login');
    await page.getByLabel('Email', { exact: true }).fill(fixture.doula.email);
    await page
      .getByLabel('Password', { exact: true })
      .fill(fixture.doula.password);
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    await page.waitForURL((url) => !url.pathname.includes('login'));
    await page.goto('/doula-dashboard/profile');
    const phone = page.getByLabel('Phone number', { exact: true });
    await expect(phone).toBeVisible();
    const before = await page.request.get(`${api}/api/doulas/profile`);
    expect(before.status()).toBe(200);
    const certifications = (await before.json()).profile.certifications;
    let saves = 0;
    page.on('request', (r) => {
      if (r.url() === `${api}/api/doulas/profile` && r.method() === 'PUT')
        saves++;
    });
    await phone.fill('');
    await page
      .getByRole('button', { name: 'Save Changes', exact: true })
      .click();
    await expect(page.getByRole('alert')).toHaveText(
      'Enter a 10-digit phone number'
    );
    expect(saves).toBe(0);
    await expect(
      page.getByRole('button', { name: 'Mark profile complete' })
    ).toBeDisabled();
    for (const value of [
      undefined,
      '',
      '555555010',
      '55555501000',
      '555555010a',
      '5555550100abc',
    ]) {
      const invalid = await page.request.put(`${api}/api/doulas/profile`, {
        data: { phone_number: value },
      });
      expect(invalid.status()).toBe(400);
      expect((await invalid.json()).error).toBe(
        'Enter a 10-digit phone number'
      );
    }
    await phone.pressSequentially('5555550100');
    await expect(phone).toHaveValue('555-555-0100');
    const saved = page.waitForResponse(
      (r) =>
        r.url() === `${api}/api/doulas/profile` &&
        r.request().method() === 'PUT'
    );
    await page
      .getByRole('button', { name: 'Save Changes', exact: true })
      .click();
    const response = await saved;
    expect(response.status()).toBe(200);
    expect((await response.json()).profile.phone_number).toBe('5555550100');
    await page.reload();
    await expect(phone).toHaveValue('555-555-0100');
    const after = await page.request.get(`${api}/api/doulas/profile`);
    expect((await after.json()).profile.certifications).toEqual(certifications);
    for (const [context, user] of [
      [admin, fixture.admin],
      [client, fixture.client],
    ] as const) {
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
    }
    const adminPage = await admin.newPage();
    await adminPage.goto(`/hours/${fixture.doula.id}`);
    await expect(
      adminPage.getByText('555-555-0100', { exact: true })
    ).toBeVisible();
    await adminPage.goto(`/team?review=${fixture.doula.id}`);
    await expect(
      adminPage.getByRole('dialog').getByText('555-555-0100', { exact: true })
    ).toBeVisible();
    const clientPage = await client.newPage();
    await clientPage.goto('/profile');
    await expect(
      clientPage.getByText('P15 Fictional Doula Rivers', { exact: true })
    ).toBeVisible();
    await expect(clientPage.getByText(/555-555-0100|5555550100/)).toHaveCount(
      0
    );
    const assignments = await clientPage.request.get(
      `${api}/api/clients/${fixture.client.id}/assigned-doulas`
    );
    expect(assignments.status()).toBe(200);
    const body = await assignments.json();
    expect(body.doulas.length).toBeGreaterThan(0);
    expect(JSON.stringify(body)).not.toMatch(/5555550100|555-555-0100|phone/i);
  } finally {
    await doula.close();
    await admin.close();
    await client.close();
  }
});
