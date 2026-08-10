import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from './sessionUtils';
import { apiBaseUrl } from '@/config/env';
import { fetchWithAuth } from '@/api/http';

export default async function deleteClient(
  clientId: string
): Promise<{ success: boolean; error?: string }> {

  // Debug logging
  console.log('🚨 DEBUG START - Client Delete');
  console.log('🚨 Client ID:', clientId);
  console.log('🚨 Client ID type:', typeof clientId);
  console.log(
    '🚨 Full request URL:',
    `${apiBaseUrl}/clients/delete`
  );

  try {
    const url = `${apiBaseUrl}/clients/delete`;
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
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
