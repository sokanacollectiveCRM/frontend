import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ClientUser {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: 'client';
}

/**
 * Hook to detect if the current user is a client logged in via Supabase
 * Returns the client user data if authenticated, null otherwise
 */
export function useClientAuth() {
  const [client, setClient] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkClientSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const userRole = session.user.user_metadata?.role;
          // If role is 'client' OR role is not set (undefined/null), treat as client
          // This allows clients who logged in via Supabase even if role metadata isn't set
          if (!userRole || userRole === 'client') {
            setClient({
              id: session.user.id,
              email: session.user.email || '',
              firstname: session.user.user_metadata?.firstname,
              lastname: session.user.user_metadata?.lastname,
              role: 'client',
            });
          } else {
            // Only set to null if role is explicitly set to something other than 'client'
            setClient(null);
          }
        } else {
          setClient(null);
        }
      } catch (error) {
        console.error('Error checking client session:', error);
        setClient(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkClientSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userRole = session.user.user_metadata?.role;
        // If role is 'client' OR role is not set (undefined/null), treat as client
        if (!userRole || userRole === 'client') {
          setClient({
            id: session.user.id,
            email: session.user.email || '',
            firstname: session.user.user_metadata?.firstname,
            lastname: session.user.user_metadata?.lastname,
            role: 'client',
          });
        } else {
          // Only set to null if role is explicitly set to something other than 'client'
          setClient(null);
        }
      } else {
        setClient(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { client, isLoading, isClient: !!client };
}

