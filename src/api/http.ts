import { API_CONFIG } from './config';
import { getAuthToken } from './authToken';
import { ApiError } from './errors';
import { logger } from '@/utils/logger';

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
 * Build full URL from API base (VITE_API_BASE_URL or VITE_APP_BACKEND_URL).
 * Preserves base path (e.g. /v1). Do NOT use new URL(path, base) — it drops base paths.
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

/** Throw if production build is using localhost (env not set in Vercel). */
function assertProductionBackendUrl(_path: string): void {
  const isProductionBuild = import.meta.env.MODE === 'production';
  const base = API_CONFIG.baseUrl;
  const isLocalhost = base.includes('localhost') || base.startsWith('http://127.');
  if (isProductionBuild && isLocalhost) {
    throw new ApiError(
      'Backend URL is not set for production. Set VITE_APP_BACKEND_URL or VITE_API_BASE_URL in Vercel to your backend, e.g. https://your-backend.run.app',
      0,
      { code: 'MISSING_BACKEND_URL' }
    );
  }
}

function isNetworkError(err: unknown): err is TypeError {
  return err instanceof TypeError && (err.message === 'Failed to fetch' || err.message === 'Load failed');
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

/** Normalize error for callers: never log full payloads in production. */
function normalizeError(parsed: unknown, response: Response): { ok: false; status: number; message: string; code?: string } {
  const message =
    typeof parsed === 'string'
      ? parsed
      : (parsed as Record<string, unknown>)?.error ?? (parsed as Record<string, unknown>)?.message ?? response.statusText;
  const code = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>)?.code : undefined;
  return { ok: false, status: response.status, message: String(message), code: code as string | undefined };
}

function buildBaseHeaders(hasBody: boolean, fetchHeaders: HeadersInit | undefined): HeadersInit {
  const base: Record<string, string> = hasBody ? { 'Content-Type': 'application/json' } : {};
  return { ...base, ...(fetchHeaders as Record<string, string>) };
}

/** Resolve credentials and Authorization. Send Supabase token when available (Bearer + X-Session-Token). */
export async function getRequestAuth(): Promise<{ credentials: RequestCredentials; headers: Record<string, string> }> {
  if (API_CONFIG.authMode === 'cookie') {
    return { credentials: 'include', headers: {} };
  }
  const token = await getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Session-Token'] = token;
  }
  return { credentials: 'omit', headers };
}

/**
 * Fetch with auth applied: cookie mode sends credentials; supabase mode sends Bearer + X-Session-Token.
 * Use for any direct fetch to the backend so session is always sent. Prefer get/post/put/del when possible.
 */
export async function fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
  const auth = await getRequestAuth();
  const headers = new Headers(init?.headers);
  Object.entries(auth.headers).forEach(([k, v]) => headers.set(k, v));
  return fetch(url, {
    ...init,
    credentials: auth.credentials,
    headers,
  });
}

async function requestLegacy<T>(path: string, options?: RequestOptions): Promise<T> {
  assertProductionBackendUrl(path);
  const { params, body, ...fetchOptions } = options ?? {};
  const hasBody = body !== undefined;
  const auth = await getRequestAuth();
  const headers = { ...buildBaseHeaders(hasBody, fetchOptions.headers), ...auth.headers };
  const url = buildUrl(path, params);

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      method: fetchOptions.method ?? 'GET',
      credentials: auth.credentials,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (isNetworkError(err)) {
      throw new ApiError(
        `Network error: could not reach the server. Check backend URL (VITE_APP_BACKEND_URL), CORS (allow your frontend origin), and that the server is running. URL: ${url}`,
        0,
        { code: 'NETWORK_ERROR' }
      );
    }
    throw err;
  }

  const parsed = await parseResponseBody(response);
  if (!response.ok) {
    const err = normalizeError(parsed, response);
    if (API_CONFIG.isProd) logger.error(err.message);
    throw new ApiError(err.message, err.status);
  }
  return parsed as T;
}

async function requestCanonical<T>(path: string, options?: RequestOptions): Promise<T> {
  assertProductionBackendUrl(path);
  const { params, body, ...fetchOptions } = options ?? {};
  const hasBody = body !== undefined;
  const auth = await getRequestAuth();
  const headers = { ...buildBaseHeaders(hasBody, fetchOptions.headers), ...auth.headers };
  const url = buildUrl(path, params);

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      method: fetchOptions.method ?? 'GET',
      credentials: auth.credentials,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (isNetworkError(err)) {
      throw new ApiError(
        `Network error: could not reach the server. Check backend URL (VITE_APP_BACKEND_URL), CORS (allow your frontend origin), and that the server is running. URL: ${url}`,
        0,
        { code: 'NETWORK_ERROR' }
      );
    }
    throw err;
  }

  const parsed = await parseResponseBody(response);

  if (!response.ok) {
    const err = normalizeError(parsed, response);
    if (API_CONFIG.isProd) logger.error(err.message);
    throw new ApiError(err.message, response.status, { code: err.code });
  }

  if (typeof parsed !== 'object' || parsed === null || typeof (parsed as ApiResponse<unknown>).success !== 'boolean') {
    throw new ApiError(
      'Invalid API response: missing boolean success field. Backend must return ApiResponse wrapper.',
      response.status,
      { code: 'INVALID_RESPONSE_FORMAT' }
    );
  }

  const apiResponse = parsed as ApiResponse<T>;
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
