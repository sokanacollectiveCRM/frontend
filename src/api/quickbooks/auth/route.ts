// src/api/quickbooks/auth.ts

const API_BASE =
  import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

/**
 * Kick off the OAuth flow by retrieving the Intuit consent URL.
 */
export async function getQuickBooksAuthUrl(): Promise<string> {
  const res = await fetch(`${API_BASE}/quickbooks/auth`, {
    method: 'GET',
    credentials: 'include', // Include session cookies
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Auth URL fetch failed: ${err}`);
  }

  const { url } = (await res.json()) as { url: string };
  return url;
}
