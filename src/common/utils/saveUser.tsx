import { fetchWithAuth, buildUrl } from '@/api/http';

export default async function saveUser(userData: FormData) {
  try {
    const response = await fetchWithAuth(buildUrl('/users/update'), {
        method: 'PUT',
        headers: {
        },
        body: userData,
      });

    if (!response.ok) {
      throw new Error('Failed to save user');
    }
    return await response.json();
  } catch (error) {
    console.error("Error: couldn't save user", error);
    throw error;
  }
}
