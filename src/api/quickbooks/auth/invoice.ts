const API_BASE = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

// QuickBooks API response type
export interface QuickBooksInvoiceResponse {
  Id: string;
  DocNumber: string;
  CustomerRef: {
    value: string;
    name: string;
  };
  TotalAmt: number;
  Balance: number;
  DueDate: string;
  Line: Array<{
    Id?: string;
    Amount: number;
    Description?: string;
    DetailType: string;
    SalesItemLineDetail?: {
      ItemRef: {
        value: string;
        name: string;
      };
      UnitPrice: number;
      Qty: number;
    };
  }>;
}

export interface InvoiceLineItem {
  DetailType: string;
  Amount: number;
  Description?: string;
  SalesItemLineDetail: {
    ItemRef: { value: string };
    UnitPrice: number;
    Qty: number;
  };
}

export interface CreateInvoiceParams {
  internalCustomerId: string;        // ← required by your backend
  lineItems: InvoiceLineItem[];
  dueDate: string;                   // ISO date string
  memo?: string;
}

/**
 * Create & send a QuickBooks invoice.
 * Automatically pulls the JWT from localStorage.
 */
export async function createQuickBooksInvoice(
  params: CreateInvoiceParams
): Promise<QuickBooksInvoiceResponse> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const res = await fetch(`${API_BASE}/quickbooks/invoice`, {
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
    throw new Error(`Failed to create invoice: ${err}`);
  }
  return res.json();
}
/**
 * Fetch all stored invoices (from your Supabase-backed endpoint).
 * Automatically pulls the JWT from localStorage.
 */
export async function getQuickBooksInvoices(): Promise<any[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const res = await fetch(`${API_BASE}/quickbooks/invoices`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
      credentials: 'include'
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch invoices: ${err}`);
  }
  return res.json();
}