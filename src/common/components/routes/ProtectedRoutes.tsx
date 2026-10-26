import { AccessDenied } from '@/common/components/routes/AccessDenied';
import {
  getBillingHomePath,
  isBillingOnlyRole,
  canAccessBillingPortal,
} from '@/common/auth/roles';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useUser } from '@/common/hooks/user/useUser';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { useIsClientPortalUser } from '@/common/hooks/auth/useIsClientPortalUser';

function SessionLoading() {
  return <div className='p-6 text-center'>Loading session…</div>;
}

export function PrivateRoute() {
  const { user, isLoading, logout } = useUser();
  const { client, isLoading: isClientLoading } = useClientAuth();
  const location = useLocation();

  if ((isLoading || isClientLoading) && !user && !client) {
    return <SessionLoading />;
  }

  if (user?.organizationAccess === 'none')
    return (
      <main className='p-6 space-y-4'>
        <h1 className='text-2xl font-semibold'>
          No active organization membership
        </h1>
        <p>
          Your platform account is still active. An organization must invite you
          before you can access its workspace. Historical documents remain with
          their organization.
        </p>
        <button
          className='rounded border px-4 py-2'
          onClick={() => void logout()}
        >
          Log out
        </button>
      </main>
    );
  if (user?.role === 'hr') {
    if (location.pathname === '/') return <Navigate to='/hr' replace />;
    if (!/^\/hr(?:\/|$)/.test(location.pathname))
      return (
        <AccessDenied description='This account is limited to the HR workspace.' />
      );
  }
  if (user || client) {
    return <Outlet />;
  }

  const next = encodeURIComponent(`${location.pathname}${location.search}`);
  return <Navigate to={`/login?next=${next}`} replace />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Outlet />;
  }

  return !user ? <Outlet /> : <Navigate to='/' replace />;
}

export function NonBillingOnlyRoute() {
  const { user, isLoading } = useUser();
  const { isLoading: isClientLoading } = useClientAuth();

  if ((isLoading || isClientLoading) && !user) {
    return <SessionLoading />;
  }

  if (isBillingOnlyRole(user?.role)) {
    return <Navigate to={getBillingHomePath()} replace />;
  }

  return <Outlet />;
}

export function BillingPortalRoute() {
  const { user, isLoading } = useUser();
  const { isClientPortalUser, isLoading: portalLoading } =
    useIsClientPortalUser();

  if ((isLoading || portalLoading) && !user) {
    return <SessionLoading />;
  }

  if (isClientPortalUser) {
    return (
      <AccessDenied description='This billing workspace is limited to internal staff with billing access.' />
    );
  }

  if (!canAccessBillingPortal(user?.role)) {
    return <AccessDenied />;
  }

  return <Outlet />;
}

/** Client portal pages (/profile, /billing). Staff are denied. */
export function ClientPortalRoute() {
  const { isClientPortalUser, isLoading } = useIsClientPortalUser();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (!isClientPortalUser) {
    return (
      <AccessDenied description='You must be logged in as a client to view this page. Use client portal login.' />
    );
  }

  return <Outlet />;
}

/** CRM screens. Clients are denied; billing-only users are sent to billing home. */
export function StaffCrmRoute() {
  const { user, isLoading } = useUser();
  const { isClientPortalUser, isLoading: portalLoading } =
    useIsClientPortalUser();

  if ((isLoading || portalLoading) && !user) {
    return <SessionLoading />;
  }

  if (isClientPortalUser) {
    return <AccessDenied description='This area is limited to Sokana staff.' />;
  }

  if (user?.role === 'hr')
    return (
      <AccessDenied description='This account is limited to the HR workspace.' />
    );

  if (isBillingOnlyRole(user?.role)) {
    return <Navigate to={getBillingHomePath()} replace />;
  }

  return <Outlet />;
}
