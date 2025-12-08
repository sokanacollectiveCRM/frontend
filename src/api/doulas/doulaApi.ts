// API functions for fetching doula-related data
import type {
  ActivityLog,
  AssignedClient,
  Doula,
  DoulaNote,
  Visit,
} from '@/features/hours/types/doula';

const API_BASE =
  import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

// Get all doulas (for list page)
export async function getAllDoulas(): Promise<Doula[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/admin/doulas`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch doulas: ${errorText}`);
  }

  return response.json();
}

// Get doula by ID (for detail page)
export async function getDoulaById(doulaId: string): Promise<Doula> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/admin/doulas/${doulaId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch doula: ${errorText}`);
  }

  return response.json();
}

// Get assigned clients for a doula
export async function getAssignedClients(
  doulaId: string
): Promise<AssignedClient[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(
    `${API_BASE}/admin/doulas/${doulaId}/clients`,
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
    const errorText = await response.text();
    throw new Error(`Failed to fetch assigned clients: ${errorText}`);
  }

  return response.json();
}

// Get visits for a doula
export async function getDoulaVisits(doulaId: string): Promise<Visit[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/admin/doulas/${doulaId}/visits`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch visits: ${errorText}`);
  }

  return response.json();
}

// Get notes for a doula
export async function getDoulaNotes(doulaId: string): Promise<DoulaNote[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/admin/doulas/${doulaId}/notes`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch notes: ${errorText}`);
  }

  return response.json();
}

// Get activity log for a doula
export async function getActivityLog(
  doulaId: string
): Promise<ActivityLog[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(
    `${API_BASE}/admin/doulas/${doulaId}/activity`,
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
    const errorText = await response.text();
    throw new Error(`Failed to fetch activity log: ${errorText}`);
  }

  return response.json();
}

// Update doula profile
export async function updateDoula(
  doulaId: string,
  updateData: Partial<Doula>
): Promise<Doula> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/admin/doulas/${doulaId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update doula: ${errorText}`);
  }

  return response.json();
}

