import { useUser } from '@/common/hooks/user/useUser';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';

/**
 * True when this session should see the client portal (not admin/doula CRM).
 * Uses both Supabase session (useClientAuth) and backend /auth/me (user.role) so we
 * never show org metrics if the backend already classified the user as client.
 */
export function useIsClientPortalUser(): {
  isClientPortalUser: boolean;
  isStaffUser: boolean;
  isLoading: boolean;
} {
  const { user, isLoading: userLoading } = useUser();
  const { client, isLoading: clientLoading } = useClientAuth();

  const isStaffUser = user?.role === 'admin' || user?.role === 'doula';
  const isClientPortalUser =
    !isStaffUser && (!!client || user?.role === 'client');

  return {
    isClientPortalUser,
    isStaffUser,
    isLoading: userLoading || clientLoading,
  };
}
