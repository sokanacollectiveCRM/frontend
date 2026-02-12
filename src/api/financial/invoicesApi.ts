import { buildUrl, fetchWithAuth } from '@/api/http';

/**
 * Invoice row from Cloud SQL phi_invoices (GET /api/invoices).
 * Backend returns snake_case; auth required (admin or doula).
 */
export interface InvoiceRow {
  id: string;
  client_id?: string | null;
  client_name?: string | null;
  customer_name?: string | null;
  status?: string | null;
  paid_total_amount?: number | string | null;
  total_amount?: number | string | null;
  invoice_number?: string | null;
  due_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

function normalizeInvoicesList(data: unknown): InvoiceRow[] {
  let list: unknown[] = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) list = obj.data;
  }
  return list.map((row: unknown) => ({ ...(row as object) })) as InvoiceRow[];
}

/**
 * Fetch invoices from Cloud SQL (GET /api/invoices).
 * Backend returns { success: true, data: InvoiceRow[] }. Supports ?limit=.
 * Auth: same as payments (Bearer or cookie). Roles: admin or doula.
 * On 404 or failure returns empty array.
 */
export async function getInvoicesList(params?: { limit?: number }): Promise<InvoiceRow[]> {
  try {
    const url = buildUrl('/api/invoices', params ? { limit: params.limit } : undefined);
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) return [];
      const text = await response.text();
      throw new Error(text || `Invoices list ${response.status}`);
    }

    const raw = await response.json();
    return normalizeInvoicesList(raw);
  } catch {
    return [];
  }
}

/** Fetch raw JSON from GET /api/invoices (full response envelope + data). Use to inspect all backend fields. */
export async function getInvoicesRaw(params?: { limit?: number }): Promise<unknown> {
  const url = buildUrl('/api/invoices', params ? { limit: params.limit } : undefined);
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Invoices ${response.status}`);
  return response.json();
}
