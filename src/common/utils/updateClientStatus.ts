import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from './sessionUtils';
import { syncQuickBooksCustomerFromClient } from './syncQuickBooksCustomer';

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
    console.error("❌ Couldn't save client status: ", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
