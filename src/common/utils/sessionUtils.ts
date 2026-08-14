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

/**
 * Handles session expiration by clearing auth token and redirecting to login
 */
export function handleSessionExpiration(): void {
  // Clear the auth token

  // Redirect to login page
  window.location.href = '/login';
}

/**
 * Creates a user-friendly session expiration error message
 */
export function getSessionExpirationMessage(): string {
  return 'Your session has expired. Please log in again to continue.';
}
