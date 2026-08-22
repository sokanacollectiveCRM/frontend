import { useEffect, useState } from 'react';
import { logFailure } from '@/utils/safeLog';
import { fetchWithAuth, buildUrl } from '@/api/http';

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

        const response = await fetchWithAuth(
          buildUrl(`/users/${userId}`),
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        logFailure('hooks', 'error_fetching_user');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  return { user, isLoading, error };
}
