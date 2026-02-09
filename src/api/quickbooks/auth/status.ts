// src/api/quickbooks/status.ts

const API_BASE =
  import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';
/**
 * Check whether the current user is connected to QuickBooks.
 * @returns true if connected, false otherwise
 */
export async function getConnectionStatus(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/quickbooks/status`, {
    method: 'GET',
    credentials: 'include',
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
  const res = await fetch(`${API_BASE}/quickbooks/disconnect`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to disconnect QuickBooks: ${err}`);
  }
}
