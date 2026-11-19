/**
 * Utility functions for handling session expiration
 */

/**
 * Checks if an error response indicates session expiration
 */
export function isSessionExpiredError(
  status: number,
  errorText: string
): boolean {
  // 403 is authorization failure (logged in, not allowed) — not session expiry.
  if (status === 403) return false;
  if (status === 401) return true;
  const text = errorText.toLowerCase();
  return (
    text.includes('not authenticated') ||
    text.includes('token expired') ||
    text.includes('session expired')
  );
}

const PUBLIC_PREFIXES = [
  '/login',
  '/signup',
  '/accept-invite',
  '/auth/',
  '/request',
  '/signing',
];

let sessionRedirectStarted = false;

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
}

/**
 * Leaves the current CRM page and opens the login screen.
 * Public auth pages stay put so a failed login does not reload itself.
 */
export function handleSessionExpiration(): void {
  if (typeof window === 'undefined' || sessionRedirectStarted) return;
  if (isPublicPath(window.location.pathname)) return;
  sessionRedirectStarted = true;
  try {
    window.location.assign('/login');
  } catch {
    window.location.href = '/login';
  }
}

/**
 * Creates a user-friendly session expiration error message
 */
export function getSessionExpirationMessage(): string {
  return 'Your session has expired. Please log in again to continue.';
}
