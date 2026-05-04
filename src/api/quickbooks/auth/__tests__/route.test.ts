import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/config', () => ({
  API_CONFIG: {
    baseUrl: 'https://api.example.com',
  },
}));

import { getQuickBooksAuthUrl } from '../route';

describe('getQuickBooksAuthUrl', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  it('retries both backend route variants and returns the consent URL', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Cannot GET /quickbooks/auth/url',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'https://intuit.example.com/oauth' }),
      });

    await expect(getQuickBooksAuthUrl()).resolves.toBe(
      'https://intuit.example.com/oauth'
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.example.com/quickbooks/auth/url',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.example.com/quickbooks/auth',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );
  });

  it('throws a helpful error when both routes fail', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Cannot GET /quickbooks/auth/url',
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Cannot GET /quickbooks/auth',
      });

    await expect(getQuickBooksAuthUrl()).rejects.toThrow(
      'Could not fetch QuickBooks auth URL. Tried /quickbooks/auth/url, /quickbooks/auth.'
    );
  });
});
