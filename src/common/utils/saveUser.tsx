import { fetchWithAuth, buildUrl } from '@/api/http';
import { logFailure } from '@/utils/safeLog';

export default async function saveUser(userData: FormData) {
  try {
    const response = await fetchWithAuth(buildUrl('/users/update'), {
        method: 'PUT',
        headers: {
        },
        body: userData,
      });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      throw new Error(
        errorBody?.error || errorBody?.message || 'Failed to save user'
      );
    }
    return await response.json();
  } catch (error) {
    logFailure('client-api', 'error_couldn_t_save_user');
    throw error;
  }
}
