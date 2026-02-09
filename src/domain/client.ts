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
 * Client domain type for list views.
 * Contains only fields needed by the clients list UI.
 */
export interface Client {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  status: ClientStatus;
  serviceNeeded: string;
  requestedAt: Date;
  updatedAt: Date;
  profilePicture: string | null;
  // Portal eligibility fields
  portalStatus?: string;
  isEligible?: boolean;
  contractStatus?: string;
  hasSignedContract?: boolean;
  paymentStatus?: string;
  hasCompletedPayment?: boolean;
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
