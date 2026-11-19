import { expect, test, type Page } from '@playwright/test';
const A = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'first-org',
  name: 'First Organization',
  role: 'doula',
};
const B = {
  id: '22222222-2222-4222-8222-222222222222',
  slug: 'sokana360',
  name: 'Sokana 360',
  role: 'doula',
};
const uid = 'shared-doula-login';
const email = 'doula@example.test';
function token() {
  const now = Math.floor(Date.now() / 1000);
  return (
    [
      { alg: 'none' },
      {
        sub: uid,
        user_id: uid,
        email,
        email_verified: true,
        aud: 'sokana-org-test',
        iss: 'https://securetoken.google.com/sokana-org-test',
        iat: now,
        auth_time: now,
        exp: now + 3600,
        firebase: { sign_in_provider: 'password' },
      },
    ]
      .map((v) => Buffer.from(JSON.stringify(v)).toString('base64url'))
      .join('.') + '.test'
  );
}
async function stubs(page: Page) {
  const idToken = token();
  const cors = {
    'access-control-allow-origin': 'http://localhost:3007',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
  };
  await page.route(
    'https://identitytoolkit.googleapis.com/**',
    async (route) => {
      const url = route.request().url();
      const data = url.includes('accounts:lookup')
        ? {
            users: [
              {
                localId: uid,
                email,
                emailVerified: true,
                passwordHash: 'synthetic',
                providerUserInfo: [
                  { providerId: 'password', email, federatedId: email },
                ],
              },
            ],
          }
        : {
            localId: uid,
            email,
            idToken,
            refreshToken: 'synthetic-refresh',
            expiresIn: '3600',
            registered: true,
          };
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    }
  );
  await page.route('https://securetoken.googleapis.com/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        id_token: idToken,
        access_token: idToken,
        refresh_token: 'synthetic-refresh',
        expires_in: '3600',
        user_id: uid,
        project_id: 'sokana-org-test',
      }),
    })
  );
  await page.route('http://localhost:5057/**', async (route) => {
    if (route.request().method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers: cors });
    const url = route.request().url();
    if (url.endsWith('/auth/session'))
      return route.fulfill({
        headers: cors,
        json: {
          mfaRequired: true,
          challengeId: 'synthetic-challenge',
          emailHint: 'd***@example.test',
          resendAvailableInSec: 60,
        },
      });
    if (url.endsWith('/auth/me')) {
      const selected = route.request().headers()['x-tenant-id'];
      if (!selected)
        return route.fulfill({
          status: 409,
          headers: cors,
          json: {
            code: 'TENANT_SELECTION_REQUIRED',
            error: 'Choose an organization',
            tenants: [A, B],
          },
        });
      const tenant = selected === B.id ? B : A;
      return route.fulfill({
        headers: cors,
        json: {
          id: selected === B.id ? 'profile-b' : 'profile-a',
          firstname: 'Dana',
          lastname: 'Doula',
          email,
          role: 'doula',
          emailVerified: true,
          tenant,
        },
      });
    }
    return route.fulfill({ headers: cors, json: { success: true, data: [] } });
  });
}

test('MFA leads to organization selection, persists the choice, and switches without retaining old profile data', async ({
  page,
}) => {
  await stubs(page);
  await page.goto('/login?next=%2Fmy-account');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('synthetic-password');
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await expect(
    page.getByText('Check your email', { exact: true })
  ).toBeVisible();
  await page.getByLabel('Verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify and continue' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose your organization' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: A.name })).toBeVisible();
  await expect(page.getByRole('button', { name: B.name })).toBeVisible();
  await page.screenshot({
    path: 'test-results/organizations/organization-chooser.png',
    fullPage: true,
  });
  const bRequest = page.waitForRequest(
    (req) =>
      req.url().endsWith('/auth/me') && req.headers()['x-tenant-id'] === B.id
  );
  await page.getByRole('button', { name: B.name }).click();
  await bRequest;
  await expect(page).toHaveURL(/\/my-account$/);
  await expect(
    page.getByRole('heading', { name: 'Account', exact: true })
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('sokana.selected-organization')
    )
  ).toBe(B.id);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Account', exact: true })
  ).toBeVisible();
  await page
    .getByRole('button', { name: /Dana Doula.*doula@example.test/ })
    .click();
  await page.getByRole('menuitem', { name: 'Switch organization' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose your organization' })
  ).toBeVisible();
  await Promise.all([
    page.waitForEvent('domcontentloaded'),
    page.getByRole('button', { name: A.name, exact: true }).click(),
  ]);
  await expect(
    page.getByRole('heading', { name: 'Welcome back, Dana!', exact: true })
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('sokana.selected-organization')
    )
  ).toBe(A.id);
  await expect(page.getByText(A.name, { exact: true }).first()).toBeVisible();
});

test('invitation screen accepts an existing account using its current password', async ({
  page,
}) => {
  await stubs(page);
  let accepted: Record<string, unknown> | undefined;
  await page.route('**/auth/invitations/preview', (route) =>
    route.fulfill({
      headers: {
        'access-control-allow-origin': 'http://localhost:3007',
        'access-control-allow-headers': '*',
        'access-control-allow-methods': '*',
      },
      json: {
        email,
        firstname: 'Dana',
        lastname: 'Doula',
        role: 'doula',
        organizationName: B.name,
        requiresSignIn: true,
      },
    })
  );
  await page.route('**/auth/invitations/accept', async (route) => {
    accepted = route.request().postDataJSON();
    await route.fulfill({
      headers: {
        'access-control-allow-origin': 'http://localhost:3007',
        'access-control-allow-headers': '*',
        'access-control-allow-methods': '*',
      },
      json: { requiresEmailVerification: false, organizationName: B.name },
    });
  });
  await page.goto('/accept-invite?token=synthetic-invitation');
  await page.getByLabel('Existing password').fill('synthetic-password');
  await page
    .getByRole('button', { name: 'Sign in and accept invitation' })
    .click();
  await expect(
    page.getByText(/Your invitation to Sokana 360 is accepted/)
  ).toBeVisible();
  expect(accepted?.token).toBe('synthetic-invitation');
  expect(accepted?.idToken).toBeTruthy();
  expect(accepted).not.toHaveProperty('password');
  await page.getByRole('link', { name: 'Go to login' }).click();
  await expect(
    page.getByRole('button', { name: 'Log In', exact: true })
  ).toBeVisible();
});
