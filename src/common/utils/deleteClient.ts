import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from './sessionUtils';

export default async function deleteClient(
  clientId: string
): Promise<{ success: boolean; error?: string }> {

  // Debug logging
  console.log('🚨 DEBUG START - Client Delete');
  console.log('🚨 Client ID:', clientId);
  console.log('🚨 Client ID type:', typeof clientId);
  console.log(
    '🚨 Full request URL:',
    `${import.meta.env.VITE_APP_BACKEND_URL}/clients/delete`
  );

  try {
    const baseUrl =
      import.meta.env.VITE_APP_BACKEND_URL || '';
    const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    const url = `${cleanBaseUrl}/clients/delete`;
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: clientId }),
    });

    if (response.status === 204 || response.ok) {
      // Success: No Content or OK
      console.log('✅ Client deleted successfully');
      return { success: true };
    }

    // Handle errors
    const errorText = await response.text();
    console.error('❌ Client delete failed:', response.status, errorText);

    // Check for authentication/session expiration errors
    if (isSessionExpiredError(response.status, errorText)) {
      throw new Error(getSessionExpirationMessage());
    }

    throw new Error(
      `Failed to delete client: ${response.status} - ${errorText}`
    );
  } catch (err) {
    console.error("❌ Couldn't delete client: ", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
} 
