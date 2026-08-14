import { isClientRole, isStaffRole } from '@/common/auth/roles';
import { useUser } from '@/common/hooks/user/useUser';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';

/**
 * True when this session should see the client portal (not admin/doula/billing CRM).
 * Staff vs client comes from /auth/me. A Supabase session is a client fallback only
 * when the backend has not classified the user as staff.
 */
export function useIsClientPortalUser(): {
  isClientPortalUser: boolean;
  isStaffUser: boolean;
  isLoading: boolean;
} {
  const { user, isLoading: userLoading } = useUser();
  const { client, isLoading: clientLoading } = useClientAuth();

  const isStaffUser = isStaffRole(user?.role);
  const isClientPortalUser =
    !isStaffUser && (isClientRole(user?.role) || !!client);

  return {
    isClientPortalUser,
    isStaffUser,
    isLoading: userLoading || clientLoading,
  };
}
