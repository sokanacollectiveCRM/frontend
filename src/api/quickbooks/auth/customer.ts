// src/api/quickbooks/auth/customer.ts
import { withTokenRefresh } from './utils';

const API_BASE =
  import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

export interface CreateCustomerParams {
  internalCustomerId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface InvoiceableCustomer {
  id: string;
  qboCustomerId: string; // ← drop the `?`
  name: string;
  email: string;
}
/**
 * Create or sync a CRM user as a QuickBooks customer.
 */
export async function createQuickBooksCustomer(
  params: CreateCustomerParams
): Promise<{ qbCustomerId: string }> {

  return withTokenRefresh(async () => {
    const res = await fetch(`${API_BASE}/quickbooks/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
export async function getInvoiceableCustomers(): Promise<
  InvoiceableCustomer[]
> {

  return withTokenRefresh(async () => {
    const res = await fetch(`${API_BASE}/quickbooks/customers/invoiceable`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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

export interface QuickBooksCustomer {
  Id: string;
  DisplayName: string;
  GivenName?: string;
  FamilyName?: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  PrimaryPhone?: {
    FreeFormNumber?: string;
  };
  Balance?: number;
  BalanceWithJobs?: number;
  Active?: boolean;
}

/**
 * Fetch all customers from QuickBooks Online.
 * @param maxResults - Maximum number of customers to return (default: 100)
 */
export async function getQuickBooksCustomers(
  maxResults?: number
): Promise<QuickBooksCustomer[]> {

  return withTokenRefresh(async () => {
    const url = maxResults
      ? `${API_BASE}/quickbooks/customers?maxResults=${maxResults}`
      : `${API_BASE}/quickbooks/customers`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      // Handle 404 as "no customers found" - return empty array instead of error
      if (res.status === 404) {
        return [];
      }

      let errorMessage = 'Failed to fetch customers from QuickBooks';
      try {
        const err = await res.text();
        if (err) {
          // Check if it's an HTML error page (like "Cannot GET /quickbooks/customers")
          if (err.includes('<!DOCTYPE html>') || err.includes('Cannot GET')) {
            // Treat as no customers found
            return [];
          }
          try {
            const errorData = JSON.parse(err);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            // If it's not JSON and not HTML, use the text as error
            if (!err.includes('<html>')) {
              errorMessage = err;
            } else {
              // HTML error page - treat as no customers found
              return [];
            }
          }
        }
      } catch {
        // Use default error message
      }
      throw new Error(errorMessage);
    }
    return res.json();
  });
}