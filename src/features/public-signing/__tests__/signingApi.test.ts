import {
  completeSigning,
  getSigningSession,
  saveSigningProgress,
  SigningApiError,
} from '@/features/public-signing/signingApi';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/http', () => ({
  buildUrl: (path: string) => `https://api.example.test${path}`,
}));

const fetchMock = vi.fn();
type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;

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
  });

  it('loads the encoded token URL without credentials or caching', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ contractId: 'contract-1' }));

    await getSigningSession('invite/secret value');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/signing/invite%2Fsecret%20value',
      expect.objectContaining({
        credentials: 'omit',
        cache: 'no-store',
      })
    );
  });

  it('posts only completedFieldIds when saving progress', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ contractId: 'contract-1' }));

    await saveSigningProgress('token', ['signature', 'date']);

    const [, init] = fetchMock.mock.calls[0] as [string, FetchInit];
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      completedFieldIds: ['signature', 'date'],
    });
    expect(init.credentials).toBe('omit');
    expect(init.cache).toBe('no-store');
  });

  it('posts the exact completion body', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ contractId: 'contract-1', status: 'signed' })
    );
    const body = {
      signature: { type: 'typed' as const, text: 'Jane Doe' },
      consent: true as const,
      initials: 'JD',
      completedFieldIds: ['signature', 'initials', 'date'],
    };

    await completeSigning('token', body);

    const [, init] = fetchMock.mock.calls[0] as [string, FetchInit];
    expect(JSON.parse(String(init.body))).toEqual(body);
  });

  it('returns safe flat errors and Retry-After metadata', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: 'Please wait before trying again' },
        { status: 429, headers: { 'Retry-After': '45' } }
      )
    );

    await expect(getSigningSession('token')).rejects.toMatchObject({
      name: 'SigningApiError',
      message: 'Please wait before trying again',
      status: 429,
      retryAfterSeconds: 45,
    } satisfies Partial<SigningApiError>);
  });

  it('does not expose a token echoed by an error response', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'Invalid secret-token' }, { status: 400 })
    );

    await expect(getSigningSession('secret-token')).rejects.toThrow(
      'The signing request could not be completed.'
    );
  });
});
