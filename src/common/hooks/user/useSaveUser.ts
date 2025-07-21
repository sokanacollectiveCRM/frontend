import { User } from '@/common/utils/User';

export default async function useSaveUser(userData: User) {
  console.assert(
    userData.id !== undefined,
    `in useSaveUser, no userData.id provided. the userData is ${JSON.stringify(userData)}`
  );
  try {
    const token = localStorage.getItem('authToken');
    const baseUrl = 'http://localhost:5050'; // Base URL for development
    const response = await fetch(
      `${baseUrl}/users/update`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save user');
    }
    return await response.json();
  } catch (error) {
    console.error("Error: couldn't save user", error);
    throw error;
  }
}
