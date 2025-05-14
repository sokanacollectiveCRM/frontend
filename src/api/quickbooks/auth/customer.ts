const API_BASE = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050'


// src/api/quickbooks/customer.ts

export interface CreateCustomerParams {
  internalCustomerId: string
  firstName: string
  lastName: string
  email: string
}

/**
 * Create or sync a CRM user as a QuickBooks customer.
 */
export async function createQuickBooksCustomer(
  params: CreateCustomerParams
): Promise<{ qbCustomerId: string }> {
  const res = await fetch(`${API_BASE}/quickbooks/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create customer: ${err}`)
  }
  return await res.json()
}