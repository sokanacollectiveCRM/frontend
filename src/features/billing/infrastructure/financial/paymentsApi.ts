import { buildUrl, fetchWithAuth } from '@/api/http';

/**
 * Payment row from payments table. Backend returns snake_case;
 * amount may be string (e.g. "125") or number; id may be number.
 * invoice_id links to phi_invoices; invoice is display number/reference.
 */
export interface PaymentRow {
  id: string | number;
  amount: number | string;
  status: string;
  payment_type?: string;
  type?: string;
  created_at?: string;
  client_id?: string | null;
  client_name?: string | null;
  customer_name?: string | null;
  description?: string | null;
  contract_id?: string | null;
  invoice_id?: string | null;
  invoice?: string | null;
  currency?: string;
  [key: string]: unknown;
}

function normalizePaymentsList(data: unknown): PaymentRow[] {
  let list: unknown[] = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) list = obj.data;
    else if (Array.isArray(obj.payments)) list = obj.payments;
  }
  return list.map((row: unknown) => {
    const r = row as Record<string, unknown>;
    return {
      ...r,
      id: r.id ?? '',
      amount: r.amount !== undefined && r.amount !== null ? r.amount : 0,
    } as PaymentRow;
  });
}

/**
 * Fetch payments for financial view (admin). Uses GET /api/payments.
 * Backend returns { success: true, data: PaymentRow[] }. Supports ?limit=.
 * On 404 or failure returns empty array (no error thrown).
 */
export async function getPaymentsList(params?: { limit?: number }): Promise<PaymentRow[]> {
  try {
    const url = buildUrl('/api/payments', params ? { limit: params.limit } : undefined);
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) return [];
      const text = await response.text();
      throw new Error(text || `Payments list ${response.status}`);
    }

    const raw = await response.json();
    return normalizePaymentsList(raw);
  } catch {
    return [];
  }
}

/** Fetch raw JSON from GET /api/payments (full response envelope + data). Use to inspect all backend fields. */
export async function getPaymentsRaw(params?: { limit?: number }): Promise<unknown> {
  const url = buildUrl('/api/payments', params ? { limit: params.limit } : undefined);
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Payments ${response.status}`);
  return response.json();
}
