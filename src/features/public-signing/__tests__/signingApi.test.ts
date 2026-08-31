import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearSigningSessionToken,
  exchangeSigningInvitation,
  fetchSigningDocument,
  getSigningSession,
  parseSigningInvitationCredential,
  saveSigningProgress,
  scrubSigningUrlFromAddressBar,
  SIGNING_SESSION_DOCUMENT_PATH,
  SigningApiError,
} from '@/features/public-signing/signingApi';

vi.mock('@/api/http', () => ({
  buildUrl: (path: string) => `https://api.example.test${path}`,
}));

const fetchMock = vi.fn();
type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;

const INVITATION_SECRET = 'invitation-secret-value';
const INVITATION_ID = '11111111-1111-4111-8111-111111111111';
const INVITATION = `${INVITATION_ID}.${INVITATION_SECRET}`;
const SESSION_SECRET = 'session-secret-value';
const SESSION_ID = '22222222-2222-4222-8222-222222222222';
const SESSION = `${SESSION_ID}.${SESSION_SECRET}`;

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {}
) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
}

describe('public signing API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    clearSigningSessionToken();
  });

  it('exchanges invitation credentials via POST without URL credentials', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        sessionToken: SESSION,
        expiresAt: '2026-12-31T00:00:00.000Z',
      })
    );

    await exchangeSigningInvitation(INVITATION);

    const [url, init] = fetchMock.mock.calls[0] as [string, FetchInit];
    expect(url).toBe('https://api.example.test/signing/session/exchange');
    expect(url).not.toContain(INVITATION_SECRET);
    expect(JSON.parse(String(init.body))).toEqual({ invitation: INVITATION });
    expect(init.credentials).toBe('omit');
    expect(init.cache).toBe('no-store');
  });

  it('uses credential-free session paths with X-Signing-Session header', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          sessionToken: SESSION,
          expiresAt: '2026-12-31T00:00:00.000Z',
        })
      )
      .mockResolvedValueOnce(jsonResponse({ contractId: 'contract-1' }));

    await exchangeSigningInvitation(INVITATION);
    await getSigningSession();

    const [url, init] = fetchMock.mock.calls[1] as [string, FetchInit];
    expect(url).toBe('https://api.example.test/signing/session');
    expect(url).not.toContain(INVITATION_SECRET);
    expect(url).not.toContain(SESSION_SECRET);
    expect(new Headers(init.headers).get('X-Signing-Session')).toBe(SESSION);
  });

  it('posts only completedFieldIds when saving progress', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          sessionToken: SESSION,
          expiresAt: '2026-12-31T00:00:00.000Z',
        })
      )
      .mockResolvedValueOnce(jsonResponse({ contractId: 'contract-1' }));

    await exchangeSigningInvitation(INVITATION);
    await saveSigningProgress(['signature', 'date']);

    const [url, init] = fetchMock.mock.calls[1] as [string, FetchInit];
    expect(url).toBe('https://api.example.test/signing/session/progress');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      completedFieldIds: ['signature', 'date'],
    });
  });

  it('loads authenticated PDF bytes without credentials in the URL', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          sessionToken: SESSION,
          expiresAt: '2026-12-31T00:00:00.000Z',
        })
      )
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]).buffer));

    await exchangeSigningInvitation(INVITATION);
    const bytes = await fetchSigningDocument();

    const [url, init] = fetchMock.mock.calls[1] as [string, FetchInit];
    expect(url).toBe(
      `https://api.example.test${SIGNING_SESSION_DOCUMENT_PATH}`
    );
    expect(url).not.toContain(SESSION_SECRET);
    expect(new Headers(init.headers).get('X-Signing-Session')).toBe(SESSION);
    expect(bytes.byteLength).toBe(3);
  });

  it('returns safe flat errors and Retry-After metadata', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: 'Please wait before trying again' },
        { status: 429, headers: { 'Retry-After': '45' } }
      )
    );

    await expect(exchangeSigningInvitation(INVITATION)).rejects.toMatchObject({
      name: 'SigningApiError',
      message: 'Please wait before trying again',
      status: 429,
      retryAfterSeconds: 45,
    } satisfies Partial<SigningApiError>);
  });

  it('does not expose invitation credentials echoed by an error response', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: `Invalid ${INVITATION_SECRET}` }, { status: 400 })
    );

    await expect(exchangeSigningInvitation(INVITATION)).rejects.toThrow(
      'The signing request could not be completed.'
    );
  });

  it('parses invitation credentials from URL fragments and legacy path tokens', () => {
    expect(
      parseSigningInvitationCredential({
        hash: `#invitation=${encodeURIComponent(INVITATION)}`,
      })
    ).toBe(INVITATION);
    expect(
      parseSigningInvitationCredential({
        hash: '',
        legacyPathToken: INVITATION,
      })
    ).toBe(INVITATION);
  });

  it('scrubs invitation material from the address bar', () => {
    window.history.replaceState({}, '', `/signing#invitation=${INVITATION}`);
    scrubSigningUrlFromAddressBar();
    expect(window.location.pathname).toBe('/signing');
    expect(window.location.hash).toBe('');
    expect(window.location.href).not.toContain(INVITATION_SECRET);
  });
});
