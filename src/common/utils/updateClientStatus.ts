import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from './sessionUtils';
import { syncQuickBooksCustomerFromClient } from './syncQuickBooksCustomer';
import { logFailure, logHttpFailure } from '@/utils/safeLog';
import { fetchWithAuth, buildUrl } from '@/api/http';

type QuickBooksSyncSource = {
  id?: string;
  firstName?: string;
  first_name?: string;
  firstname?: string;
  lastName?: string;
  last_name?: string;
  lastname?: string;
  email?: string;
};

export default async function updateClientStatus(
  clientId: string,
  status: string,
  quickBooksSource?: QuickBooksSyncSource
): Promise<{ success: boolean; client?: any; error?: string }> {

  try {
    const response = await fetchWithAuth(buildUrl('/clients/status'), {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          clientId: clientId,
          status: status,
        }),
      });

    if (!response.ok) {
      const errorText = await response.text();
      logHttpFailure('client-api', 'status_update_failed', response.status);

      if (isSessionExpiredError(response.status, errorText)) {
        throw new Error(getSessionExpirationMessage());
      }

      throw new Error(
        `Failed to save status for client: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();

    if (status === 'matched') {
      const syncSource =
        quickBooksSource ||
        (result?.data && typeof result.data === 'object'
          ? (result.data as QuickBooksSyncSource)
          : undefined);

      const syncResult = await syncQuickBooksCustomerFromClient({
        ...syncSource,
        id: syncSource?.id ?? clientId,
        status: 'matched',
      });

      if (!syncResult.success && syncResult.error) {
        console.warn('QuickBooks customer sync skipped or failed:', syncResult.error);
      }
    }

    return { success: true, client: result.client ?? result.data };
  } catch (err) {
    logFailure('client-api', 'couldn_t_save_client_status');
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
