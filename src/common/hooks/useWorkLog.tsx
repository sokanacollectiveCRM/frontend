import { useState } from "react";
import { User } from "../utils/User";

export default async function useWorkLog(id: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [hours, setHours] = useState();

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/users/${id}/hours`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if(!response.ok) {
      throw new Error("Failed to save user");
    }

    const hoursResponse = await response.json();
    return { hours, isLoading };
  } catch(error) {
    console.error("Error: couldn't save user", error);
    throw(error);
  }
}