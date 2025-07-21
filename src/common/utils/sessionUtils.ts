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
  return (
    status === 401 ||
    status === 403 ||
    errorText.toLowerCase().includes('unauthorized') ||
    errorText.toLowerCase().includes('not authenticated') ||
    errorText.toLowerCase().includes('token expired') ||
    errorText.toLowerCase().includes('session expired')
  );
}

/**
 * Handles session expiration by clearing auth token and redirecting to login
 */
export function handleSessionExpiration(): void {
  // Clear the auth token
  localStorage.removeItem('authToken');

  // Redirect to login page
  window.location.href = '/login';
}

/**
 * Creates a user-friendly session expiration error message
 */
export function getSessionExpirationMessage(): string {
  return 'Your session has expired. Please log in again to continue.';
}
