import { useEffect, useState } from 'react';

export default function useWorkLog(userId?: string) {
  const [hours, setHours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    async function fetchWorkLog() {
      try {

        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/users/${userId}/hours`,
          {
            headers: {
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching work logs: ${response.status}`);
        }

        const data = await response.json();
        setHours(data);
      } catch (error) {
        console.error('Error fetching work logs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkLog();
  }, [userId]);

  return { hours, isLoading };
}
