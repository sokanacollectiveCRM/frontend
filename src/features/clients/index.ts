export { default as ClientRoutes } from './ClientRoutes';
export { useClients } from './application/useClients';

export type {
  ClientDetail,
  ClientLite,
  ClientStatus,
} from './domain/client';
export { CLIENT_STATUSES, CLIENT_STATUS_LABELS } from './domain/client';

export type {
  Client,
  PortalStatus,
  User,
  UserStatus,
  UserWithPortal,
} from './data/schema';
export { STATUS_LABELS, USER_STATUSES } from './data/schema';

export { LeadProfileModal } from './components/dialog/LeadProfileModal';
export type { DoulaAssignmentRole } from './infrastructure/doulaAssignments';
