// src/api/quickbooks/auth/customer.ts
import { withTokenRefresh } from './utils';

const API_BASE = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

export interface CreateCustomerParams {
  internalCustomerId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface InvoiceableCustomer {
  id: string;
  qboCustomerId: string;   // ← drop the `?`
  name: string;
  email: string;
}
/**
 * Create or sync a CRM user as a QuickBooks customer.
 */
export async function createQuickBooksCustomer(
  params: CreateCustomerParams
): Promise<{ qbCustomerId: string }> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  return withTokenRefresh(async () => {
    const res = await fetch(`${API_BASE}/quickbooks/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create customer: ${err}`);
    }
    return res.json();
  });
}

/**
 * Fetch all invoiceable customers (status = 'customer').
 */
export async function getInvoiceableCustomers(): Promise<InvoiceableCustomer[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  return withTokenRefresh(async () => {
    const res = await fetch(`${API_BASE}/quickbooks/customers/invoiceable`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch customers: ${err}`);
    }
    return res.json();
  });
}
