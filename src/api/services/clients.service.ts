import { get, put } from '../http';
import { API_CONFIG } from '../config';
import { extractClientList, mapClient, mapClientDetail } from '../mappers/client.mapper';
import type { ClientListItemDTO, ClientDetailDTO } from '../dto/client.dto';
import type { Client, ClientDetail } from '@/domain/client';

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
    // Canonical: http.ts already unwrapped ApiResponse.data as ClientListItemDTO[]
    const dtos = await get<ClientListItemDTO[]>('/clients');
    return dtos.map(mapClient);
  }
}

/**
 * Fetch a single client by ID.
 *
 * Canonical mode only - throws if legacy mode is enabled.
 */
export async function fetchClientById(id: string): Promise<ClientDetail> {
  if (API_CONFIG.useLegacyApi) {
    throw new Error('Legacy mode disabled. Set VITE_USE_LEGACY_API=false.');
  }

  const dto = await get<ClientDetailDTO>(`/clients/${id}`);
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
