/**
 * Domain type for Client - used by UI components.
 * Field names are camelCase (frontend convention).
 */

export type ClientStatus =
  | 'lead'
  | 'contacted'
  | 'matching'
  | 'interviewing'
  | 'follow up'
  | 'contract'
  | 'active'
  | 'complete'
  | 'customer';

export const CLIENT_STATUSES: ClientStatus[] = [
  'lead',
  'contacted',
  'matching',
  'interviewing',
  'follow up',
  'contract',
  'active',
  'complete',
  'customer',
];

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  matching: 'Matching',
  interviewing: 'Interviewing',
  'follow up': 'Follow Up',
  contract: 'Contract',
  active: 'Active',
  complete: 'Complete',
  customer: 'Customer',
};

/**
 * Client lite: non-PHI list view type for GET /clients.
 * Backend must not return PHI in list; use this type for list table data.
 */
export interface ClientLite {
  id: string;
  firstname: string;
  lastname: string;
  status: ClientStatus;
  serviceNeeded: string;
  requestedAt: Date;
  updatedAt: Date;
  profilePicture: string | null;
  portalStatus?: string;
  isEligible?: boolean;
  contractStatus?: string;
  hasSignedContract?: boolean;
  paymentStatus?: string;
  hasCompletedPayment?: boolean;
}

/**
 * Client domain type for list views (extends ClientLite; may include display-only non-PHI).
 * PHI (phone, email, address, etc.) must not be shown in list—only in detail when authorized.
 */
export interface Client extends ClientLite {
  email: string;
  phoneNumber: string;
}

/**
 * Client detail domain type for detail views.
 * Contains fields returned by GET /clients/:id.
 */
export interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  status: ClientStatus;
  serviceNeeded?: string;
  portalStatus?: string;
  invitedAt?: string;
  lastInviteSentAt?: string;
  inviteSentCount?: number;
  requestedAt?: string;
  updatedAt?: string;
  isEligible?: boolean;
  // PHI fields - optional, only present when authorized
  dueDate?: string;
  healthHistory?: string;
  healthNotes?: string;
  allergies?: string;
  medications?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  pregnancyNumber?: number;
  hadPreviousPregnancies?: boolean;
  previousPregnanciesCount?: number;
  livingChildrenCount?: number;
  pastPregnancyExperience?: string;
  babySex?: string;
  babyName?: string;
  numberOfBabies?: number;
  raceEthnicity?: string;
  clientAgeRange?: string;
  annualIncome?: string;
  insurance?: string;
}
