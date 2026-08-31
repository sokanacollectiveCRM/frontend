import { buildUrl } from '@/api/http';
import type {
  CompleteSigningBody,
  SigningCompletion,
  SigningSession,
} from '@/features/public-signing/types';

type PublicFetchInit = NonNullable<Parameters<typeof fetch>[1]>;

export class SigningApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterSeconds: number | null
  ) {
    super(message);
    this.name = 'SigningApiError';
  }
}

async function request<T>(
  token: string,
  suffix: '' | '/progress' | '/complete',
  init?: PublicFetchInit
): Promise<T> {
  const response = await fetch(
    buildUrl(`/signing/${encodeURIComponent(token)}${suffix}`),
    {
      ...init,
      credentials: 'omit',
      cache: 'no-store',
      headers: init?.body
        ? { 'Content-Type': 'application/json', ...init.headers }
        : init?.headers,
    }
  );

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Error responses are intentionally reduced to a generic safe message.
  }

  if (!response.ok) {
    const backendMessage =
      typeof body === 'object' &&
      body !== null &&
      typeof (body as { error?: unknown }).error === 'string'
        ? (body as { error: string }).error
        : null;
    const safeMessage =
      backendMessage && !backendMessage.includes(token)
        ? backendMessage
        : 'The signing request could not be completed.';
    const retryAfter = response.headers.get('Retry-After');
    const parsedRetryAfter = retryAfter ? Number.parseInt(retryAfter, 10) : NaN;
    throw new SigningApiError(
      safeMessage,
      response.status,
      Number.isFinite(parsedRetryAfter) ? parsedRetryAfter : null
    );
  }

  return body as T;
}

export function getSigningSession(token: string): Promise<SigningSession> {
  return request<SigningSession>(token, '');
}

export function saveSigningProgress(
  token: string,
  completedFieldIds: string[]
): Promise<SigningSession> {
  return request<SigningSession>(token, '/progress', {
    method: 'POST',
    body: JSON.stringify({ completedFieldIds }),
  });
}

export function completeSigning(
  token: string,
  body: CompleteSigningBody
): Promise<SigningCompletion> {
  return request<SigningCompletion>(token, '/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
