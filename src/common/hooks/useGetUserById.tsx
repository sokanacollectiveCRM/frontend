// src/hooks/useUserData.ts
import { useState, useEffect } from 'react';
import supabase

interface User {
  id: string;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  role: 'admin' | 'doula' | 'client';
  // Add any other user fields you have
}

export function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current session for the token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        // Make the API call to your backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  return { user, isLoading, error };
}