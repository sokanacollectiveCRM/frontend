import { buildUrl } from '@/api/http';
import type {
  CompleteSigningBody,
  SigningCompletion,
  SigningSession,
} from '@/features/public-signing/types';

type PublicFetchInit = NonNullable<Parameters<typeof fetch>[1]>;

export const SIGNING_SESSION_DOCUMENT_PATH = '/signing/session/document';
const SIGNING_SESSION_HEADER = 'X-Signing-Session';

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

/** In-memory only — never persisted to storage or analytics. */
let activeSessionToken: string | null = null;

export function clearSigningSessionToken(): void {
  activeSessionToken = null;
}

export function hasSigningSessionToken(): boolean {
  return activeSessionToken !== null;
}

function signingHeaders(init?: PublicFetchInit): Record<string, string> {
  const headers: Record<string, string> = {};
  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers[key] = value;
    });
  }
  if (!headers['Content-Type'] && init?.body) {
    headers['Content-Type'] = 'application/json';
  }
  if (activeSessionToken) {
    headers[SIGNING_SESSION_HEADER] = activeSessionToken;
  }
  return headers;
}

function assertCredentialFreeUrl(url: string, credential?: string): void {
  if (!credential) return;
  const decoded = decodeURIComponent(url);
  if (decoded.includes(credential)) {
    throw new Error('Signing credential must not appear in request URLs');
  }
}

function messageContainsCredential(
  message: string,
  credential?: string
): boolean {
  if (!credential) return false;
  if (message.includes(credential)) return true;
  const secret = credential.includes('.')
    ? credential.slice(credential.indexOf('.') + 1)
    : credential;
  return secret.length >= 8 && message.includes(secret);
}

async function parseSigningResponse<T>(
  response: Response,
  credential?: string
): Promise<T> {
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
      backendMessage &&
      !messageContainsCredential(backendMessage, credential) &&
      (!activeSessionToken ||
        !messageContainsCredential(backendMessage, activeSessionToken))
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

async function sessionRequest<T>(
  path: string,
  init?: PublicFetchInit,
  credential?: string
): Promise<T> {
  if (!activeSessionToken) {
    throw new SigningApiError(
      'The signing request could not be completed.',
      401,
      null
    );
  }
  const url = buildUrl(path);
  assertCredentialFreeUrl(url, credential);
  assertCredentialFreeUrl(url, activeSessionToken);

  const response = await fetch(url, {
    ...init,
    credentials: 'omit',
    cache: 'no-store',
    headers: signingHeaders(init),
  });

  return parseSigningResponse<T>(response, credential);
}

export interface ExchangedSigningSession {
  sessionToken: string;
  expiresAt: string;
}

export async function exchangeSigningInvitation(
  invitation: string
): Promise<ExchangedSigningSession> {
  const url = buildUrl('/signing/session/exchange');
  assertCredentialFreeUrl(url, invitation);

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'omit',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitation }),
  });

  const body = await parseSigningResponse<ExchangedSigningSession>(
    response,
    invitation
  );
  activeSessionToken = body.sessionToken;
  return body;
}

export function getSigningSession(): Promise<SigningSession> {
  return sessionRequest<SigningSession>('/signing/session');
}

export function saveSigningProgress(
  completedFieldIds: string[]
): Promise<SigningSession> {
  return sessionRequest<SigningSession>('/signing/session/progress', {
    method: 'POST',
    body: JSON.stringify({ completedFieldIds }),
  });
}

export function completeSigning(
  body: CompleteSigningBody
): Promise<SigningCompletion> {
  return sessionRequest<SigningCompletion>('/signing/session/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function isSessionDocumentUrl(pdfUrl: string): boolean {
  return (
    pdfUrl === SIGNING_SESSION_DOCUMENT_PATH ||
    pdfUrl.endsWith(SIGNING_SESSION_DOCUMENT_PATH)
  );
}

export async function fetchSigningDocument(): Promise<ArrayBuffer> {
  if (!activeSessionToken) {
    throw new SigningApiError(
      'The signing request could not be completed.',
      401,
      null
    );
  }
  const url = buildUrl(SIGNING_SESSION_DOCUMENT_PATH);
  assertCredentialFreeUrl(url, activeSessionToken);

  const response = await fetch(url, {
    credentials: 'omit',
    cache: 'no-store',
    headers: signingHeaders(),
  });

  if (!response.ok) {
    await parseSigningResponse<never>(response);
  }

  return response.arrayBuffer();
}

/** Parse invitation credential from URL fragment or legacy path token. */
export function parseSigningInvitationCredential(input: {
  hash: string;
  legacyPathToken?: string | null;
}): string | null {
  if (input.legacyPathToken?.trim()) {
    return input.legacyPathToken.trim();
  }
  const fragment = input.hash.startsWith('#')
    ? input.hash.slice(1)
    : input.hash;
  if (!fragment) return null;
  const params = new URLSearchParams(fragment);
  const invitation = params.get('invitation')?.trim();
  return invitation || null;
}

/** Remove invitation material from the visible URL without reloading. */
export function scrubSigningUrlFromAddressBar(): void {
  if (typeof window === 'undefined') return;
  const next = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState(window.history.state, '', next);
}
