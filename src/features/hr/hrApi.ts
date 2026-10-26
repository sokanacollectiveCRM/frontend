import { buildUrl, fetchWithAuth } from '@/api/http';
export async function hrRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetchWithAuth(buildUrl(`/api/hr${path}`), {
    method: body === undefined ? 'GET' : 'PATCH',
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      response.status === 403
        ? 'HR access denied.'
        : data.error || 'Unable to load HR workspace.'
    );
  return data;
}
