import type { User, PortalStatus } from '../data/schema';
import { canInviteToPortal, readIsEligible } from '@/lib/portalEligibility';

/**
 * Gets portal status from lead data.
 * portal_status reflects invitation state: 'not_invited', 'invited', 'active', 'disabled'
 */
export function derivePortalStatus(lead: User): PortalStatus {
  const portalStatus = (lead as Record<string, unknown>).portal_status;
  if (portalStatus) {
    const validStatuses: PortalStatus[] = ['not_invited', 'invited', 'active', 'disabled'];
    if (validStatuses.includes(portalStatus as PortalStatus)) {
      return portalStatus as PortalStatus;
    }
  }

  return 'not_invited';
}

/**
 * Whether staff can invite this client to the portal.
 * Uses backend `is_eligible === true` when present; legacy fallback when absent.
 */
export { canInviteToPortal };

/**
 * @deprecated Prefer `canInviteToPortal`. Kept for existing imports.
 */
export function isPortalEligible(lead: User): boolean {
  return canInviteToPortal(lead);
}

/** Whether backend has computed eligibility (vs legacy record). */
export function hasBackendEligibility(lead: User): boolean {
  return readIsEligible(lead) !== undefined;
}
