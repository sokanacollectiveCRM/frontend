import { readFileSync } from 'fs';
import { resolve } from 'path';

export type EmailVerificationFixture = {
  apiBaseUrl: string;
  frontendBaseUrl: string;
  email: string;
  password: string;
  uid: string;
  verifyUrl: string;
  unverifiedSessionCookie: string;
  preparedAt: string;
};

export function loadEmailVerificationFixture(): EmailVerificationFixture {
  const path = resolve(process.cwd(), 'e2e/.fixtures/email-verification.json');
  return JSON.parse(readFileSync(path, 'utf8')) as EmailVerificationFixture;
}

export async function fetchIdTokenWithPassword(
  email: string,
  password: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );
  const body = (await res.json()) as {
    idToken?: string;
    error?: { message?: string };
  };
  if (!res.ok || !body.idToken) {
    throw new Error(
      body.error?.message || `Password sign-in failed (${res.status})`
    );
  }
  return body.idToken;
}
