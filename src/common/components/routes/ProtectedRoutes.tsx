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
  const { user, isLoading } = useUser();
  const { client, isLoading: isClientLoading } = useClientAuth();
  const location = useLocation();

  if ((isLoading || isClientLoading) && !user && !client) {
    return <SessionLoading />;
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

  if (isBillingOnlyRole(user?.role)) {
    return <Navigate to={getBillingHomePath()} replace />;
  }

  return <Outlet />;
}
