import { buildUrl, fetchWithAuth } from '@/api/http';

export interface IntuitTokenizationInput {
  clientId: string;
  cardNumber: string;
  expiration: string;
  cvc: string;
  cardholderName: string;
  billingAddress1: string;
  billingAddress2?: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
}

export interface PaymentMethodMetadata {
  client_id: string;
  quickbooks_customer_id?: string | null;
  provider_payment_method_reference?: string | null;
  card_brand?: string | null;
  last4?: string | null;
  exp_month?: number | null;
  exp_year?: number | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type PaymentMethodRequestId = string;

export interface PaymentMethodSaveRequest {
  client_id: string;
  intuit_token: string;
  request_id: PaymentMethodRequestId;
  ui_metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface PaymentMethodQueryRequest {
  clientId: string;
}

export interface TokenizationOptions {
  endpoint: string;
  fetchImpl?: typeof fetch;
}

export interface PaymentMethodRequestOptions {
  endpoints?: string[];
  requestImpl?: typeof fetchWithAuth;
}

export interface PaymentMethodApiErrorDetails {
  fieldErrors?: Record<string, string | string[] | undefined>;
  fields?: Record<string, string | string[] | undefined>;
  errors?: Record<string, string | string[] | undefined>;
  [key: string]: unknown;
}

export type PaymentMethodErrorCode =
  | 'validation_error'
  | 'unauthorized'
  | 'forbidden'
  | 'client_not_found'
  | 'quickbooks_not_connected'
  | 'invalid_token'
  | 'expired_token'
  | 'duplicate_request'
  | 'provider_timeout'
  | 'provider_save_failure'
  | 'database_persistence_failure'
  | 'payment_method_not_found'
  | string;

export class PaymentMethodApiError extends Error {
  status: number;
  code?: PaymentMethodErrorCode;
  details?: PaymentMethodApiErrorDetails;

  constructor(message: string, status: number, code?: PaymentMethodErrorCode, details?: PaymentMethodApiErrorDetails) {
    super(message);
    this.name = 'PaymentMethodApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  code?: PaymentMethodErrorCode;
  details?: PaymentMethodApiErrorDetails;
  fieldErrors?: Record<string, string | string[] | undefined>;
  fields?: Record<string, string | string[] | undefined>;
  errors?: Record<string, string | string[] | undefined>;
};

const PAYMENT_METHOD_ENDPOINTS = [
  '/api/payment-methods',
  '/api/quickbooks/payment-methods',
  '/quickbooks/payment-methods',
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function createPaymentMethodRequestId(): string {
  const cryptoObj = globalThis.crypto as Crypto | undefined;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function parseExpiration(expiration: string): { exp_month: string; exp_year: string } | null {
  const trimmed = expiration.trim();
  const match = trimmed.match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const yearValue = match[2];
  const year = Number(yearValue.length === 2 ? `20${yearValue}` : yearValue);

  if (!Number.isFinite(month) || month < 1 || month > 12) return null;
  if (!Number.isFinite(year) || year < 2000) return null;

  return {
    exp_month: String(month).padStart(2, '0'),
    exp_year: String(year),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return null as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

function normalizeErrorDetails(parsed: unknown): PaymentMethodApiErrorDetails | undefined {
  if (!isRecord(parsed)) return undefined;
  const details =
    (isRecord(parsed.details) ? (parsed.details as PaymentMethodApiErrorDetails) : undefined) ??
    (isRecord(parsed.fieldErrors)
      ? ({ fieldErrors: parsed.fieldErrors } as PaymentMethodApiErrorDetails)
      : undefined) ??
    (isRecord(parsed.fields) ? ({ fields: parsed.fields } as PaymentMethodApiErrorDetails) : undefined) ??
    (isRecord(parsed.errors) ? ({ errors: parsed.errors } as PaymentMethodApiErrorDetails) : undefined);
  return details;
}

function normalizeError(
  response: Response,
  parsed: unknown
): PaymentMethodApiError {
  const message =
    isRecord(parsed) && isNonEmptyString(parsed.error)
      ? parsed.error
      : isRecord(parsed) && isNonEmptyString(parsed.message)
        ? parsed.message
        : response.statusText || 'Request failed';
  const code =
    isRecord(parsed) && typeof parsed.code === 'string' ? (parsed.code as PaymentMethodErrorCode) : undefined;
  const details = normalizeErrorDetails(parsed);
  return new PaymentMethodApiError(String(message), response.status, code, details);
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizePaymentMethodMetadata(value: unknown): PaymentMethodMetadata | null {
  if (!isRecord(value)) return null;

  const clientId = value.client_id;
  if (!isNonEmptyString(clientId)) return null;

  return {
    client_id: clientId,
    quickbooks_customer_id: isNonEmptyString(value.quickbooks_customer_id) ? value.quickbooks_customer_id : null,
    provider_payment_method_reference: isNonEmptyString(value.provider_payment_method_reference)
      ? value.provider_payment_method_reference
      : null,
    card_brand: isNonEmptyString(value.card_brand) ? value.card_brand : null,
    last4: isNonEmptyString(value.last4) ? value.last4 : null,
    exp_month: coerceNumber(value.exp_month),
    exp_year: coerceNumber(value.exp_year),
    status: isNonEmptyString(value.status) ? value.status : null,
    created_at: isNonEmptyString(value.created_at) ? value.created_at : null,
    updated_at: isNonEmptyString(value.updated_at) ? value.updated_at : null,
  };
}

function shouldFallbackToAlias(error: PaymentMethodApiError): boolean {
  return error.status === 404 || error.status === 405;
}

function extractData<T>(parsed: unknown): T | null {
  if (!isRecord(parsed)) return null;
  if ('data' in parsed && parsed.data !== undefined) {
    return parsed.data as T;
  }
  if (parsed.success === false) return null;
  return parsed as T;
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  requestImpl: typeof fetchWithAuth = fetchWithAuth
): Promise<T> {
  const response = await requestImpl(buildUrl(path), init);
  const parsed = await parseResponse<ApiEnvelope<T> | T | string>(response);

  if (!response.ok) {
    throw normalizeError(response, parsed);
  }

  const data = extractData<T>(parsed);
  if (data === null) {
    throw new PaymentMethodApiError('Invalid payment method response format', response.status);
  }
  return data;
}

async function requestWithFallback<T>(
  paths: string[],
  initFactory: (path: string) => RequestInit,
  requestImpl: typeof fetchWithAuth = fetchWithAuth
): Promise<T> {
  let lastError: PaymentMethodApiError | null = null;

  for (const path of paths) {
    try {
      return await requestJson<T>(path, initFactory(path), requestImpl);
    } catch (error) {
      const apiError = error instanceof PaymentMethodApiError ? error : new PaymentMethodApiError(String(error), 0);
      lastError = apiError;
      if (!shouldFallbackToAlias(apiError)) {
        throw apiError;
      }
    }
  }

  throw lastError ?? new PaymentMethodApiError('Payment method request failed', 0);
}

export async function tokenizeIntuitCard(
  input: IntuitTokenizationInput,
  options: TokenizationOptions
): Promise<string> {
  if (!options.endpoint) {
    throw new PaymentMethodApiError('Missing Intuit tokenization endpoint.', 0);
  }

  const parsedExpiration = parseExpiration(input.expiration);
  if (!parsedExpiration) {
    throw new PaymentMethodApiError('Invalid expiration date.', 400, 'validation_error');
  }

  const response = await (options.fetchImpl ?? fetch)(options.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'omit',
    body: JSON.stringify({
      client_id: input.clientId,
      cardholder_name: input.cardholderName,
      card_number: input.cardNumber,
      cvc: input.cvc,
      exp_month: parsedExpiration.exp_month,
      exp_year: parsedExpiration.exp_year,
      billing_address: {
        line1: input.billingAddress1,
        line2: input.billingAddress2 || undefined,
        city: input.billingCity,
        state: input.billingState,
        postal_code: input.billingPostalCode,
        country: input.billingCountry,
      },
    }),
  });

  const parsed = await parseResponse<{ token?: unknown; data?: { token?: unknown } } | string>(response);
  if (!response.ok) {
    const message =
      response.status >= 500 ? 'The payment service is temporarily unavailable. Please try again.' : 'We could not complete the request. Please try again.';
    throw new PaymentMethodApiError(message, response.status);
  }

  const token =
    isRecord(parsed) && typeof parsed.token === 'string'
      ? parsed.token
      : isRecord(parsed) && isRecord(parsed.data) && typeof parsed.data.token === 'string'
        ? parsed.data.token
        : null;

  if (!token) {
    throw new PaymentMethodApiError('The payment service did not return a token.', 502);
  }

  return token;
}

export async function savePaymentMethod(
  input: PaymentMethodSaveRequest,
  options?: PaymentMethodRequestOptions
): Promise<PaymentMethodMetadata> {
  const requestImpl = options?.requestImpl ?? fetchWithAuth;
  const endpoints = options?.endpoints?.length ? options.endpoints : PAYMENT_METHOD_ENDPOINTS;

  const data = await requestWithFallback<unknown>(
    endpoints,
    (path) => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(input),
    }),
    requestImpl
  );

  const normalized = normalizePaymentMethodMetadata(data);
  if (!normalized) {
    throw new PaymentMethodApiError('The card was saved, but the response format was not recognized.', 502);
  }

  return normalized;
}

export async function getPaymentMethod(
  input: PaymentMethodQueryRequest,
  options?: PaymentMethodRequestOptions
): Promise<PaymentMethodMetadata | null> {
  const requestImpl = options?.requestImpl ?? fetchWithAuth;
  const endpoints = options?.endpoints?.length
    ? options.endpoints
    : PAYMENT_METHOD_ENDPOINTS.map((path) => `${path}/${encodeURIComponent(input.clientId)}`);

  let lastError: PaymentMethodApiError | null = null;

  for (const path of endpoints) {
    try {
      const data = await requestJson<unknown>(
        path,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        },
        requestImpl
      );
      const normalized = normalizePaymentMethodMetadata(data);
      if (!normalized) {
        throw new PaymentMethodApiError('The payment method response format was not recognized.', 502);
      }
      return normalized;
    } catch (error) {
      const apiError = error instanceof PaymentMethodApiError ? error : new PaymentMethodApiError(String(error), 0);
      if (apiError.code === 'payment_method_not_found' || apiError.status === 404) {
        // If the backend explicitly says no payment method exists, do not hide it behind alias fallback.
        if (apiError.code === 'payment_method_not_found') return null;
      }
      lastError = apiError;
      if (!shouldFallbackToAlias(apiError)) {
        throw apiError;
      }
    }
  }

  if (lastError && lastError.code === 'payment_method_not_found') {
    return null;
  }

  throw lastError ?? new PaymentMethodApiError('Payment method request failed', 0);
}

// Backwards-compatible aliases for existing imports/tests.
export type QuickBooksCardTokenizationInput = IntuitTokenizationInput;
export type QuickBooksSavedCardMetadata = PaymentMethodMetadata;
export type QuickBooksTokenizationOptions = TokenizationOptions;
export type QuickBooksSaveOptions = PaymentMethodRequestOptions;

export async function tokenizeQuickBooksCard(
  input: QuickBooksCardTokenizationInput,
  options: QuickBooksTokenizationOptions
): Promise<string> {
  return tokenizeIntuitCard(input, options);
}

export async function saveQuickBooksCard(
  input: { clientId: string; token: string },
  options: QuickBooksSaveOptions
): Promise<QuickBooksSavedCardMetadata> {
  return savePaymentMethod(
    {
      client_id: input.clientId,
      intuit_token: input.token,
      request_id: createPaymentMethodRequestId(),
    },
    options
  );
}

export function parsePaymentMethodMetadata(value: unknown): PaymentMethodMetadata | null {
  return normalizePaymentMethodMetadata(value);
}
