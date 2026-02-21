import { buildUrl, fetchWithAuth } from '@/api/http';

type QueryValue = string | number | boolean | undefined;

export interface PaginationMeta {
  limit: number;
  offset: number;
  count: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface FetchDoulasParams {
  q?: string;
  limit?: number;
  offset?: number;
  includeCounts?: boolean;
}

export interface FetchDoulaAssignmentsParams {
  q?: string;
  doulaId?: string;
  hospital?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface FetchClientDoulaAssignmentsParams {
  limit?: number;
  offset?: number;
}

function toQueryParams(
  params: Record<string, QueryValue>
): Record<string, QueryValue> {
  const query: Record<string, QueryValue> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim().length === 0) return;
    query[key] = value;
  });
  return query;
}

function toPaginationMeta(input: unknown): PaginationMeta {
  const obj =
    typeof input === 'object' && input !== null
      ? (input as Record<string, unknown>)
      : {};
  const limit = Number(obj.limit ?? 0);
  const offset = Number(obj.offset ?? 0);
  const count = Number(obj.count ?? 0);
  return {
    limit: Number.isFinite(limit) ? limit : 0,
    offset: Number.isFinite(offset) ? offset : 0,
    count: Number.isFinite(count) ? count : 0,
  };
}

function normalizePaginatedResponse<T>(raw: unknown): PaginatedResult<T> {
  const root =
    typeof raw === 'object' && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  // Legacy shape: { data: T[], meta: { limit, offset, count } }
  if (Array.isArray(root.data)) {
    return {
      data: root.data as T[],
      meta: toPaginationMeta(root.meta),
    };
  }

  // Canonical shape may wrap as { success: true, data: { data: T[], meta: ... } }
  const payload =
    typeof root.data === 'object' && root.data !== null
      ? (root.data as Record<string, unknown>)
      : {};
  if (Array.isArray(payload.data)) {
    return {
      data: payload.data as T[],
      meta: toPaginationMeta(payload.meta),
    };
  }

  return { data: [], meta: { limit: 0, offset: 0, count: 0 } };
}

async function requestPaginated<T>(
  path: string,
  params?: Record<string, QueryValue>
): Promise<PaginatedResult<T>> {
  const url = buildUrl(path, params ? toQueryParams(params) : undefined);
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Request failed (${response.status})`);
  }

  const raw = await response.json();
  return normalizePaginatedResponse<T>(raw);
}

export async function fetchDoulas(
  params: FetchDoulasParams = {}
): Promise<PaginatedResult<Record<string, unknown>>> {
  return requestPaginated<Record<string, unknown>>('/api/doulas', {
    q: params.q,
    limit: params.limit,
    offset: params.offset,
    includeCounts: params.includeCounts,
  });
}

export async function fetchDoulaAssignments(
  params: FetchDoulaAssignmentsParams = {}
): Promise<PaginatedResult<Record<string, unknown>>> {
  return requestPaginated<Record<string, unknown>>('/api/doula-assignments', {
    q: params.q,
    doulaId: params.doulaId,
    hospital: params.hospital,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    sort: params.sort,
    limit: params.limit,
    offset: params.offset,
  });
}

export async function fetchClientDoulaAssignments(
  clientId: string,
  params: FetchClientDoulaAssignmentsParams = {}
): Promise<PaginatedResult<Record<string, unknown>>> {
  return requestPaginated<Record<string, unknown>>(
    `/api/clients/${encodeURIComponent(clientId)}/doula-assignments`,
    {
      limit: params.limit,
      offset: params.offset,
    }
  );
}
