export interface Doula {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  phone_number?: string;
}

export interface AssignedDoula {
  id: string;
  doulaId: string;
  assignedAt: string;
  status: string;
  doula: Doula;
}

const getBaseUrl = (): string => {
  return import.meta.env.VITE_APP_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5050';
};

/**
 * Fetch all available doulas (team members with doula role)
 */
export const fetchAvailableDoulas = async (): Promise<Doula[]> => {
  const url = `${getBaseUrl()}/clients/team/doulas`;
  console.log('🔍 API: Fetching available doulas from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('🔍 API: Fetch doulas response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔍 API: Fetch doulas error:', errorText);
    throw new Error(`Failed to fetch doulas: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('🔍 API: Fetch doulas result:', result);
  return result.doulas || [];
};

/**
 * Fetch doulas assigned to a specific client
 */
export const fetchAssignedDoulas = async (clientId: string): Promise<AssignedDoula[]> => {
  const url = `${getBaseUrl()}/clients/${clientId}/assigned-doulas`;
  console.log('🔍 API: Fetching assigned doulas from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('🔍 API: Fetch assigned doulas response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔍 API: Fetch assigned doulas error:', errorText);
    throw new Error(`Failed to fetch assigned doulas: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('🔍 API: Fetch assigned doulas result:', result);
  return result.doulas || [];
};

/**
 * Assign a doula to a client
 */
export const assignDoula = async (clientId: string, doulaId: string): Promise<void> => {
  const response = await fetch(`${getBaseUrl()}/clients/${clientId}/assign-doula`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ doulaId }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to assign doula: ${response.status} ${text}`);
  }
};

/**
 * Unassign a doula from a client
 */
export const unassignDoula = async (clientId: string, doulaId: string): Promise<void> => {
  const response = await fetch(`${getBaseUrl()}/clients/${clientId}/assign-doula/${doulaId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to unassign doula: ${response.status}`);
  }
};
