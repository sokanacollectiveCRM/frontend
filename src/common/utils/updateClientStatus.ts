import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from './sessionUtils';

export default async function updateClientStatus(
  clientId: string,
  status: string
): Promise<{ success: boolean; client?: any; error?: string }> {

  // Debug logging - FORCE VISIBLE
  console.log('🚨 DEBUG START - Status Update');
  console.log('🚨 Client ID:', clientId);
  console.log('🚨 New Status:', status);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_URL}/clients/status`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          clientId: clientId,
          status: status,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Status update failed:', response.status, errorText);

      // Check for authentication/session expiration errors
      if (isSessionExpiredError(response.status, errorText)) {
        throw new Error(getSessionExpirationMessage());
      }

      throw new Error(
        `Failed to save status for client: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log('✅ Status updated successfully:', result);
    return { success: true, client: result.client };
  } catch (err) {
    console.error("❌ Couldn't save client status: ", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
