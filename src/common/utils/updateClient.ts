import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from './sessionUtils';
import { PHI_BROKER_FIELD_KEYS } from '@/config/clientFieldRouting';
import { normalizeZipCode } from './zipCode';
import { apiBaseUrl } from '@/config/env';
import { fetchWithAuth } from '@/api/http';
import { logFailure, logHttpFailure } from '@/utils/safeLog';

/**
 * Columns that cannot be updated via PUT /clients/:id to Supabase client_info table.
 * Stripping these from the payload avoids "Could not find the 'X' column in the schema cache" errors.
 *
 * Includes:
 * - PHI fields (stored in Google Cloud via separate API, not Supabase client_info)
 * - Form fields not yet in client_info schema
 *
 * Operational fields (status, firstname, lastname, service_needed, etc.) ARE in client_info.
 */
const UNSUPPORTED_CLIENT_INFO_COLUMNS = new Set([
  // PHI broker fields (PUT /clients/:id/phi) — not Supabase client_info
  ...PHI_BROKER_FIELD_KEYS,

  // Additional form fields not yet in schema
  'family_pronouns',
]);

function stripUnsupportedColumns(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!UNSUPPORTED_CLIENT_INFO_COLUMNS.has(key)) {
      out[key] = value;
    }
  }
  return out;
}

export default async function updateClient(
  clientId: string,
  updateData: any
): Promise<{ success: boolean; client?: any; error?: string }> {

  const payload = stripUnsupportedColumns(
    typeof updateData === 'object' && updateData !== null ? updateData : {}
  );

  if (Object.prototype.hasOwnProperty.call(payload, 'zip_code')) {
    payload.zip_code = normalizeZipCode(payload.zip_code);
  }

  try {
    const response = await fetchWithAuth(`${apiBaseUrl}/clients/${clientId}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logHttpFailure('client-api', 'update_client', response.status);

      // Check if this is the "No data returned after update" error
      if (errorText.includes('No data returned after update')) {
        return { success: true, client: { id: clientId, ...payload } };
      }

      // Check for authentication/session expiration errors
      if (isSessionExpiredError(response.status, errorText)) {
        throw new Error(getSessionExpirationMessage());
      }

      throw new Error(`Failed to update client (${response.status})`);
    }

    const result = await response.json();
    return { success: true, client: result.client };
  } catch (err) {
    logFailure('client-api', 'update_client');
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
