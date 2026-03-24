// API service functions for Doula Dashboard
// Base URL: http://localhost:5050/api
import { buildUrl, fetchWithAuth } from '@/api/http';

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
  gender?: string;
  pronouns?: string;
  race_ethnicity?: string[];
  race_ethnicity_other?: string;
  other_demographic_details?: string;
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
  gender?: string;
  pronouns?: string;
  race_ethnicity?: string[];
  race_ethnicity_other?: string;
  other_demographic_details?: string;
}

/**
 * Upload doula profile picture (headshot)
 * POST /api/doulas/profile/picture
 */
export async function uploadDoulaProfilePicture(file: File): Promise<DoulaProfile> {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP');
  }
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit');
  }

  const formData = new FormData();
  formData.append('profile_picture', file);

  const response = await fetch(`${API_BASE}/doulas/profile/picture`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to upload profile picture' }));
    throw new Error(errorData.error || 'Failed to upload profile picture');
  }

  const result = await response.json();
  return result.profile || result;
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

export interface UpdateDoulaDocumentMetadataData {
  fileName?: string;
  documentType?: DocumentType;
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

export async function updateDoulaDocumentMetadata(
  documentId: string,
  data: UpdateDoulaDocumentMetadataData
): Promise<DoulaDocument> {
  const payload: Record<string, string> = {};
  if (typeof data.fileName === 'string') {
    const trimmedName = data.fileName.trim();
    if (!trimmedName) {
      throw new Error('File name is required');
    }
    payload.file_name = trimmedName;
  }
  if (typeof data.documentType === 'string') {
    payload.document_type = data.documentType;
  }
  if (Object.keys(payload).length === 0) {
    throw new Error('No document metadata changes provided');
  }
  const response = await fetch(`${API_BASE}/doulas/documents/${documentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update document' }));
    throw new Error(error.error || 'Failed to update document');
  }

  const dataJson = await response.json();
  const document = dataJson?.document ?? dataJson;
  return {
    id: document.id,
    documentType: document.documentType ?? document.document_type,
    fileName: document.fileName ?? document.file_name,
    fileUrl: document.fileUrl ?? document.file_url ?? null,
    fileSize: document.fileSize ?? document.file_size ?? 0,
    mimeType: document.mimeType ?? document.mime_type,
    uploadedAt: document.uploadedAt ?? document.uploaded_at ?? document.created_at,
    status: document.status === 'pending' ? 'uploaded' : document.status ?? 'missing',
    notes: document.notes ?? null,
    rejectionReason: document.rejectionReason ?? document.rejection_reason ?? null,
  };
}

// Admin document APIs
export async function getAdminDoulaDocuments(doulaId: string): Promise<DocumentsResponse> {
  const url = buildUrl(`/api/admin/doulas/${encodeURIComponent(doulaId)}/documents`);
  const response = await fetchWithAuth(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch documents' }));
    throw new Error((error as { error?: string }).error || 'Failed to fetch documents');
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
  const url = buildUrl(
    `/api/admin/doulas/${encodeURIComponent(doulaId)}/documents/${encodeURIComponent(documentId)}/review`
  );
  const response = await fetchWithAuth(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status,
      rejection_reason: rejectionReason || undefined,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to review document' }));
    throw new Error((error as { error?: string }).error || 'Failed to review document');
  }
}

export async function getDoulaDocumentUrl(doulaId: string, documentId: string): Promise<string> {
  const url = buildUrl(
    `/api/admin/doulas/${encodeURIComponent(doulaId)}/documents/${encodeURIComponent(documentId)}/url`
  );
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get document URL' }));
    throw new Error((error as { error?: string }).error || 'Failed to get document URL');
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
  birthOutcomes?: string;
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
        birthOutcomes:
          client.user.birth_outcomes ||
          client.user.birthOutcomes ||
          client.birth_outcomes ||
          client.birthOutcomes ||
          '',
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
      birthOutcomes: client.birthOutcomes || client.birth_outcomes || '',
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

  const payload = await response.json();
  const raw = payload?.data ?? payload;
  const source = raw?.user && typeof raw.user === 'object' ? raw.user : raw;

  return {
    id: String(raw?.id ?? source?.id ?? clientId),
    firstname: String(source?.firstname ?? source?.first_name ?? ''),
    lastname: String(source?.lastname ?? source?.last_name ?? ''),
    email: String(source?.email ?? ''),
    phone: String(
      source?.phone ?? source?.phoneNumber ?? source?.phone_number ?? ''
    ),
    dueDate: String(source?.dueDate ?? source?.due_date ?? ''),
    status: String(raw?.status ?? source?.status ?? 'matching'),
    address: String(source?.address ?? source?.address_line1 ?? ''),
    city: String(source?.city ?? ''),
    state: String(source?.state ?? ''),
    zipCode: String(source?.zipCode ?? source?.zip_code ?? ''),
    healthHistory: String(source?.healthHistory ?? source?.health_history ?? ''),
    allergies: String(source?.allergies ?? ''),
    hospital: String(source?.hospital ?? ''),
    birthOutcomes: String(
      source?.birthOutcomes ?? source?.birth_outcomes ?? ''
    ),
  };
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
  createdByRole?: string;
  /** When true, the client can see this entry in their portal. */
  visibleToClient?: boolean;
}

export interface AddActivityData {
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  /** When true, share this activity with the client in their portal. Default false. */
  visibleToClient?: boolean;
}

/** True if string is a UUID the backend can use in Cloud SQL `id = $1::uuid`. */
export function isClientActivityUuid(id: string | undefined | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id.trim()
  );
}

function messageFromBackendErrorBody(text: string, status: number, fallback: string): string {
  if (!text.trim()) {
    return `${fallback} (HTTP ${status})`;
  }
  try {
    const parsed = JSON.parse(text) as { error?: string; message?: string };
    return parsed.error || parsed.message || `${fallback} (HTTP ${status})`;
  } catch {
    const snippet = text.slice(0, 120).trim();
    return snippet ? `${fallback} (HTTP ${status}): ${snippet}` : `${fallback} (HTTP ${status})`;
  }
}

async function readJsonResponse<T>(response: Response, errorFallback: string): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(messageFromBackendErrorBody(text, response.status, errorFallback));
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${errorFallback}: invalid response from server`);
  }
}

function normalizeClientActivity(activity: any, clientId: string, index: number): ClientActivity {
  const meta =
    activity.metadata && typeof activity.metadata === 'object' && !Array.isArray(activity.metadata)
      ? activity.metadata
      : {};
  const formatName = (raw: unknown): string => {
    if (!raw) return '';
    if (typeof raw === 'string') return raw.trim();
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      const obj = raw as Record<string, unknown>;
      const first = String(obj.first_name ?? obj.firstName ?? obj.firstname ?? '').trim();
      const last = String(obj.last_name ?? obj.lastName ?? obj.lastname ?? '').trim();
      const full = `${first} ${last}`.trim();
      if (full) return full;
      const name = String(obj.name ?? '').trim();
      if (name) return name;
      const email = String(obj.email ?? '').trim();
      if (email) return email;
    }
    return '';
  };

  const createdByDisplay =
    formatName(activity.display_name) ||
    formatName(activity.created_by_display_name) ||
    formatName(activity.createdByDisplayName) ||
    formatName(activity.createdByName) ||
    formatName(activity.created_by_name) ||
    formatName(activity.created_by_email) ||
    formatName(activity.createdByEmail) ||
    formatName(activity.authorName) ||
    formatName(activity.author_name) ||
    formatName(meta.display_name) ||
    formatName(meta.created_by_display_name) ||
    formatName(meta.createdByDisplayName) ||
    formatName(meta.createdByName) ||
    formatName(meta.created_by_name) ||
    formatName(meta.created_by_email) ||
    formatName(meta.createdByEmail) ||
    formatName(meta.authorName) ||
    formatName(meta.author_name) ||
    formatName(activity.createdBy) ||
    formatName(activity.created_by) ||
    formatName(activity.author);
  const createdByRole = String(
    activity.createdByRole ??
      activity.created_by_role ??
      activity.authorRole ??
      activity.author_role ??
      meta.createdByRole ??
      meta.created_by_role ??
      ''
  ).trim();

  const createdAt =
    activity.createdAt ||
    activity.created_at ||
    activity.timestamp ||
    new Date().toISOString();
  const visibleFromMeta =
    meta.visibleToClient === true ||
    meta.visible_to_client === true ||
    activity.visible_to_client === true ||
    activity.visibleToClient === true;
  const rawId = activity.id ?? activity.activity_id;
  const id =
    rawId != null && String(rawId).trim() !== ''
      ? String(rawId)
      : `${clientId}-${index}-${createdAt}`;
  return {
    id,
    clientId: activity.clientId || activity.client_id || clientId,
    type: (activity.type || 'note') as ActivityType,
    description: activity.description || activity.content || '',
    metadata: meta,
    createdAt,
    createdBy: createdByDisplay,
    ...(createdByRole ? { createdByRole } : {}),
    visibleToClient: visibleFromMeta,
  };
}

export async function addClientActivity(
  clientId: string,
  data: AddActivityData
): Promise<ClientActivity> {
  const { visibleToClient, ...rest } = data;
  const url = buildUrl(
    `/api/doulas/clients/${encodeURIComponent(clientId)}/activities`
  );
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...rest,
      ...(visibleToClient !== undefined ? { visibleToClient } : {}),
    }),
  });

  const raw = await readJsonResponse<Record<string, unknown>>(response, 'Failed to add activity');
  const rawData =
    raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
      ? (raw.data as Record<string, unknown>)
      : undefined;
  const act = raw.activity ?? rawData?.activity ?? rawData;
  if (!act || typeof act !== 'object') {
    throw new Error('Invalid response from server when adding activity');
  }
  return normalizeClientActivity(act, clientId, 0);
}

export async function patchClientActivityVisibility(
  clientId: string,
  activityId: string,
  visibleToClient: boolean
): Promise<ClientActivity> {
  if (!isClientActivityUuid(activityId)) {
    throw new Error(
      'This entry has no valid activity id (cannot update). Refresh the page or redeploy the latest API.'
    );
  }
  const url = buildUrl(
    `/api/doulas/clients/${encodeURIComponent(clientId)}/activities/${encodeURIComponent(activityId)}`
  );
  const response = await fetchWithAuth(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ visibleToClient }),
  });

  const raw = await readJsonResponse<Record<string, unknown>>(response, 'Failed to update activity');
  const rawData =
    raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
      ? (raw.data as Record<string, unknown>)
      : undefined;
  const act = raw.activity ?? rawData?.activity ?? rawData;
  if (!act || typeof act !== 'object') {
    throw new Error('Invalid response when updating activity');
  }
  return normalizeClientActivity(act, clientId, 0);
}

export async function getClientActivities(clientId: string): Promise<ClientActivity[]> {
  const url = buildUrl(`/api/doulas/clients/${encodeURIComponent(clientId)}/activities`, {
    _: Date.now(),
  });
  const response = await fetchWithAuth(url, {
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
  
  const normalizedActivities = activitiesArray.map((activity, index) =>
    normalizeClientActivity(activity, clientId, index)
  );
  
  console.log('getClientActivities - Normalized activities:', normalizedActivities);
  return normalizedActivities;
}
