import { User } from '@/common/utils/User';
import { logFailure } from '@/utils/safeLog';
import { apiBaseUrl } from '@/config/env';
import { fetchWithAuth } from '@/api/http';

export default async function useSaveUser(userData: User) {
  console.assert(
    userData.id !== undefined,
    `in useSaveUser, no userData.id provided. the userData is ${JSON.stringify(userData)}`
  );
  try {
    const response = await fetchWithAuth(`${apiBaseUrl}/users/update`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to save user');
    }
    return await response.json();
  } catch (error) {
    logFailure('hooks', 'error_couldn_t_save_user');
    throw error;
  }
}
