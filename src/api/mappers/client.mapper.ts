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

  const status = (dto.status || user?.status || 'lead') as ClientStatus;

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
 */
export function mapClientDetail(dto: ClientDetailDTO): ClientDetail {
  return {
    id: dto.id,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    phoneNumber: dto.phone_number,
    status: (dto.status || 'lead') as ClientStatus,
    serviceNeeded: dto.service_needed,
    portalStatus: dto.portal_status,
    invitedAt: dto.invited_at,
    lastInviteSentAt: dto.last_invite_sent_at,
    inviteSentCount: dto.invite_sent_count,
    requestedAt: dto.requested_at,
    updatedAt: dto.updated_at,
    isEligible: dto.is_eligible,
  };
}
