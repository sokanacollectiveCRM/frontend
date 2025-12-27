export interface ClientNote {
  id: string;
  clientId: string;
  type: string;
  description: string;
  metadata?: {
    category?: string;
    priority?: string;
    [key: string]: any;
  };
  timestamp: string;
  createdBy?: string;
}

export interface CreateNoteRequest {
  type: string;
  description: string;
  metadata?: {
    category?: string;
    priority?: string;
    [key: string]: any;
  };
}

export const getClientNotes = async (clientId: string): Promise<ClientNote[]> => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_URL}/clients/${clientId}/activities`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.status}`);
    }

    const result = await response.json();
    return result.activities || [];
  } catch (err) {
    console.error('Error fetching client notes:', err);
    throw err;
  }
};

export const createClientNote = async (
  clientId: string,
  noteData: CreateNoteRequest
): Promise<ClientNote> => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_URL}/clients/${clientId}/activity`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create note: ${response.status}`);
    }

    const result = await response.json();
    return result.activity;
  } catch (err) {
    console.error('Error creating client note:', err);
    throw err;
  }
};






