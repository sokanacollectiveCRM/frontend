import { buildUrl, fetchWithAuth } from '@/api/http';

export type ClientDocument = {
  id: string;
  documentType: string;
  fileName: string;
  uploadedAt?: string;
  status?: string;
  contentType?: string;
  url?: string;
};

type RequestMode = 'client-self' | 'staff';
export type InsuranceCardSide = 'front' | 'back';

export const CLIENT_DOCUMENT_ENDPOINTS = {
  clientList: '/api/clients/me/documents',
  clientUpload: '/api/clients/me/documents',
  clientDocumentUrl: (documentId: string) =>
    `/api/clients/me/documents/${encodeURIComponent(documentId)}/url`,
  clientDelete: (documentId: string) =>
    `/api/clients/me/documents/${encodeURIComponent(documentId)}`,
  staffList: (clientId: string) =>
    `/api/clients/${encodeURIComponent(clientId)}/documents`,
  staffDocumentUrl: (clientId: string, documentId: string) =>
    `/api/clients/${encodeURIComponent(clientId)}/documents/${encodeURIComponent(documentId)}/url`,
} as const;

const INSURANCE_CARD_DOCUMENT_TYPES = new Set([
  'insurance_card',
  'insurance_card_front',
  'insurance_card_back',
  'insurance-card',
  'insuranceCard',
  'insuranceCardFront',
  'insuranceCardBack',
]);

export function getInsuranceCardSide(
  documentType: string,
  fileName?: string
): InsuranceCardSide | null {
  const normalized = documentType.trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (normalized === 'insurance_card_front') return 'front';
  if (normalized === 'insurance_card_back') return 'back';
  const normalizedFileName = String(fileName ?? '').trim().toLowerCase();
  if (normalizedFileName) {
    if (/(?:^|[-_.\s])front(?:$|[-_.\s])/.test(normalizedFileName)) return 'front';
    if (/(?:^|[-_.\s])back(?:$|[-_.\s])/.test(normalizedFileName)) return 'back';
  }
  return null;
}

function parseErrorMessage(parsed: unknown, fallback: string): string {
  if (typeof parsed === 'string' && parsed.trim()) {
    const normalized = parsed.trim();
    if (normalized.startsWith('<!DOCTYPE') || normalized.startsWith('<html')) {
      return fallback;
    }
    return normalized;
  }
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    const message = obj.error ?? obj.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function unwrapDocumentCollection(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.documents)) return obj.documents;
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data && typeof obj.data === 'object') {
    const inner = obj.data as Record<string, unknown>;
    if (Array.isArray(inner.documents)) return inner.documents;
    if (Array.isArray(inner.data)) return inner.data;
  }
  return [];
}

function normalizeDocument(raw: unknown): ClientDocument | null {
  if (!raw || typeof raw !== 'object') return null;
  const doc = raw as Record<string, unknown>;
  const id = doc.id ?? doc.document_id;
  if (typeof id !== 'string' || !id.trim()) return null;

  return {
    id,
    documentType: String(
      doc.documentType ??
        doc.document_type ??
        doc.type ??
        doc.category ??
        'document'
    ),
    fileName: String(doc.fileName ?? doc.file_name ?? doc.name ?? 'document'),
    uploadedAt:
      typeof (doc.uploadedAt ?? doc.uploaded_at ?? doc.created_at) === 'string'
        ? String(doc.uploadedAt ?? doc.uploaded_at ?? doc.created_at)
        : undefined,
    status: typeof doc.status === 'string' ? doc.status : undefined,
    contentType:
      typeof (doc.contentType ?? doc.content_type ?? doc.mime_type) === 'string'
        ? String(doc.contentType ?? doc.content_type ?? doc.mime_type)
        : undefined,
    url:
      typeof (doc.url ?? doc.downloadUrl ?? doc.download_url ?? doc.viewUrl ?? doc.signedUrl) ===
      'string'
        ? String(doc.url ?? doc.downloadUrl ?? doc.download_url ?? doc.viewUrl ?? doc.signedUrl)
        : undefined,
  };
}

async function requestClientDocuments(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetchWithAuth(buildUrl(path), init);
  if (response.ok) return response;

  const parsed = await parseResponseBody(response);
  throw new Error(
    parseErrorMessage(parsed, 'Client documents endpoint is not available')
  );
}

export function isInsuranceCardDocument(document: ClientDocument): boolean {
  return INSURANCE_CARD_DOCUMENT_TYPES.has(document.documentType);
}

export function getClientDocumentLabel(documentType: string, fileName?: string): string {
  const side = getInsuranceCardSide(documentType, fileName);
  if (side === 'front') return 'Insurance Card Front';
  if (side === 'back') return 'Insurance Card Back';
  if (INSURANCE_CARD_DOCUMENT_TYPES.has(documentType)) return 'Insurance Card';
  return documentType
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function compareClientDocumentsByUploadedAtDesc(
  a: ClientDocument,
  b: ClientDocument
): number {
  const aTime = a.uploadedAt ? Date.parse(a.uploadedAt) : 0;
  const bTime = b.uploadedAt ? Date.parse(b.uploadedAt) : 0;
  return bTime - aTime;
}

export async function listClientDocuments(
  mode: RequestMode,
  clientId?: string
): Promise<ClientDocument[]> {
  try {
    const path =
      mode === 'staff' && clientId
        ? CLIENT_DOCUMENT_ENDPOINTS.staffList(clientId)
        : CLIENT_DOCUMENT_ENDPOINTS.clientList;
    const response = await requestClientDocuments(path);
    const payload = await parseResponseBody(response);
    return unwrapDocumentCollection(payload).map(normalizeDocument).filter(Boolean) as ClientDocument[];
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'Client documents endpoint is not available' ||
        error.message.includes('404'))
    ) {
      return [];
    }
    throw error;
  }
}

export async function uploadInsuranceCard(
  file: File,
  side: InsuranceCardSide = 'front'
): Promise<ClientDocument> {
  const formData = new FormData();
  const documentType = 'insurance_card';
  const extensionMatch = file.name.match(/\.[^.]+$/);
  const extension = extensionMatch?.[0] || '';
  const prefixedName =
    side === 'back' ? `insurance-card-back${extension}` : `insurance-card-front${extension}`;
  const uploadFile =
    typeof File !== 'undefined'
      ? new File([file], prefixedName, { type: file.type, lastModified: file.lastModified })
      : file;
  formData.append('file', uploadFile);
  formData.append('documentType', documentType);
  formData.append('document_type', documentType);
  formData.append('category', 'billing');

  const response = await requestClientDocuments(CLIENT_DOCUMENT_ENDPOINTS.clientUpload, {
    method: 'POST',
    body: formData,
  });

  const payload = await parseResponseBody(response);
  const collection = unwrapDocumentCollection(payload);
  if (collection.length > 0) {
    const normalized = normalizeDocument(collection[0]);
    if (normalized) return normalized;
  }

  const document = normalizeDocument(
    payload && typeof payload === 'object'
      ? ((payload as Record<string, unknown>).data ?? payload)
      : payload
  );

  if (!document) {
    return {
      id: crypto.randomUUID(),
      documentType,
      fileName: uploadFile.name,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
      contentType: file.type,
    };
  }

  return document;
}

export async function deleteClientDocument(documentId: string): Promise<void> {
  await requestClientDocuments(CLIENT_DOCUMENT_ENDPOINTS.clientDelete(documentId), {
    method: 'DELETE',
  });
}

export async function getClientDocumentUrl(
  mode: RequestMode,
  documentId: string,
  clientId?: string
): Promise<string> {
  const path =
    mode === 'staff' && clientId
      ? CLIENT_DOCUMENT_ENDPOINTS.staffDocumentUrl(clientId, documentId)
      : CLIENT_DOCUMENT_ENDPOINTS.clientDocumentUrl(documentId);
  const response = await requestClientDocuments(path);
  const payload = await parseResponseBody(response);

  if (typeof payload === 'string' && payload.trim()) return payload;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const value = obj.url ?? obj.downloadUrl ?? obj.download_url ?? obj.signedUrl;
    if (typeof value === 'string' && value.trim()) return value;
    if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>;
      const nested = inner.url ?? inner.downloadUrl ?? inner.download_url ?? inner.signedUrl;
      if (typeof nested === 'string' && nested.trim()) return nested;
    }
  }

  throw new Error('Failed to resolve document URL');
}
