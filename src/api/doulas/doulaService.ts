// API service functions for Doula Dashboard
// Base URL: http://localhost:5050/api

const API_BASE =
  (import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050') + '/api';

// ============================================
// 1. Doula Profile Management
// ============================================

export interface DoulaProfile {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  role: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: number | string;
  profile_picture: string | null;
  account_status: string;
  business: string;
  bio: string;
  created_at: string;
  updatedAt: string;
}

export async function getDoulaProfile(): Promise<DoulaProfile> {
  const response = await fetch(`${API_BASE}/doulas/profile`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch profile' }));
    throw new Error(error.error || 'Failed to fetch profile');
  }

  const result = await response.json();
  // Handle both {success: true, profile: {...}} and direct profile object
  return result.profile || result;
}

export interface UpdateProfileData {
  firstname?: string;
  lastname?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  business?: string;
  bio?: string;
}

export async function updateDoulaProfile(
  data: UpdateProfileData
): Promise<DoulaProfile> {
  
  // Log the payload being sent
  console.log('updateDoulaProfile - Sending payload:', JSON.stringify(data, null, 2));
  
  const response = await fetch(`${API_BASE}/doulas/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Ensure cookies are sent
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('updateDoulaProfile - Error response:', errorText);
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: 'Failed to update profile' };
    }
    throw new Error(error.error || error.message || 'Failed to update profile');
  }

  const result = await response.json();
  console.log('updateDoulaProfile - Response received:', JSON.stringify(result, null, 2));
  
  // Handle both {success: true, profile: {...}} and direct profile object
  const profile = result.profile || result;
  console.log('updateDoulaProfile - Returning profile:', JSON.stringify(profile, null, 2));
  
  return profile;
}

// ============================================
// 2. Document Management (Mandatory Doula Documents)
// ============================================

export const REQUIRED_DOULA_DOCUMENT_TYPES = [
  'background_check',
  'liability_insurance_certificate',
  'training_certificate',
  'w9',
  'direct_deposit_form',
] as const;

export type RequiredDocumentType = (typeof REQUIRED_DOULA_DOCUMENT_TYPES)[number];

export type DocumentType =
  | RequiredDocumentType
  | 'license'
  | 'other';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  background_check: 'Background Check',
  liability_insurance_certificate: 'Liability Insurance Certificate',
  training_certificate: 'Training Certificate',
  w9: 'W9',
  direct_deposit_form: 'Direct Deposit Form',
  license: 'License',
  other: 'Other',
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  missing: 'Missing',
  uploaded: 'Uploaded',
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Uploaded',
};

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export interface DoulaDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string | null;
  fileSize: number;
  mimeType?: string;
  uploadedAt: string;
  status: 'missing' | 'uploaded' | 'approved' | 'rejected' | 'pending';
  notes?: string | null;
  rejectionReason?: string | null;
}

export interface DocumentCompletenessItem {
  document_type: string;
  status: string;
  document_id?: string;
  file_name?: string;
  uploaded_at?: string;
  rejection_reason?: string;
}

export interface DocumentCompleteness {
  total_required: number;
  total_complete: number;
  missing_types: string[];
  has_all_required_documents: boolean;
  can_be_active: boolean;
  items: DocumentCompletenessItem[];
}

export interface DocumentsResponse {
  documents: DoulaDocument[];
  completeness?: DocumentCompleteness;
}

export interface UploadDocumentResponse {
  success: boolean;
  document: DoulaDocument;
}

export async function uploadDocument(
  file: File,
  documentType: DocumentType,
  notes?: string
): Promise<UploadDocumentResponse> {
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: PDF, PNG, JPG, JPEG');
  }

  const formData = new FormData();
  // Backend expects: 'file' for the file, 'document_type' (snake_case) for the type
  formData.append('file', file);
  formData.append('document_type', documentType);
  if (notes && notes.trim()) {
    formData.append('notes', notes);
  }
  
  // Debug: Log FormData contents
  console.log('Uploading document with FormData fields:');
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value instanceof File ? `${value.name} (${value.type})` : value);
  }

  const response = await fetch(`${API_BASE}/doulas/documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to upload document' }));
    console.error('Upload error response:', errorData); // Debug log
    throw new Error(errorData.error || errorData.message || 'Failed to upload document');
  }

  return response.json();
}

export async function getDoulaDocuments(): Promise<DocumentsResponse> {
  const response = await fetch(`${API_BASE}/doulas/documents`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch documents' }));
    throw new Error(error.error || 'Failed to fetch documents');
  }

  const data = await response.json();
  const documents: DoulaDocument[] = Array.isArray(data.documents)
    ? data.documents
    : Array.isArray(data)
    ? data
    : data?.documents ?? data?.data ?? [];
  const completeness = data?.completeness ?? null;

  return {
    documents: documents.map((d: any) => ({
      id: d.id,
      documentType: d.documentType ?? d.document_type,
      fileName: d.fileName ?? d.file_name,
      fileUrl: d.fileUrl ?? d.file_url ?? null,
      fileSize: d.fileSize ?? d.file_size ?? 0,
      mimeType: d.mimeType ?? d.mime_type,
      uploadedAt: d.uploadedAt ?? d.uploaded_at ?? d.created_at,
      status: d.status === 'pending' ? 'uploaded' : d.status ?? 'missing',
      notes: d.notes ?? null,
      rejectionReason: d.rejectionReason ?? d.rejection_reason ?? null,
    })),
    completeness: completeness || undefined,
  };
}

export async function deleteDoulaDocument(documentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/doulas/documents/${documentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete document' }));
    throw new Error(error.error || 'Failed to delete document');
  }
}

// Admin document APIs
export async function getAdminDoulaDocuments(doulaId: string): Promise<DocumentsResponse> {
  const response = await fetch(`${API_BASE}/admin/doulas/${doulaId}/documents`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch documents' }));
    throw new Error(error.error || 'Failed to fetch documents');
  }
  const data = await response.json();
  return {
    documents: data.documents ?? [],
    completeness: data.completeness,
  };
}

export async function reviewDoulaDocument(
  doulaId: string,
  documentId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/doulas/${doulaId}/documents/${documentId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      status,
      rejection_reason: rejectionReason || undefined,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to review document' }));
    throw new Error(error.error || 'Failed to review document');
  }
}

export async function getDoulaDocumentUrl(doulaId: string, documentId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/admin/doulas/${doulaId}/documents/${documentId}/url`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get document URL' }));
    throw new Error(error.error || 'Failed to get document URL');
  }
  const data = await response.json();
  return data.url;
}

// ============================================
// 3. Assigned Clients
// ============================================

export interface AssignedClientLite {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  dueDate: string;
  status: string;
}

export interface AssignedClientDetailed extends AssignedClientLite {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  healthHistory?: string;
  allergies?: string;
  hospital?: string;
  // ... more fields as needed
}

export async function getAssignedClients(
  detailed = false
): Promise<AssignedClientLite[] | AssignedClientDetailed[]> {
  const url = `${API_BASE}/doulas/clients?detailed=${detailed}`;
  console.log('getAssignedClients - Calling URL:', url);
  console.log('getAssignedClients - Detailed mode:', detailed);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('getAssignedClients - Response status:', response.status);
  console.log('getAssignedClients - Response ok?', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('getAssignedClients - Error response:', errorText);
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: 'Failed to fetch clients' };
    }
    throw new Error(error.error || error.message || 'Failed to fetch clients');
  }

  const data = await response.json();
  console.log('getAssignedClients - Raw response:', data);
  console.log('getAssignedClients - Full response structure:', JSON.stringify(data, null, 2));
  console.log('getAssignedClients - Is array?', Array.isArray(data));
  console.log('getAssignedClients - Has success?', data?.success);
  console.log('getAssignedClients - Has data?', data?.data);
  console.log('getAssignedClients - Has clients?', data?.clients);
  console.log('getAssignedClients - Clients array length:', data?.clients?.length);
  
  // Handle multiple response formats
  let clientsArray: any[] = [];
  
  if (data?.success && Array.isArray(data.data)) {
    console.log('Using format: {success: true, data: [...]}');
    clientsArray = data.data;
  } else if (data?.success && Array.isArray(data.clients)) {
    console.log('Using format: {success: true, clients: [...]}');
    clientsArray = data.clients;
  } else if (Array.isArray(data)) {
    console.log('Using format: direct array');
    clientsArray = data;
  } else if (data?.data && Array.isArray(data.data)) {
    console.log('Using format: {data: [...]}');
    clientsArray = data.data;
  } else if (data?.clients && Array.isArray(data.clients)) {
    console.log('Using format: {clients: [...]}');
    clientsArray = data.clients;
  } else {
    console.warn('Unexpected response format:', data);
    return [];
  }
  
  // Transform the response to match the expected interface
  // Backend returns {id, user: {firstname, lastname, email, ...}, status, ...}
  // We need to flatten it to {id, firstname, lastname, email, status, ...}
  const transformedClients = clientsArray.map((client) => {
    // If client has a nested user object, flatten it
    if (client.user) {
      return {
        id: client.id,
        firstname: client.user.firstname || client.user.firstName || '',
        lastname: client.user.lastname || client.user.lastName || '',
        email: client.user.email || '',
        phone: client.user.phone || client.user.phoneNumber || client.phone || '',
        dueDate: client.user.due_date || client.dueDate || client.due_date || '',
        status: client.status || client.user.status || 'matching',
        // Detailed fields
        address: client.user.address || client.address || '',
        city: client.user.city || client.city || '',
        state: client.user.state || client.state || '',
        zipCode: client.user.zip_code || client.zipCode || client.zip_code || '',
        healthHistory: client.user.health_history || client.healthHistory || '',
        allergies: client.user.allergies || client.allergies || '',
        hospital: client.user.hospital || client.hospital || '',
        serviceNeeded: client.serviceNeeded || client.user.service_needed || '',
      };
    }
    // If already flattened, return as is
    return {
      id: client.id,
      firstname: client.firstname || client.firstName || '',
      lastname: client.lastname || client.lastName || '',
      email: client.email || '',
      phone: client.phone || client.phoneNumber || '',
      dueDate: client.dueDate || client.due_date || '',
      status: client.status || 'matching',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      zipCode: client.zipCode || client.zip_code || '',
      healthHistory: client.healthHistory || client.health_history || '',
      allergies: client.allergies || '',
      hospital: client.hospital || '',
      serviceNeeded: client.serviceNeeded || client.service_needed || '',
    };
  });
  
  console.log('getAssignedClients - Transformed clients:', transformedClients);
  return transformedClients;
}

export async function getAssignedClientDetails(
  clientId: string,
  detailed = false
): Promise<AssignedClientLite | AssignedClientDetailed> {
  const response = await fetch(
    `${API_BASE}/doulas/clients/${clientId}?detailed=${detailed}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch client details' }));
    throw new Error(error.error || 'Failed to fetch client details');
  }

  return response.json();
}

// ============================================
// 4. Hours Logging
// ============================================

export interface HoursEntry {
  id: string;
  client: {
    id: string;
    firstname: string;
    lastname: string;
  };
  startTime: string;
  endTime: string;
  hours: number;
  note: string | null;
  createdAt: string;
}

export interface LogHoursData {
  clientId: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  note?: string;
}

export async function logHours(data: LogHoursData): Promise<HoursEntry> {
  const response = await fetch(`${API_BASE}/doulas/hours`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to log hours' }));
    throw new Error(error.error || 'Failed to log hours');
  }

  return response.json();
}

export async function getDoulaHours(): Promise<HoursEntry[]> {
  // Bust browser conditional caching to avoid 304 + empty-body parsing issues.
  const url = `${API_BASE}/doulas/hours?_=${Date.now()}`;
  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (response.status === 304) {
    return [];
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch hours' }));
    throw new Error(error.error || 'Failed to fetch hours');
  }

  const data = await response.json();

  let hoursArray: any[] = [];
  if (Array.isArray(data)) {
    hoursArray = data;
  } else if (data?.success && Array.isArray(data.hours)) {
    hoursArray = data.hours;
  } else if (Array.isArray(data?.hours)) {
    hoursArray = data.hours;
  } else if (data?.success && Array.isArray(data?.data)) {
    hoursArray = data.data;
  } else if (Array.isArray(data?.data)) {
    hoursArray = data.data;
  } else {
    return [];
  }

  return hoursArray.map((entry) => {
    const startTime = entry.startTime || entry.start_time || '';
    const endTime = entry.endTime || entry.end_time || '';
    const start = startTime ? new Date(startTime) : null;
    const end = endTime ? new Date(endTime) : null;
    const computedHours =
      start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
        ? Math.max(0, Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 10) / 10)
        : 0;

    return {
      id: entry.id,
      client: {
        id: entry.client?.id || entry.client_id || '',
        firstname: entry.client?.firstname || entry.client?.user?.firstname || '',
        lastname: entry.client?.lastname || entry.client?.user?.lastname || '',
      },
      startTime,
      endTime,
      hours: typeof entry.hours === 'number' ? entry.hours : computedHours,
      note: entry.note || null,
      createdAt: entry.createdAt || entry.created_at || entry.startTime || entry.start_time || new Date().toISOString(),
    } as HoursEntry;
  });
}

// ============================================
// 5. Client Activities
// ============================================

export type ActivityType = 'note' | 'call' | 'visit' | 'email' | 'other';

export interface ClientActivity {
  id: string;
  clientId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
}

export interface AddActivityData {
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
}

export async function addClientActivity(
  clientId: string,
  data: AddActivityData
): Promise<ClientActivity> {
  const response = await fetch(`${API_BASE}/doulas/clients/${clientId}/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to add activity' }));
    throw new Error(error.error || 'Failed to add activity');
  }

  return response.json();
}

export async function getClientActivities(clientId: string): Promise<ClientActivity[]> {
  // Bust conditional caching so latest notes appear after add/view transitions.
  const url = `${API_BASE}/doulas/clients/${clientId}/activities?_=${Date.now()}`;
  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (response.status === 304) {
    return [];
  }

  if (!response.ok) {
    // If 404 or empty, return empty array instead of throwing
    if (response.status === 404) {
      console.log('No activities found for client:', clientId);
      return [];
    }
    const error = await response.json().catch(() => ({ error: 'Failed to fetch activities' }));
    throw new Error(error.error || 'Failed to fetch activities');
  }

  const data = await response.json();
  console.log('getClientActivities - Raw response:', data);
  
  let activitiesArray: any[] = [];
  
  // Handle different response formats
  if (Array.isArray(data)) {
    console.log('getClientActivities - Returning array with', data.length, 'activities');
    activitiesArray = data;
  } else if (data?.success && Array.isArray(data.activities)) {
    console.log('getClientActivities - Using format: {success: true, activities: [...]}');
    activitiesArray = data.activities;
  } else if (data?.success && Array.isArray(data.data)) {
    console.log('getClientActivities - Using format: {success: true, data: [...]}');
    activitiesArray = data.data;
  } else if (data?.data?.activities && Array.isArray(data.data.activities)) {
    console.log('getClientActivities - Using format: {data: {activities: [...]}}');
    activitiesArray = data.data.activities;
  } else if (data?.activities && Array.isArray(data.activities)) {
    console.log('getClientActivities - Using format: {activities: [...]}');
    activitiesArray = data.activities;
  } else if (data?.data && Array.isArray(data.data)) {
    console.log('getClientActivities - Using format: {data: [...]}');
    activitiesArray = data.data;
  } else {
    console.warn('getClientActivities - Unexpected response format:', data);
    return [];
  }
  
  // Normalize activity objects to ensure createdAt field exists
  const normalizedActivities = activitiesArray.map((activity, index) => {
    // Handle different backend timestamp variants.
    const createdAt =
      activity.createdAt ||
      activity.created_at ||
      activity.timestamp ||
      new Date().toISOString();
    
    console.log('Normalizing activity:', {
      original: activity,
      createdAt: createdAt,
      hasCreatedAt: !!activity.createdAt,
      hasCreated_at: !!activity.created_at,
      hasTimestamp: !!activity.timestamp,
    });
    
    return {
      id: activity.id || `${clientId}-${index}-${createdAt}`,
      clientId: activity.clientId || activity.client_id || clientId,
      type: activity.type || 'note',
      description: activity.description || activity.content || '',
      metadata: activity.metadata || {},
      createdAt: createdAt,
      createdBy: activity.createdBy || activity.created_by || activity.author || '',
    };
  });
  
  console.log('getClientActivities - Normalized activities:', normalizedActivities);
  return normalizedActivities;
}
