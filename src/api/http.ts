import { API_CONFIG } from './config';
import { ApiError } from './errors';

export type ApiResponse<T> =
  | { success: true; data: T; meta?: ApiResponseMeta }
  | { success: false; error: string; code?: string };

export type ApiResponseMeta = {
  count?: number;
  total?: number;
  page?: number;
  [key: string]: unknown;
};

type QueryParams = Record<string, string | number | boolean | undefined>;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: QueryParams;
  body?: unknown;
}

/**
 * Build full URL preserving any base path in VITE_APP_BACKEND_URL.
 * WARNING: Do NOT "fix" this to `new URL(path, baseUrl)` — it drops base paths like /v1.
 */
export function buildUrl(path: string, params?: QueryParams): string {
  const base = API_CONFIG.baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const fullUrl = `${base}${normalizedPath}`;
  const url = new URL(fullUrl);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  return url.toString();
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

function buildHeaders(fetchHeaders: RequestInit['headers'], hasBody: boolean): HeadersInit {
  // Only set Content-Type when we actually send a JSON body
  const base: Record<string, string> = hasBody ? { 'Content-Type': 'application/json' } : {};
  return { ...base, ...(fetchHeaders as any) };
}

async function requestLegacy<T>(path: string, options?: RequestOptions): Promise<T> {
  const { params, body, ...fetchOptions } = options ?? {};
  const hasBody = body !== undefined;

  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    credentials: 'include',
    headers: buildHeaders(fetchOptions.headers, hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const parsed = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      typeof parsed === 'string'
        ? parsed
        : (parsed as any)?.error ?? (parsed as any)?.message ?? response.statusText;
    throw new ApiError(message, response.status);
  }

  return parsed as T;
}

async function requestCanonical<T>(path: string, options?: RequestOptions): Promise<T> {
  const { params, body, ...fetchOptions } = options ?? {};
  const hasBody = body !== undefined;

  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    credentials: 'include',
    headers: buildHeaders(fetchOptions.headers, hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const parsed = await parseResponseBody(response);

  // 1) non-2xx FIRST (before wrapper enforcement)
  if (!response.ok) {
    const message =
      typeof parsed === 'string'
        ? parsed
        : (parsed as any)?.error ?? (parsed as any)?.message ?? response.statusText;
    const code = typeof parsed === 'object' && parsed !== null ? (parsed as any)?.code : undefined;
    throw new ApiError(message, response.status, { code });
  }

  // 2) enforce wrapper on 2xx
  if (typeof parsed !== 'object' || parsed === null || typeof (parsed as any).success !== 'boolean') {
    throw new ApiError(
      'Invalid API response: missing boolean success field. Backend must return ApiResponse wrapper.',
      response.status,
      { code: 'INVALID_RESPONSE_FORMAT' }
    );
  }

  const apiResponse = parsed as ApiResponse<T>;

  // 3) unwrap
  if (!apiResponse.success) {
    throw new ApiError(apiResponse.error || 'Unknown error', response.status, { code: apiResponse.code });
  }

  return apiResponse.data;
}

export async function get<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
  const request = API_CONFIG.useLegacyApi ? requestLegacy : requestCanonical;
  return request<T>(path, { method: 'GET', ...options });
}

export async function post<T, B = unknown>(
  path: string,
  body?: B,
  options?: Omit<RequestOptions, 'body'>
): Promise<T> {
  const request = API_CONFIG.useLegacyApi ? requestLegacy : requestCanonical;
  return request<T>(path, { method: 'POST', body, ...options });
}

export async function put<T, B = unknown>(
  path: string,
  body?: B,
  options?: Omit<RequestOptions, 'body'>
): Promise<T> {
  const request = API_CONFIG.useLegacyApi ? requestLegacy : requestCanonical;
  return request<T>(path, { method: 'PUT', body, ...options });
}

export async function del<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
  const request = API_CONFIG.useLegacyApi ? requestLegacy : requestCanonical;
  return request<T>(path, { method: 'DELETE', ...options });
}
