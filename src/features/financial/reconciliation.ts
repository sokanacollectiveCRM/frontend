import type { InvoiceRow } from '@/api/financial/invoicesApi';
import type { PaymentRow } from '@/api/financial/paymentsApi';

function invoiceAmount(inv: InvoiceRow): number {
  const v = inv.paid_total_amount ?? inv.total_amount;
  if (v == null) return 0;
  return Number(v);
}

function paymentAmount(p: PaymentRow): number {
  const v = p.amount;
  if (v == null) return 0;
  return Number(v);
}

function invoiceCustomer(inv: InvoiceRow): string {
  const s = inv.client_name ?? inv.customer_name ?? '';
  return String(s).trim().toLowerCase();
}

function paymentCustomer(p: PaymentRow): string {
  const s = p.client_name ?? p.customer_name ?? (p as Record<string, unknown>).client_name;
  return String(s ?? '').trim().toLowerCase();
}

/** Amounts match when equal (rounded to 2 decimals for float safety) */
function amountsMatch(a: number, b: number): boolean {
  return Math.abs(round2(a) - round2(b)) < 0.01;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface ReconciliationRow {
  invoice_id: string;
  invoice_number: string;
  invoice_customer: string;
  invoice_amount: number;
  payment_ids: string[];
  payment_customers: string[];
  payment_amounts: number[];
  match_type: 'amount_only' | 'amount_and_customer';
}

/**
 * Match invoices to payments by amount. For each invoice, find payments with the same amount.
 * When a payment also has the same customer name (invoice has client_name/customer_name), mark as amount_and_customer.
 */
export function reconcileInvoicesToPayments(
  invoices: InvoiceRow[],
  payments: PaymentRow[]
): ReconciliationRow[] {
  const rows: ReconciliationRow[] = [];

  for (const inv of invoices) {
    const invAmt = invoiceAmount(inv);
    const invCustomer = invoiceCustomer(inv);

    const byAmount = payments.filter((p) => amountsMatch(paymentAmount(p), invAmt));
    const byAmountAndCustomer = byAmount.filter(
      (p) => paymentCustomer(p) && invCustomer && paymentCustomer(p) === invCustomer
    );

    const matchedPayments =
      byAmountAndCustomer.length > 0 ? byAmountAndCustomer : byAmount;
    const match_type: ReconciliationRow['match_type'] =
      byAmountAndCustomer.length > 0 ? 'amount_and_customer' : 'amount_only';

    rows.push({
      invoice_id: inv.id,
      invoice_number: inv.invoice_number ?? inv.id,
      invoice_customer: inv.client_name ?? inv.customer_name ?? '—',
      invoice_amount: invAmt,
      payment_ids: matchedPayments.map((p) => String(p.id)),
      payment_customers: matchedPayments.map((p) =>
        paymentCustomer(p) ? (p.client_name ?? p.customer_name ?? '') : '—'
      ),
      payment_amounts: matchedPayments.map((p) => paymentAmount(p)),
      match_type,
    });
  }

  return rows;
}

/** Build a CSV string for the reconciliation report (for client download). */
export function reconciliationToCsv(rows: ReconciliationRow[]): string {
  const header =
    'Invoice ID,Invoice #,Invoice Customer,Invoice Amount,Match Type,Payment ID(s),Payment Customer(s),Payment Amount(s)';
  const escape = (s: string | number) => {
    const t = String(s);
    if (t.includes(',') || t.includes('"') || t.includes('\n'))
      return `"${t.replace(/"/g, '""')}"`;
    return t;
  };
  const line = (r: ReconciliationRow) =>
    [
      escape(r.invoice_id),
      escape(r.invoice_number),
      escape(r.invoice_customer),
      r.invoice_amount.toFixed(2),
      r.match_type,
      escape(r.payment_ids.join('; ')),
      escape(r.payment_customers.join('; ')),
      r.payment_amounts.map((a) => a.toFixed(2)).join('; '),
    ].join(',');
  return [header, ...rows.map(line)].join('\n');
}
