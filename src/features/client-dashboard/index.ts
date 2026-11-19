export { default as ClientDashboard } from './ClientDashboard';
export { useIsClientPortalUser } from './application/useIsClientPortalUser';

export type {
  BillingPath,
  ClientEligibilityFields,
  PortalAllowedActions,
  PortalBlocker,
  PrimaryPortalAction,
  ReadinessGateSummary,
} from './domain/portalEligibility';
export {
  canInviteToPortal,
  formatYesNo,
  getBillingPathLabel,
  getMissingCardPortalTooltip,
  getPortalBlockerDescription,
  getPortalBlockerLabel,
  getPrimaryPortalAction,
  getReadinessGateSummary,
  normalizeClientEligibility,
  readIsEligible,
} from './domain/portalEligibility';
