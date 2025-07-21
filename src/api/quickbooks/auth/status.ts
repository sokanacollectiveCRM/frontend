// src/api/quickbooks/status.ts

const API_BASE =
  import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';
const TOKEN_KEY = 'sb-gidrzzrnurvgtzloomje-auth-token'; // your Supabase session key

/**
 * Extract the Supabase access token from localStorage.
 */
function getAuthToken(): string | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as { access_token: string };
    return session.access_token;
  } catch {
    return null;
  }
}

/**
 * Check whether the current user is connected to QuickBooks.
 * @returns true if connected, false otherwise
 */
export async function getConnectionStatus(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  const res = await fetch(`${API_BASE}/quickbooks/status`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  // Treat 401 as not connected
  if (res.status === 401) return false;

  if (!res.ok) {
    throw new Error(`Status fetch failed: ${res.statusText}`);
  }

  const { connected } = (await res.json()) as { connected: boolean };
  return connected;
}

/**
 * Disconnect the current user from QuickBooks (deletes stored tokens).
 */
export async function disconnectQuickBooks(): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/quickbooks/disconnect`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to disconnect QuickBooks: ${err}`);
  }
}
