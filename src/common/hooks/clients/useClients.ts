import { User } from '@/common/types/user';
import { useState } from 'react';

export function useClients() {
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getClients = async (): Promise<User[]> => {
    const token = localStorage.getItem('authToken');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}clients`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Could not grab clients');

      const data = await response.json();
      setClients(data as User[]);
      return data as User[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error grabbing clients';
      console.error(message);
      setError(message);
      setClients([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    isLoading,
    error,
    getClients,
  };
}