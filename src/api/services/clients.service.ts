import { get, post, put } from '../http';
import { API_CONFIG } from '../config';
import { ApiError } from '../errors';
import { extractClientList, mapClient, mapClientDetail } from '../mappers/client.mapper';
import type { ClientListItemDTO, ClientDetailDTO } from '../dto/client.dto';
import type { Client, ClientDetail } from '@/domain/client';
import { normalizeZipCode } from '@/common/utils/zipCode';
import { syncQuickBooksCustomerFromClient } from '@/common/utils/syncQuickBooksCustomer';

/**
 * Normalize API response to an array of client list DTOs.
 * Handles production responses that may return { clients: [] } or non-array data.
 */
function normalizeClientListResponse(raw: unknown): ClientListItemDTO[] {
  if (Array.isArray(raw)) return raw as ClientListItemDTO[];
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.clients)) return obj.clients as ClientListItemDTO[];
    if (Array.isArray(obj.data)) return obj.data as ClientListItemDTO[];
  }
  return [];
}

/**
 * Fetch all clients.
 *
 * - Legacy mode: get<unknown>() + extractClientList + map
 * - Canonical mode: get<ClientListItemDTO[]>() (already unwrapped) + map
 */
export async function fetchClients(): Promise<Client[]> {
  if (API_CONFIG.useLegacyApi) {
    // Legacy: response shape is unknown, extractor handles format detection
    const response = await get<unknown>('/clients');
    const dtos = extractClientList(response);
    return dtos.map(mapClient);
  } else {
    // Canonical: unwrap may return array or object; normalize so .map never throws
    const raw = await get<ClientListItemDTO[] | Record<string, unknown>>('/clients');
    const dtos = normalizeClientListResponse(raw);
    return dtos.map(mapClient);
  }
}

/**
 * Fetch a single client by ID.
 *
 * Canonical mode only - throws if legacy mode is enabled.
 * Backend returns { success: true, data: { id, first_name, last_name, email, phone_number, ... } };
 * get() returns apiResponse.data (the inner object). Defensive unwrap in case response is ever wrapped.
 */
export async function fetchClientById(id: string): Promise<ClientDetail> {
  if (API_CONFIG.useLegacyApi) {
    throw new Error('Legacy mode disabled. Set VITE_USE_LEGACY_API=false.');
  }

  const response = await get<ClientDetailDTO | { data?: ClientDetailDTO }>(`/clients/${id}`);

  const dto: ClientDetailDTO =
    response &&
    typeof response === 'object' &&
    'data' in response &&
    response.data != null &&
    typeof response.data === 'object'
      ? response.data
      : (response as ClientDetailDTO);

  return mapClientDetail(dto);
}

/**
 * Update a client's status.
 *
 * Canonical mode only - throws if legacy mode is enabled.
 */
export async function updateClientStatus(clientId: string, status: string): Promise<ClientDetail> {
  if (API_CONFIG.useLegacyApi) {
    throw new Error('Legacy mode disabled. Set VITE_USE_LEGACY_API=false.');
  }

  const dto = await put<ClientDetailDTO, { clientId: string; status: string }>(
    '/clients/status',
    { clientId, status }
  );
  const client = mapClientDetail(dto);

  if (client.status === 'matched' || (client as any).status === 'customer') {
    const syncResult = await syncQuickBooksCustomerFromClient({
      id: client.id,
      status: client.status,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
    });

    if (!syncResult.success && syncResult.error) {
      console.warn('QuickBooks customer sync skipped or failed:', syncResult.error);
    }
  }

  return client;
}

/**
 * PHI (Protected Health Information) update payload.
 * Only these fields are accepted by PUT /clients/:id/phi endpoint.
 */
export interface PhiUpdatePayload {
  // Identity
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;

  // Dates
  date_of_birth?: string;
  due_date?: string;

  // Address
  address_line1?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;

  // Clinical
  health_history?: string;
  health_notes?: string;
  allergies?: string;
  medications?: string;

  // Billing
  payment_method?: string;
  insurance?: string;
  insurance_provider?: string;
  insurance_member_id?: string;
  policy_number?: string;
  insurance_phone_number?: string;
  has_secondary_insurance?: boolean;
  secondary_insurance_provider?: string;
  secondary_insurance_member_id?: string;
  secondary_policy_number?: string;
  self_pay_card_info?: string;
}

/**
 * Response from PHI update endpoint.
 */
export interface PhiUpdateResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
  code?: string;
}

/**
 * Update a client's PHI fields (stored in Google Cloud SQL).
 *
 * This endpoint ONLY accepts PHI fields and will reject operational fields like status or service_needed.
 * Authorization: Admin or assigned doula only.
 *
 * @param clientId - Client UUID
 * @param phiData - PHI fields to update (only PHI fields allowed)
 * @returns Promise with success/error response
 * @throws ApiError if update fails or non-PHI fields are included
 */
export interface PaymentInstallment {
  id: string; installment_number: number; payment_type: string; amount: number; due_date: string | null;
  payment_status: 'upcoming' | 'pending' | 'invoiced' | 'paid' | 'overdue' | 'failed' | 'cancelled';
  qbo_invoice_status: string | null; qbo_invoice_id: string | null; payment_link: string | null;
  paid_date: string | null; is_overdue: boolean; available_action: { enabled: boolean; reason: string | null };
}

export interface CardOnFileStatus {
  required: boolean; on_file: boolean; status: 'active' | 'missing' | 'expired' | 'inactive' | 'not_required';
  quickbooks_customer_id: string | null; payment_method_reference: string | null; card_brand: string | null;
  last4: string | null; exp_month: number | null; exp_year: number | null; last_verified_at: string | null;
}

export interface GenerateInstallmentInvoiceResponse {
  installment_id: string; installment_number: number; payment_type: string; amount: number; due_date: string | null;
  qbo_invoice_id: string; payment_link: string | null; card_on_file: boolean; card_warning_included: boolean; invoice_status: string;
}

const LOCAL_BILLING_FIXTURE_CLIENT_ID = '1d981375-beeb-46e7-bf22-5d7a750eb391';
const useLocalBillingFixture = (clientId: string) =>
  import.meta.env.DEV &&
  import.meta.env.VITE_MOCK_BILLING_WORKFLOW === 'true' &&
  clientId === LOCAL_BILLING_FIXTURE_CLIENT_ID;

let localFixtureInstallments: PaymentInstallment[] = [
  {
    id: '10000000-0000-4000-8000-000000000001', installment_number: 1, payment_type: 'deposit',
    amount: 100, due_date: '2026-07-01', payment_status: 'paid', qbo_invoice_status: 'paid',
    qbo_invoice_id: 'LOCAL-DEPOSIT-001', payment_link: null, paid_date: '2026-07-01T12:00:00.000Z',
    is_overdue: false, available_action: { enabled: false, reason: 'Installment is already paid' },
  },
  {
    id: '10000000-0000-4000-8000-000000000002', installment_number: 2, payment_type: 'installment',
    amount: 450, due_date: '2026-08-15', payment_status: 'pending', qbo_invoice_status: null,
    qbo_invoice_id: null, payment_link: null, paid_date: null, is_overdue: false,
    available_action: { enabled: true, reason: null },
  },
  {
    id: '10000000-0000-4000-8000-000000000003', installment_number: 3, payment_type: 'installment',
    amount: 450, due_date: '2026-09-15', payment_status: 'upcoming', qbo_invoice_status: null,
    qbo_invoice_id: null, payment_link: null, paid_date: null, is_overdue: false,
    available_action: { enabled: false, reason: 'A prior required installment remains unpaid' },
  },
];

export const fetchClientPaymentSchedule = (clientId: string) =>
  useLocalBillingFixture(clientId)
    ? Promise.resolve(localFixtureInstallments.map((item) => ({ ...item, available_action: { ...item.available_action } })))
    : get<PaymentInstallment[]>(`/clients/${clientId}/billing/payment-schedule`);

export const fetchCardOnFileStatus = (clientId: string) =>
  useLocalBillingFixture(clientId)
    ? Promise.resolve<CardOnFileStatus>({ required: true, on_file: false, status: 'missing', quickbooks_customer_id: 'LOCAL-QBO-CUSTOMER', payment_method_reference: null, card_brand: null, last4: null, exp_month: null, exp_year: null, last_verified_at: null })
    : get<CardOnFileStatus>(`/api/payment-methods/${clientId}`);

export const generateInstallmentInvoice = (clientId: string, installmentId: string) => {
  if (useLocalBillingFixture(clientId)) {
    const installment = localFixtureInstallments.find((item) => item.id === installmentId);
    if (!installment || !installment.available_action.enabled) return Promise.reject(new Error(installment?.available_action.reason || 'Installment is not eligible'));
    const paymentLink = 'https://app.qbo.intuit.com/app/invoice';
    localFixtureInstallments = localFixtureInstallments.map((item) => item.id === installmentId
      ? { ...item, payment_status: 'invoiced', qbo_invoice_status: 'sent', qbo_invoice_id: 'LOCAL-INVOICE-002', payment_link: paymentLink, available_action: { enabled: false, reason: 'Installment is already invoiced' } }
      : item);
    return Promise.resolve({ installment_id: installment.id, installment_number: installment.installment_number, payment_type: installment.payment_type, amount: installment.amount, due_date: installment.due_date, qbo_invoice_id: 'LOCAL-INVOICE-002', payment_link: paymentLink, card_on_file: false, card_warning_included: true, invoice_status: 'sent' });
  }
  return post<GenerateInstallmentInvoiceResponse>(`/clients/${clientId}/billing/installments/${installmentId}/invoice`);
};

export async function updateClientPhi(
  clientId: string,
  phiData: PhiUpdatePayload
): Promise<PhiUpdateResponse> {
  if (API_CONFIG.useLegacyApi) {
    throw new Error('Legacy mode disabled. Set VITE_USE_LEGACY_API=false.');
  }

  try {
    const normalizedPhiData =
      Object.prototype.hasOwnProperty.call(phiData, 'zip_code')
        ? { ...phiData, zip_code: normalizeZipCode(phiData.zip_code) }
        : phiData;
    const response = await put<PhiUpdateResponse>(`/clients/${clientId}/phi`, normalizedPhiData);
    return response;
  } catch (error: unknown) {
    let message = 'Failed to update PHI fields';
    if (error instanceof ApiError) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      error: message,
    };
  }
}
