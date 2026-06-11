const BILLING_PORTAL_ROLES = ['billing'] as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'admin';
}

export function isDoulaRole(role: string | null | undefined): boolean {
  return role === 'doula';
}

export function isBillingRole(role: string | null | undefined): boolean {
  return role != null && BILLING_PORTAL_ROLES.includes(role as (typeof BILLING_PORTAL_ROLES)[number]);
}

export function isBillingOnlyRole(role: string | null | undefined): boolean {
  return isBillingRole(role) && !isAdminRole(role) && !isDoulaRole(role);
}

export function canAccessBillingPortal(role: string | null | undefined): boolean {
  return isAdminRole(role) || isBillingRole(role);
}

export function canAccessFullCrm(role: string | null | undefined, isClientPortalUser: boolean): boolean {
  if (isClientPortalUser) return true;
  if (isBillingOnlyRole(role)) return false;
  return true;
}

export function getBillingHomePath(): string {
  return '/billing/contracts';
}
