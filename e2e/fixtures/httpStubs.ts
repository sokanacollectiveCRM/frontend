import type { Page } from '@playwright/test';

export type StubbedUser = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
};

export function defaultCorsHeaders() {
  return {
    // Credentials requests (credentials: 'include') cannot use wildcard origin.
    'access-control-allow-origin': 'http://localhost:3001',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
  } as const;
}

/** Handle CORS preflight requests the app triggers in dev. */
export async function installCorsPreflightStub(page: Page, headers = defaultCorsHeaders()) {
  await page.route('**/*', (route) => {
    if (route.request().method() !== 'OPTIONS') return route.continue();
    route.fulfill({
      status: 204,
      headers,
      body: '',
    });
  });
}

/** Stub the backend cookie-mode `GET /auth/me` check used by `UserContext`. */
export async function stubAuthMe(page: Page, user: StubbedUser, headers = defaultCorsHeaders()) {
  await page.route('**/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: JSON.stringify(user),
    });
  });
}

