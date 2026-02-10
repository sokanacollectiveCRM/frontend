import { get, put } from '../http';
import { API_CONFIG } from '../config';
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
