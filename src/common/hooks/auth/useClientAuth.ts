import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface ClientUser {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: 'client';
}

/** Staff roles must not use the client dashboard session. */
function isStaffRole(user: User): boolean {
  const r =
    (user.user_metadata?.role as string | undefined) ||
    (user.app_metadata?.role as string | undefined);
  return r === 'admin' || r === 'doula';
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
          if (isStaffRole(session.user)) {
            setClient(null);
          } else {
            setClient({
              id: session.user.id,
              email: session.user.email || '',
              firstname: session.user.user_metadata?.firstname,
              lastname: session.user.user_metadata?.lastname,
              role: 'client',
            });
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
        if (isStaffRole(session.user)) {
          setClient(null);
        } else {
          setClient({
            id: session.user.id,
            email: session.user.email || '',
            firstname: session.user.user_metadata?.firstname,
            lastname: session.user.user_metadata?.lastname,
            role: 'client',
          });
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

