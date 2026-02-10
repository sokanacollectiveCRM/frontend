import { get, put } from '../http';
import { API_CONFIG } from '../config';
import { ApiError } from '../errors';
import { extractClientList, mapClient, mapClientDetail } from '../mappers/client.mapper';
import type { ClientListItemDTO, ClientDetailDTO } from '../dto/client.dto';
import type { Client, ClientDetail } from '@/domain/client';

/**
 * Normalize API response to an array of client list DTOs.
 * Handles production responses that may return { clients: [] } or non-array data.
 */
function normalizeClientListResponse(raw: unknown): ClientListItemDTO[] {
  if (Array.isArray(raw)) return raw as ClientListItemDTO[];
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.clients)) return obj.clients as ClientListItemDTO[];
    if (Array.isArray(obj.data)) return obj.data as ClientListItemDTO[];
  }
  return [];
}

/**
 * Fetch all clients.
 *
 * - Legacy mode: get<unknown>() + extractClientList + map
 * - Canonical mode: get<ClientListItemDTO[]>() (already unwrapped) + map
 */
export async function fetchClients(): Promise<Client[]> {
  if (API_CONFIG.useLegacyApi) {
    // Legacy: response shape is unknown, extractor handles format detection
    const response = await get<unknown>('/clients');
    const dtos = extractClientList(response);
    return dtos.map(mapClient);
  } else {
    // Canonical: unwrap may return array or object; normalize so .map never throws
    const raw = await get<ClientListItemDTO[] | Record<string, unknown>>('/clients');
    const dtos = normalizeClientListResponse(raw);
    return dtos.map(mapClient);
  }
}

/**
 * Fetch a single client by ID.
 *
 * Canonical mode only - throws if legacy mode is enabled.
 * Backend returns { success: true, data: { id, first_name, last_name, email, phone_number, ... } };
 * get() returns apiResponse.data (the inner object). Defensive unwrap in case response is ever wrapped.
 */
export async function fetchClientById(id: string): Promise<ClientDetail> {
  if (API_CONFIG.useLegacyApi) {
    throw new Error('Legacy mode disabled. Set VITE_USE_LEGACY_API=false.');
  }

  const response = await get<ClientDetailDTO | { data?: ClientDetailDTO }>(`/clients/${id}`);

  const dto: ClientDetailDTO =
    response &&
    typeof response === 'object' &&
    'data' in response &&
    response.data != null &&
    typeof response.data === 'object'
      ? response.data
      : (response as ClientDetailDTO);

  return mapClientDetail(dto);
}

/**
 * Update a client's status.
 *
 * Canonical mode only - throws if legacy mode is enabled.
 */
export async function updateClientStatus(clientId: string, status: string): Promise<ClientDetail> {
  if (API_CONFIG.useLegacyApi) {
    throw new Error('Legacy mode disabled. Set VITE_USE_LEGACY_API=false.');
  }

  const dto = await put<ClientDetailDTO, { clientId: string; status: string }>(
    '/clients/status',
    { clientId, status }
  );
  return mapClientDetail(dto);
}

/**
 * PHI (Protected Health Information) update payload.
 * Only these fields are accepted by PUT /clients/:id/phi endpoint.
 */
export interface PhiUpdatePayload {
  // Identity
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;

  // Dates
  date_of_birth?: string;
  due_date?: string;

  // Address
  address_line1?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;

  // Clinical
  health_history?: string;
  health_notes?: string;
  allergies?: string;
  medications?: string;
}

/**
 * Response from PHI update endpoint.
 */
export interface PhiUpdateResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
  code?: string;
}

/**
 * Update a client's PHI fields (stored in Google Cloud SQL).
 *
 * This endpoint ONLY accepts PHI fields and will reject operational fields like status or service_needed.
 * Authorization: Admin or assigned doula only.
 *
 * @param clientId - Client UUID
 * @param phiData - PHI fields to update (only PHI fields allowed)
 * @returns Promise with success/error response
 * @throws ApiError if update fails or non-PHI fields are included
 */
export async function updateClientPhi(
  clientId: string,
  phiData: PhiUpdatePayload
): Promise<PhiUpdateResponse> {
  if (API_CONFIG.useLegacyApi) {
    throw new Error('Legacy mode disabled. Set VITE_USE_LEGACY_API=false.');
  }

  try {
    const response = await put<PhiUpdateResponse>(`/clients/${clientId}/phi`, phiData);
    return response;
  } catch (error: unknown) {
    let message = 'Failed to update PHI fields';
    if (error instanceof ApiError) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      error: message,
    };
  }
}
