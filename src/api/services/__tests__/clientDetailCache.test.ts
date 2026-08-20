import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClientDetail } from '@/domain/client';

vi.mock('@/api/services/clients.service', () => ({
  fetchClientById: vi.fn(),
}));

import { fetchClientById } from '@/api/services/clients.service';
import {
  getCachedClientDetail,
  invalidateCachedClientDetail,
  loadClientDetail,
  prefetchClientDetail,
  setCachedClientDetail,
} from '@/api/services/clientDetailCache';

const mockDetail = {
  id: 'client-1',
  firstName: 'Jane',
  lastName: 'Doe',
  servicesInterested: ['Labor Support'],
} as ClientDetail;

describe('clientDetailCache', () => {
  beforeEach(() => {
    invalidateCachedClientDetail('client-1');
    vi.mocked(fetchClientById).mockReset();
  });

  it('returns cached detail without a network call', async () => {
    setCachedClientDetail('client-1', mockDetail);

    const result = await loadClientDetail('client-1');

    expect(result).toEqual(mockDetail);
    expect(fetchClientById).not.toHaveBeenCalled();
  });

  it('dedupes concurrent loads for the same client id', async () => {
    let resolveFetch: (value: ClientDetail) => void = () => undefined;
    vi.mocked(fetchClientById).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    const first = loadClientDetail('client-1');
    const second = loadClientDetail('client-1');

    expect(fetchClientById).toHaveBeenCalledTimes(1);

    resolveFetch(mockDetail);

    await expect(first).resolves.toEqual(mockDetail);
    await expect(second).resolves.toEqual(mockDetail);
    expect(getCachedClientDetail('client-1')).toEqual(mockDetail);
  });

  it('force refresh bypasses cache and replaces the entry', async () => {
    setCachedClientDetail('client-1', mockDetail);
    const updated = {
      ...mockDetail,
      servicesInterested: ['Postpartum Support'],
    } as ClientDetail;
    vi.mocked(fetchClientById).mockResolvedValue(updated);

    const result = await loadClientDetail('client-1', { force: true });

    expect(fetchClientById).toHaveBeenCalledTimes(1);
    expect(result).toEqual(updated);
    expect(getCachedClientDetail('client-1')).toEqual(updated);
  });

  it('prefetch starts a background load', async () => {
    vi.mocked(fetchClientById).mockResolvedValue(mockDetail);

    prefetchClientDetail('client-1');
    await vi.waitFor(() => {
      expect(getCachedClientDetail('client-1')).toEqual(mockDetail);
    });
  });
});
