export default async function updateClientStatus(clientId: string, status: string): Promise<{ success: boolean; client?: any; error?: string }> {
  const token = localStorage.getItem('authToken');

  // Debug logging - FORCE VISIBLE
  console.log('🚨 DEBUG START - Status Update');
  console.log('🚨 Client ID:', clientId);
  console.log('🚨 New Status:', status);
  console.log('🚨 Auth Token:', token ? 'Present' : 'Missing');
  
  // Decode token to see user info (if it's a JWT)
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token Payload:', payload);
      console.log('User ID from token:', payload.userId || payload.sub || payload.id);
    } catch (e) {
      console.log('Could not decode token payload');
    }
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/clients/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        status: status
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Status update failed:', response.status, errorText);
      throw new Error(`Failed to save status for client: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Status updated successfully:', result);
    return { success: true, client: result.client };
  }
  catch (err) {
    console.error('❌ Couldn\'t save client status: ', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}