import { Navigate, Outlet } from 'react-router-dom';

import { useUser } from '@/common/hooks/user/useUser';
function requiresInboxVerification(role: string | undefined): boolean {
  const normalized = String(role || '').toLowerCase();
  return normalized === 'doula' || normalized === 'client';
}

export function EmailVerifiedRoute() {
  const { user, isLoading } = useUser();

  if (isLoading && !user) {
    return <div className='p-6 text-center'>Loading session…</div>;
  }

  if (
    user &&
    requiresInboxVerification(user.role) &&
    user.emailVerified !== true
  ) {
    return <Navigate to='/auth/verify-email' replace />;
  }

  return <Outlet />;
}
