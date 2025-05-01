export default async function updateClientStatus(clientId: string, status: string): Promise<void> {
  
  try {
    const token = localStorage.getItem('authToken');
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
      throw new Error('Failed to save status for client');
    }

    return await response.json();
  }
  catch (err) {
    console.error("Error: couldn't update client status", err);
    throw err;
  }

}