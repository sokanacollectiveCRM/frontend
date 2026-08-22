import { useEffect, useState } from 'react';
import { logFailure } from '@/utils/safeLog';
import { isStaffRole } from '@/common/auth/roles';
import { useUser } from '@/common/hooks/user/useUser';
import { supabase } from '@/lib/supabase';

interface ClientUser {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: 'client';
}

type SessionIdentity = Omit<ClientUser, 'role'>;

function identityFromSession(
  session: {
    user: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    };
  } | null
): SessionIdentity | null {
  if (!session?.user) return null;
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    email: session.user.email || '',
    firstname: typeof meta.firstname === 'string' ? meta.firstname : undefined,
    lastname: typeof meta.lastname === 'string' ? meta.lastname : undefined,
  };
}

/**
 * Supabase session identity for the client portal.
 * Staff vs client is decided by /auth/me (`user.role`), never by user_metadata.
 */
export function useClientAuth() {
  const { user, isLoading: userLoading } = useUser();
  const [sessionIdentity, setSessionIdentity] =
    useState<SessionIdentity | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const applySession = (
      session: Parameters<typeof identityFromSession>[0]
    ) => {
      setSessionIdentity(identityFromSession(session));
      setSessionLoading(false);
    };

    const checkClientSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        applySession(session);
      } catch (error) {
        logFailure('hooks', 'error_checking_client_session');
        setSessionIdentity(null);
        setSessionLoading(false);
      }
    };

    void checkClientSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isLoading = userLoading || sessionLoading;
  const client =
    !userLoading && !isStaffRole(user?.role) && sessionIdentity
      ? { ...sessionIdentity, role: 'client' as const }
      : null;

  return { client, isLoading, isClient: !!client };
}
