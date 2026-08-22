import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from './sessionUtils';
import { apiBaseUrl } from '@/config/env';
import { fetchWithAuth } from '@/api/http';
import { logFailure, logHttpFailure } from '@/utils/safeLog';

export default async function deleteClient(
  clientId: string
): Promise<{ success: boolean; error?: string }> {

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
      return { success: true };
    }

    const errorText = await response.text();
    logHttpFailure('client-api', 'delete_client', response.status);

    if (isSessionExpiredError(response.status, errorText)) {
      throw new Error(getSessionExpirationMessage());
    }

    throw new Error(`Failed to delete client (${response.status})`);
  } catch (err) {
    logFailure('client-api', 'delete_client');
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
