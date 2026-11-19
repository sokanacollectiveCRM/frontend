import { fetchClientById } from '@/api/services/clients.service';
import type { ClientDetail } from '@/domain/client';

const detailCache = new Map<string, ClientDetail>();
const inflightRequests = new Map<string, Promise<ClientDetail | null>>();

export function getCachedClientDetail(
  clientId: string
): ClientDetail | undefined {
  return detailCache.get(String(clientId));
}

export function setCachedClientDetail(
  clientId: string,
  detail: ClientDetail
): void {
  detailCache.set(String(clientId), detail);
}

export function invalidateCachedClientDetail(clientId: string): void {
  const key = String(clientId);
  detailCache.delete(key);
  inflightRequests.delete(key);
}

/** Fire-and-forget prefetch (e.g. on table row click before modal opens). */
export function prefetchClientDetail(clientId: string): void {
  void loadClientDetail(clientId);
}

/**
 * Load client detail with in-memory cache and in-flight deduplication.
 * Concurrent callers for the same id share one network request.
 */
export async function loadClientDetail(
  clientId: string,
  options?: { force?: boolean }
): Promise<ClientDetail | null> {
  const key = String(clientId);
  const force = options?.force === true;

  if (!force) {
    const cached = detailCache.get(key);
    if (cached) return cached;

    const inflight = inflightRequests.get(key);
    if (inflight) return inflight;
  }

  const request = fetchClientById(key)
    .then((detail) => {
      if (detail) detailCache.set(key, detail);
      return detail;
    })
    .finally(() => {
      if (inflightRequests.get(key) === request) {
        inflightRequests.delete(key);
      }
    });

  inflightRequests.set(key, request);
  return request;
}
