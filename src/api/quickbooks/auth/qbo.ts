const API_BASE = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

/**
 * Check QuickBooks connection status using the global token.
 * @returns Promise<{ connected: boolean }>
 */
export async function getQuickBooksStatus(): Promise<{ connected: boolean }> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const res = await fetch(`${API_BASE}/quickbooks/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    credentials: 'include'
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to check QuickBooks status: ${err}`);
  }

  return res.json();
}

/**
 * Force a refresh of the QuickBooks token.
 * @returns Promise<{ connected: boolean }>
 */
export async function refreshQuickBooksToken(): Promise<{ connected: boolean }> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const res = await fetch(`${API_BASE}/quickbooks/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    credentials: 'include'
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to refresh QuickBooks token: ${err}`);
  }

  return res.json();
} 