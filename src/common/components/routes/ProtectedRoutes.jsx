import React from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import { useUser } from 'common/contexts/UserContext';

export function PrivateRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to='/login' replace />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return !user ? <Outlet /> : <Navigate to='/' replace />;
}
