// Admin API service functions
const API_BASE =
  (import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050') + '/api';

export interface MatchingClient {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  serviceNeeded?: string;
  status: string;
  dueDate?: string;
  hospital?: string;
  createdAt: string;
}

export interface MatchAssignmentResponse {
  success: boolean;
  message: string;
  data: {
    assignment: {
      id: string;
      clientId: string;
      doulaId: string;
      assignedAt: string;
      assignedBy: string;
      notes?: string;
      status: string;
    };
    client: {
      id: string;
      name: string;
      status: string;
    };
    doula: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface MatchingClientsResponse {
  success: boolean;
  count: number;
  data: MatchingClient[];
}

/**
 * Get clients in matching phase
 */
export async function getMatchingClients(): Promise<MatchingClientsResponse> {
  const response = await fetch(`${API_BASE}/admin/clients/matching`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Failed to fetch matching clients',
    }));
    throw new Error(error.error || 'Failed to fetch matching clients');
  }

  const data = await response.json();
  // Handle both {success: true, data: [...]} and direct array responses
  if (data.success && Array.isArray(data.data)) {
    return data;
  }
  if (Array.isArray(data)) {
    return { success: true, count: data.length, data };
  }
  if (data.data && Array.isArray(data.data)) {
    return { success: true, count: data.data.length, data: data.data };
  }

  return { success: true, count: 0, data: [] };
}

/**
 * Match doula with client
 */
export async function matchDoulaWithClient(
  clientId: string,
  doulaId: string,
  notes?: string
): Promise<MatchAssignmentResponse> {
  const response = await fetch(`${API_BASE}/admin/assignments/match`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      doulaId,
      notes: notes?.trim() || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Failed to match doula with client',
    }));
    throw new Error(error.error || error.message || 'Failed to match doula with client');
  }

  return response.json();
}
