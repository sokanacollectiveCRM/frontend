// src/api/payments/stripe.ts
const API_BASE =
  import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

export interface StoredCard {
  id: string;
  stripePaymentMethodId: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface StoreCardResponse {
  success: boolean;
  data?: StoredCard;
  error?: string;
}

export interface GetCardsResponse {
  success: boolean;
  data?: StoredCard[];
  error?: string;
}

export interface UpdateCardResponse {
  success: boolean;
  data?: StoredCard;
  error?: string;
}

export interface ChargeCardRequest {
  amount: number; // in cents
  description: string;
}

export interface ChargeCardResponse {
  success: boolean;
  data?: {
    id: string;
    amount: number;
    status: string;
    description: string;
    created: number;
  };
  error?: string;
}

export interface StoreCardRequest {
  cardToken: string;
}

export interface UpdateCardRequest {
  cardToken: string;
}

/**
 * Store a card on file for the authenticated user
 */
export async function storeCard(
  customerId: string,
  cardToken: string
): Promise<StoredCard> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const response = await fetch(
    `${API_BASE}/api/payments/customers/${customerId}/cards`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardToken }),
    }
  );

  const result: StoreCardResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to store card');
  }

  if (!result.data) {
    throw new Error('No card data returned from server');
  }

  return result.data;
}

/**
 * Update an existing card with a new card token
 */
export async function updateCard(
  customerId: string,
  paymentMethodId: string,
  cardToken: string
): Promise<StoredCard> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const response = await fetch(
    `${API_BASE}/api/payments/customers/${customerId}/cards/${paymentMethodId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardToken }),
    }
  );

  const result: UpdateCardResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to update card');
  }

  if (!result.data) {
    throw new Error('No card data returned from server');
  }

  return result.data;
}

/**
 * Charge a customer's default payment method (Admin only)
 */
export async function chargeCard(
  customerId: string,
  amount: number,
  description: string
): Promise<any> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const response = await fetch(
    `${API_BASE}/api/payments/customers/${customerId}/charge`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, description }),
    }
  );

  const result: ChargeCardResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to charge card');
  }

  return result.data;
}

/**
 * Get all stored cards for the authenticated user
 */
export async function getStoredCards(
  customerId: string
): Promise<StoredCard[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const response = await fetch(
    `${API_BASE}/api/payments/customers/${customerId}/cards`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const result: GetCardsResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch stored cards');
  }

  return result.data || [];
}

/**
 * Delete a stored card
 */
export async function deleteStoredCard(
  customerId: string,
  cardId: string
): Promise<void> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const response = await fetch(
    `${API_BASE}/api/payments/customers/${customerId}/cards/${cardId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to delete card');
  }
}

/**
 * Set a card as the default payment method
 */
export async function setDefaultCard(
  customerId: string,
  cardId: string
): Promise<void> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const response = await fetch(
    `${API_BASE}/api/payments/customers/${customerId}/cards/${cardId}/default`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to set default card');
  }
}

/**
 * Get all customers with Stripe customer IDs (Admin only)
 */
export async function getCustomersWithStripeId(): Promise<any[]> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated — please log in first');

  const response = await fetch(`${API_BASE}/api/payments/customers`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customers with Stripe IDs');
  }

  return await response.json();
}
