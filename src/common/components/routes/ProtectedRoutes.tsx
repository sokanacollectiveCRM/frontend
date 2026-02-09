import { Navigate, Outlet } from 'react-router-dom';

import { useUser } from '@/common/hooks/user/useUser';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';

export function PrivateRoute() {
  const { user, isLoading } = useUser();
  const { client, isLoading: isClientLoading } = useClientAuth();

  // Allow access if either backend user (admin/doula) or Supabase client is authenticated
  // Show loading state while checking auth - this prevents redirecting clients who just logged in
  if (isLoading || isClientLoading) {
    return <div className='p-6 text-center'>Loading session…</div>;
  }

  // Allow access if user has backend auth OR client has Supabase auth
  if (user || client) {
    return <Outlet />;
  }

  // Redirect to login if neither backend user nor client is authenticated
  // Note: This redirects to admin login, but clients should use /auth/client-login
  return <Navigate to='/login' replace />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Outlet />;
  }

  return !user ? <Outlet /> : <Navigate to='/' replace />;
}
