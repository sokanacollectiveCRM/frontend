import { buildUrl, fetchWithAuth } from '@/api/http';

/**
 * One row per invoice that has at least one payment matching by amount.
 * Keys are snake_case as returned by the API.
 */
export interface ReconciliationRow {
  invoice_id: string;
  invoice_number: string;
  invoice_customer: string;
  invoice_amount: number;
  /** Normalized status for logic/filtering: "paid" or "pending". */
  invoice_status: string;
  /** Raw status from invoice table for display: e.g. PAID, PENDING, PARTIAL. */
  invoice_status_raw?: string | null;
  invoice_created_at: string | null;
  invoice_due_date: string | null;
  match_type: 'amount_only' | 'amount_and_customer';
  payment_ids: string[];
  payment_customers: string[];
  payment_amounts: number[];
  payment_created_dates: (string | null)[];
}

/**
 * Reconciliation summary: invoice totals (phi_invoices) and payment totals (payments table).
 * All fields optional for backward compatibility with older API responses.
 */
export interface ReconciliationSummary {
  /** Invoices */
  total_invoice_amount?: number;
  total_invoice_count?: number;
  total_pending_amount?: number;
  total_paid_amount?: number;
  total_pending_count?: number;
  total_paid_count?: number;
  /** Payments */
  payment_total_amount?: number;
  payment_count?: number;
  payment_total_pending_amount?: number;
  payment_total_paid_amount?: number;
  payment_pending_count?: number;
  payment_paid_count?: number;
}

export interface ReconciliationApiResponse {
  success: boolean;
  data: ReconciliationRow[];
  summary: ReconciliationSummary;
}

export interface ReconciliationParams {
  limit?: number;
  invoice_status?: string;
  date_from?: string;
  date_to?: string;
}

/**
 * Fetch reconciliation data from GET /api/financial/reconciliation.
 * Auth: same as other financial endpoints (cookie or Bearer; admin/doula).
 */
export async function getReconciliation(
  params?: ReconciliationParams
): Promise<ReconciliationApiResponse> {
  const query: Record<string, string | number> = {};
  if (params?.limit != null) query.limit = params.limit;
  if (params?.invoice_status) query.invoice_status = params.invoice_status;
  if (params?.date_from) query.date_from = params.date_from;
  if (params?.date_to) query.date_to = params.date_to;

  const url = buildUrl('/api/financial/reconciliation', query);
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const json = (await response.json()) as ReconciliationApiResponse & { error?: string };
  if (!response.ok || !json.success) {
    throw new Error(json.error ?? 'Reconciliation failed');
  }
  return json;
}

/**
 * Download reconciliation as CSV using the same query params.
 * Fetches GET /api/financial/reconciliation/csv (or ?format=csv) and triggers download.
 */
export async function downloadReconciliationCsv(params?: ReconciliationParams): Promise<void> {
  const query: Record<string, string | number> = {};
  if (params?.limit != null) query.limit = params.limit;
  if (params?.invoice_status) query.invoice_status = params.invoice_status;
  if (params?.date_from) query.date_from = params.date_from;
  if (params?.date_to) query.date_to = params.date_to;

  const url = buildUrl('/api/financial/reconciliation/csv', query);
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to download CSV');

  const blob = await response.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'reconciliation.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
