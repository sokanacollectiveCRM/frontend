import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPut } = vi.hoisted(() => ({
  mockPut: vi.fn(),
}));

vi.mock('../../http', () => ({
  get: vi.fn(),
  put: mockPut,
}));

vi.mock('../../config', () => ({
  API_CONFIG: {
    useLegacyApi: false,
    baseUrl: 'http://localhost:5050',
    isProd: false,
  },
}));

import { updateClientPhi } from '@/api/services/clients.service';

describe('updateClientPhi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes numeric zip_code values to strings before sending', async () => {
    mockPut.mockResolvedValueOnce({ success: true });

    await updateClientPhi('client-1', {
      zip_code: 60601,
      first_name: 'Jane',
    });

    expect(mockPut).toHaveBeenCalledWith(
      '/clients/client-1/phi',
      expect.objectContaining({
        zip_code: '60601',
        first_name: 'Jane',
      })
    );
  });

  it('preserves a trimmed ZIP string unchanged', async () => {
    mockPut.mockResolvedValueOnce({ success: true });

    await updateClientPhi('client-1', {
      zip_code: ' 01234 ',
    });

    expect(mockPut).toHaveBeenCalledWith(
      '/clients/client-1/phi',
      expect.objectContaining({
        zip_code: '01234',
      })
    );
  });
});
