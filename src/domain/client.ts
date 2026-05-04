/**
 * Domain type for Client - used by UI components.
 * Field names are camelCase (frontend convention).
 */

export type ClientStatus =
  | 'lead'
  | 'contacted'
  | 'matched'
  | 'interviewing'
  | 'follow up'
  | 'contract'
  | 'active'
  | 'complete'
  | 'not hired';

export const CLIENT_STATUSES: ClientStatus[] = [
  'lead',
  'contacted',
  'matched',
  'interviewing',
  'follow up',
  'contract',
  'active',
  'complete',
  'not hired',
];

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  matched: 'Matched',
  interviewing: 'Interviewed',
  'follow up': 'Follow Up',
  contract: 'Contract',
  active: 'Active',
  complete: 'Complete',
  'not hired': 'Not Hired',
};

/**
 * Client lite: non-PHI list view type for GET /clients.
 * Backend must not return PHI in list; use this type for list table data.
 */
export interface ClientLite {
  id: string;
  clientNumber?: string;
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
  clientNumber?: string;
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
  /** Doula narrative: delivery type, complications, interventions, birth weight, etc. */
  birthOutcomes?: string;
  /** Structured birth outcomes: was labor induced? */
  birthOutcomesInduction?: boolean;
  /** Structured delivery type (reportable enum). */
  birthOutcomesDeliveryType?: string;
  /** Structured medications used during birth (reportable multi-select). */
  birthOutcomesMedicationsUsed?: string[];
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
  paymentMethod?: string;
  /**
   * Derived authorization status for payment collection.
   * - not_required: Medicaid clients (no card needed)
   * - required: Insurance / Self-Pay clients who have not yet added a card
   * - on_file: Insurance / Self-Pay clients with a tokenized card on file
   * - failed: Authorization was attempted but failed
   */
  paymentAuthorizationStatus?: string;
  authorizedAt?: string;
  insuranceProvider?: string;
  insuranceMemberId?: string;
  policyNumber?: string;
  insurancePhoneNumber?: string;
  hasSecondaryInsurance?: boolean;
  secondaryInsuranceProvider?: string;
  secondaryInsuranceMemberId?: string;
  secondaryPolicyNumber?: string;
  selfPayCardInfo?: string;
}
