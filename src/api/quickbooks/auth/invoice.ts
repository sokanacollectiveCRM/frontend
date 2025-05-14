const API_BASE = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050'

// src/api/quickbooks/invoice.ts

export interface InvoiceItem {
  name: string
  qty: number
  rate: number
}

export interface CreateInvoiceParams {
  qbCustomerId: string
  items: InvoiceItem[]
}

/**
 * Create a new QuickBooks invoice & send it.
 * @returns the invoice ID and status
 */
export async function createQuickBooksInvoice(
  params: CreateInvoiceParams
): Promise<{ invoiceId: string; status: string }> {
  const res = await fetch(`${API_BASE}/quickbooks/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create invoice: ${err}`)
  }
  return await res.json()
}