import { isStaffRole } from '@/common/auth/roles';
import { useUser } from '@/common/hooks/user/useUser';

interface ClientUser {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: 'client';
}

/**
 * Client portal identity from `/auth/me`.
 * Staff vs client is decided by `user.role`.
 */
export function useClientAuth() {
  const { user, isLoading } = useUser();
  const client: ClientUser | null =
    !isLoading && user && !isStaffRole(user.role)
      ? {
          id: String(user.id),
          email: user.email || '',
          firstname: user.firstname || undefined,
          lastname: user.lastname || undefined,
          role: 'client',
        }
      : null;

  return { client, isLoading, isClient: !!client };
}
