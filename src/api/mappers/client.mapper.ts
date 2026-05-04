import { API_CONFIG } from '../config';
import type { ClientListItemDTO, ClientDetailDTO } from '../dto/client.dto';
import type { Client, ClientDetail, ClientStatus } from '@/domain/client';

/**
 * Extract client list from legacy response formats.
 * LEGACY MODE ONLY - throws in canonical mode.
 *
 * Supports only:
 * - Raw array: []
 * - Wrapped: { data: [] }
 * - Wrapped: { clients: [] }
 */
export function extractClientList(response: unknown): ClientListItemDTO[] {
  if (!API_CONFIG.useLegacyApi) {
    throw new Error(
      'extractClientList is deprecated in canonical mode. Response should use ApiResponse wrapper.'
    );
  }

  // Raw array
  if (Array.isArray(response)) {
    return response as ClientListItemDTO[];
  }

  // Object with data or clients property
  if (typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;

    if ('data' in obj && Array.isArray(obj.data)) {
      return obj.data as ClientListItemDTO[];
    }

    if ('clients' in obj && Array.isArray(obj.clients)) {
      return obj.clients as ClientListItemDTO[];
    }
  }

  throw new Error(
    `extractClientList: Unsupported response format. Expected array, {data:[]}, or {clients:[]}.`
  );
}

/**
 * Map a client DTO to domain Client.
 * Handles both legacy (nested user) and canonical (flat) formats.
 */
export function mapClient(dto: ClientListItemDTO): Client {
  // In legacy mode, the user object may be nested
  const user = dto.user;

  // Extract fields from nested user or flat DTO
  const firstname =
    user?.firstname ||
    user?.firstName ||
    dto.firstname ||
    dto.first_name ||
    '';

  const lastname =
    user?.lastname ||
    user?.lastName ||
    dto.lastname ||
    dto.last_name ||
    '';

  const email = user?.email || dto.email || '';

  const phoneNumber =
    user?.phone_number ||
    user?.phoneNumber ||
    dto.phone_number ||
    '';

  const rawStatus = dto.status || user?.status || 'lead';
  const status = (rawStatus === 'matching' ? 'matched' : rawStatus) as ClientStatus;

  const serviceNeeded =
    dto.serviceNeeded ||
    dto.service_needed ||
    user?.service_needed ||
    '';

  const requestedAtRaw =
    dto.requestedAt || dto.requested_at;
  const requestedAt = requestedAtRaw ? new Date(requestedAtRaw) : new Date();

  const updatedAtRaw = dto.updatedAt || dto.updated_at;
  const updatedAt = updatedAtRaw ? new Date(updatedAtRaw) : new Date();

  const profilePicture =
    user?.profile_picture ?? dto.profile_picture ?? null;

  return {
    id: dto.id,
    clientNumber: dto.client_number,
    email,
    firstname,
    lastname,
    phoneNumber,
    status,
    serviceNeeded,
    requestedAt,
    updatedAt,
    profilePicture,
    // Portal eligibility
    portalStatus: dto.portal_status || user?.portal_status,
    isEligible: dto.is_eligible ?? user?.is_eligible,
    contractStatus: dto.contract_status || user?.contract_status,
    hasSignedContract: dto.has_signed_contract ?? user?.has_signed_contract,
    paymentStatus: dto.payment_status || user?.payment_status,
    hasCompletedPayment: dto.has_completed_payment ?? user?.has_completed_payment,
  };
}

/**
 * Map a ClientDetailDTO to domain ClientDetail.
 * Canonical mode only - no legacy format handling.
 * PHI fields are mapped only if present (undefined if omitted).
 */
export function mapClientDetail(dto: ClientDetailDTO): ClientDetail {
  return {
    id: dto.id,
    clientNumber: dto.client_number,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    phoneNumber: dto.phone_number,
    status: ((dto.status || 'lead') === 'matching' ? 'matched' : (dto.status || 'lead')) as ClientStatus,
    serviceNeeded: dto.service_needed,
    portalStatus: dto.portal_status,
    invitedAt: dto.invited_at,
    lastInviteSentAt: dto.last_invite_sent_at,
    inviteSentCount: dto.invite_sent_count,
    requestedAt: dto.requested_at,
    updatedAt: dto.updated_at,
    isEligible: dto.is_eligible,
    // PHI fields - pass through only if present, keep undefined if omitted
    dueDate: dto.due_date,
    healthHistory: dto.health_history,
    healthNotes: dto.health_notes,
    birthOutcomes: dto.birth_outcomes,
    birthOutcomesInduction: dto.birth_outcomes_induction,
    birthOutcomesDeliveryType: dto.birth_outcomes_delivery_type,
    birthOutcomesMedicationsUsed: dto.birth_outcomes_medications_used,
    allergies: dto.allergies,
    medications: dto.medications,
    dateOfBirth: dto.date_of_birth,
    addressLine1: dto.address_line1,
    pregnancyNumber: dto.pregnancy_number,
    hadPreviousPregnancies: dto.had_previous_pregnancies,
    previousPregnanciesCount: dto.previous_pregnancies_count,
    livingChildrenCount: dto.living_children_count,
    pastPregnancyExperience: dto.past_pregnancy_experience,
    babySex: dto.baby_sex,
    babyName: dto.baby_name,
    numberOfBabies: dto.number_of_babies,
    raceEthnicity: dto.race_ethnicity,
    clientAgeRange: dto.client_age_range,
    annualIncome: dto.annual_income,
    insurance: dto.insurance,
    paymentMethod: dto.payment_method,
    paymentAuthorizationStatus: dto.payment_authorization_status,
    authorizedAt: dto.authorized_at,
    insuranceProvider: dto.insurance_provider,
    insuranceMemberId: dto.insurance_member_id,
    policyNumber: dto.policy_number,
    insurancePhoneNumber: dto.insurance_phone_number,
    hasSecondaryInsurance: dto.has_secondary_insurance,
    secondaryInsuranceProvider: dto.secondary_insurance_provider,
    secondaryInsuranceMemberId: dto.secondary_insurance_member_id,
    secondaryPolicyNumber: dto.secondary_policy_number,
    selfPayCardInfo: dto.self_pay_card_info,
  };
}
