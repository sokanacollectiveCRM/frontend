import { User } from "../utils/User";

export default async function useWorkLog(id: string) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/users/${id}/hours`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'application/json',
        },
      }
    );

    if(!response.ok) {
      throw new Error("Failed to save user");
    }

    return await response.json();
  } catch(error) {
    console.error("Error: couldn't save user", error);
    throw(error);
  }
}