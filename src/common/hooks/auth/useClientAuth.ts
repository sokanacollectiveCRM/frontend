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
          error,
        } = await supabase.auth.getSession();

        // If there's an error or no session, set client to null
        if (error || !session?.user) {
          setClient(null);
          setIsLoading(false);
          return;
        }

        const userRole = session.user.user_metadata?.role;
        if (userRole === 'client') {
          setClient({
            id: session.user.id,
            email: session.user.email || '',
            firstname: session.user.user_metadata?.firstname,
            lastname: session.user.user_metadata?.lastname,
            role: 'client',
          });
        } else {
          setClient(null);
        }
      } catch (error) {
        // Silently handle errors - Supabase may not be configured
        console.debug('Error checking client session (this is expected if Supabase is not configured):', error);
        setClient(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkClientSession();

    // Listen for auth state changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userRole = session.user.user_metadata?.role;
          if (userRole === 'client') {
            setClient({
              id: session.user.id,
              email: session.user.email || '',
              firstname: session.user.user_metadata?.firstname,
              lastname: session.user.user_metadata?.lastname,
              role: 'client',
            });
          } else {
            setClient(null);
          }
        } else {
          setClient(null);
        }
        setIsLoading(false);
      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      // Silently handle errors - Supabase may not be configured
      console.debug('Error setting up auth state listener (this is expected if Supabase is not configured):', error);
      return () => {};
    }
  }, []);

  return { client, isLoading, isClient: !!client };
}

