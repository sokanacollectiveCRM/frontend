
import { Navigate, Outlet } from 'react-router-dom';

import { useUser } from '@/common/hooks/user/useUser';

export function PrivateRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Outlet />;
  }

  return user ? <Outlet /> : <Navigate to='/login' replace />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Outlet />;
  }

  return !user ? <Outlet /> : <Navigate to='/' replace />;
}
