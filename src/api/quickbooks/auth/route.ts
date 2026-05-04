import { API_CONFIG } from '@/api/config';

const API_BASE = API_CONFIG.baseUrl.replace(/\/$/, '');

type QuickBooksAuthUrlResponse = {
  url?: string;
};

/**
 * Kick off the OAuth flow by retrieving the Intuit consent URL.
 *
 * Supports both backend route variants:
 * - /quickbooks/auth/url
 * - /quickbooks/auth
 */
export async function getQuickBooksAuthUrl(): Promise<string> {
  const candidates = ['/quickbooks/auth/url', '/quickbooks/auth'];
  const errors: string[] = [];

  for (const path of candidates) {
    const endpoint = `${API_BASE}${path}`;
    const res = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = (await res.text()).trim();
      errors.push(`${path} -> HTTP ${res.status}${body ? `: ${body.slice(0, 180)}` : ''}`);
      continue;
    }

    const payload = (await res.json()) as QuickBooksAuthUrlResponse;
    if (!payload?.url) {
      errors.push(`${path} -> Missing "url" in response`);
      continue;
    }

    return payload.url;
  }

  throw new Error(`Could not fetch QuickBooks auth URL. Tried ${candidates.join(', ')}. ${errors.join(' | ')}`);
}
