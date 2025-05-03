export default async function updateClientStatus(id: string, status: string): Promise<void> {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/clients/status`, 
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          { 
            clientId: id,
            status
          })
      })

    if (!response.ok) {
      throw new Error('Failed to update client status');
    }

    return await response.json()
  }
  catch (err) {
    console.error('Couldn\'t save client status: ', err);
  }

}