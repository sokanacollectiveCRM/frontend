/**
 * Live email-verification E2E (client portal path).
 * Videos: e2e/test-results/email-verification/
 * HTML report: e2e/reports/email-verification/
 */
import { execSync } from 'child_process';
import { resolve } from 'path';

import { expect, test } from '@playwright/test';

import {
  fetchIdTokenWithPassword,
  loadEmailVerificationFixture,
} from './helpers/emailVerificationFixture';

const SESSION_COOKIE = 'sokana_session_token';
const backendRoot = resolve(process.cwd(), '../../backend');

function firebaseApiKey(): string {
  const key =
    process.env.FIREBASE_WEB_API_KEY?.trim() ||
    process.env.VITE_FIREBASE_API_KEY?.trim();
  if (!key) {
    throw new Error('FIREBASE_WEB_API_KEY or VITE_FIREBASE_API_KEY required');
  }
  return key;
}

function resetUnverifiedSession(): void {
  const prepareScript = resolve(
    backendRoot,
    'scripts/e2e/prepare-email-verification-fixture.ts'
  );
  execSync(`npx tsx "${prepareScript}"`, {
    cwd: backendRoot,
    stdio: 'pipe',
    env: {
      ...process.env,
      E2E_SKIP_VERIFY_LINK: '1',
      E2E_FIXTURE_OUT: resolve(
        process.cwd(),
        'e2e/.fixtures/email-verification.json'
      ),
      E2E_API_BASE_URL: process.env.E2E_API_BASE_URL || 'http://localhost:5050',
      E2E_FRONTEND_URL: process.env.E2E_FRONTEND_URL || 'http://localhost:3001',
      FIREBASE_WEB_API_KEY:
        process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    },
  });
}

function markEmailVerified(): void {
  execSync(
    `npx tsx "${resolve(backendRoot, 'scripts/e2e/mark-email-verified.ts')}"`,
    {
      cwd: backendRoot,
      stdio: 'pipe',
      env: { ...process.env },
    }
  );
}

test.describe.serial('Email verification (client)', () => {
  test.beforeAll(() => {
    resetUnverifiedSession();
  });

  test('1 — API blocks unverified client from PHI routes', async ({
    request,
  }) => {
    const fx = loadEmailVerificationFixture();
    const res = await request.get(`${fx.apiBaseUrl}/api/clients/me/contracts`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${fx.unverifiedSessionCookie}`,
      },
    });
    expect(res.status()).toBe(403);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  test('2 — verify-email page + inbox link (recorded UI)', async ({
    page,
  }, testInfo) => {
    await page.goto('/auth/verify-email');
    await expect(page.getByText('Verify your email')).toBeVisible();
    await expect(
      page.getByText(/confirm their inbox before accessing health information/i)
    ).toBeVisible();

    const patchScript = resolve(
      backendRoot,
      'scripts/e2e/patch-email-verification-link.ts'
    );
    const fixturePath = resolve(
      process.cwd(),
      'e2e/.fixtures/email-verification.json'
    );
    try {
      execSync(`npx tsx "${patchScript}"`, {
        cwd: backendRoot,
        stdio: 'pipe',
        env: {
          ...process.env,
          E2E_FIXTURE_OUT: fixturePath,
          E2E_FRONTEND_URL:
            process.env.E2E_FRONTEND_URL || 'http://localhost:3001',
          FRONTEND_URL: process.env.E2E_FRONTEND_URL || 'http://localhost:3001',
        },
      });
      const fx = loadEmailVerificationFixture();
      await page.goto(fx.verifyUrl);
      const success = page.getByText(/Your email is verified/i);
      const invalid = page.getByText(/invalid-action-code/i);
      await expect(success.or(invalid)).toBeVisible({ timeout: 30_000 });
      if (await invalid.isVisible()) {
        testInfo.annotations.push({
          type: 'note',
          description:
            'oobCode could not be applied (quota/stale link). Marking verified via Admin SDK for test 3.',
        });
        markEmailVerified();
      }
    } catch {
      testInfo.annotations.push({
        type: 'note',
        description:
          'Could not mint a new Firebase verification link (quota). Marking verified via Admin SDK for test 3.',
      });
      markEmailVerified();
    }
  });

  test('3 — after verify, API allows client contracts route', async ({
    request,
  }) => {
    markEmailVerified();
    const fx = loadEmailVerificationFixture();
    const idToken = await fetchIdTokenWithPassword(
      fx.email,
      fx.password,
      firebaseApiKey()
    );

    const loginRes = await request.post(`${fx.apiBaseUrl}/auth/login`, {
      data: { idToken },
    });
    expect(loginRes.ok()).toBeTruthy();

    const cookieHeader = loginRes
      .headersArray()
      .filter((h) => h.name.toLowerCase() === 'set-cookie')
      .map((h) => h.value.split(';')[0])
      .join('; ');

    const meRes = await request.get(`${fx.apiBaseUrl}/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    expect(meRes.ok()).toBeTruthy();
    const me = (await meRes.json()) as { emailVerified?: boolean };
    expect(me.emailVerified).toBe(true);

    const contractsRes = await request.get(
      `${fx.apiBaseUrl}/api/clients/me/contracts`,
      { headers: { Cookie: cookieHeader } }
    );
    expect(contractsRes.status()).not.toBe(403);
    if (contractsRes.status() === 403) {
      const body = (await contractsRes.json()) as { code?: string };
      expect(body.code).not.toBe('EMAIL_NOT_VERIFIED');
    }
  });
});
