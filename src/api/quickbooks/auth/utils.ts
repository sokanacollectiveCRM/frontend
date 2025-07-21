import { refreshQuickBooksToken } from './qbo';

/**
 * Wrapper for QuickBooks API calls that handles token refresh.
 * If a call fails due to token expiration, it will attempt to refresh the token and retry once.
 */
export async function withTokenRefresh<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    // First attempt
    return await apiCall();
  } catch (error: any) {
    // Check if error is due to token expiration (401 or specific error message)
    if (
      error.message?.includes('token expired') ||
      error.message?.includes('unauthorized')
    ) {
      try {
        // Try to refresh the token
        const { connected } = await refreshQuickBooksToken();
        if (!connected) {
          throw new Error('Failed to refresh QuickBooks token');
        }

        // Retry the API call after token refresh
        return await apiCall();
      } catch (refreshError: any) {
        throw new Error(`Token refresh failed: ${refreshError.message}`);
      }
    }

    // If error is not token-related, rethrow
    throw error;
  }
}
