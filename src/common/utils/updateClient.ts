import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from './sessionUtils';

export default async function updateClient(
  clientId: string,
  updateData: any
): Promise<{ success: boolean; client?: any; error?: string }> {

  // Debug logging
  console.log('🚨 DEBUG START - Client Update');
  console.log('🚨 Client ID:', clientId);
  console.log('🚨 Client ID type:', typeof clientId);
  console.log('🚨 Update Data:', updateData);
  console.log('🚨 Update Data keys:', Object.keys(updateData));
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
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Client update failed:', response.status, errorText);

      // Check if this is the "No data returned after update" error
      if (errorText.includes('No data returned after update')) {
        console.log(
          '⚠️ Backend update succeeded but no data returned - treating as success'
        );
        return { success: true, client: { id: clientId, ...updateData } };
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
