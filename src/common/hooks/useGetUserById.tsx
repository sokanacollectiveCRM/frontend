import { useEffect, useState } from 'react';

export default function useUserData(userId: string) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const { user: currentUser } = useUser();

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    async function fetchUser() {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('authToken');
        
      if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  return { user, isLoading, error };
}