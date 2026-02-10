import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from './sessionUtils';
import { PHI_KEYS } from '@/config/phi';

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
  // PHI fields (stored in Google Cloud, not Supabase client_info) - imported from config/phi.ts
  ...PHI_KEYS,

  // Additional form fields not yet in schema
  'pronouns',
  'family_pronouns',
  'payment_method',
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

  // Debug logging
  console.log('🚨 DEBUG START - Client Update');
  console.log('🚨 Client ID:', clientId);
  console.log('🚨 Update Data:', payload);
  console.log(
    '🚨 Full request URL:',
    `${import.meta.env.VITE_APP_BACKEND_URL}/clients/${clientId}`
  );

  try {
    const baseUrl =
      import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';
    const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    const response = await fetch(`${cleanBaseUrl}/clients/${clientId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Client update failed:', response.status, errorText);

      // Check if this is the "No data returned after update" error
      if (errorText.includes('No data returned after update')) {
        console.log(
          '⚠️ Backend update succeeded but no data returned - treating as success'
        );
        return { success: true, client: { id: clientId, ...payload } };
      }

      // Check for authentication/session expiration errors
      if (isSessionExpiredError(response.status, errorText)) {
        throw new Error(getSessionExpirationMessage());
      }

      throw new Error(
        `Failed to update client: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log('✅ Client updated successfully:', result);
    return { success: true, client: result.client };
  } catch (err) {
    console.error("❌ Couldn't update client: ", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
