import { PaymentIntent, PaymentResponse, PaymentSummary } from '../types/payment';
import { buildUrl, fetchWithAuth } from '@/api/http';

export const fetchPaymentDetails = async (contractId: string): Promise<PaymentSummary> => {
  const response = await fetchWithAuth(buildUrl(`/api/contract-payment/contract/${contractId}/payment-summary`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: PaymentResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch payment details');
  }

  return data.data as PaymentSummary;
};

export const createPaymentIntent = async (contractId: string): Promise<PaymentIntent> => {
  const response = await fetchWithAuth(buildUrl(`/api/contract-payment/contract/${contractId}/create-payment`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: PaymentResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to create payment intent');
  }

  return data.data as PaymentIntent;
};

/**
 * Record a successful payment and sync to QuickBooks.
 * Call after Stripe confirmPayment succeeds. Works as a fallback when webhooks don't fire.
 */
export const recordPayment = async (paymentIntentId: string): Promise<void> => {
  const response = await fetchWithAuth(buildUrl('/api/contract-payment/record-payment'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payment_intent_id: paymentIntentId }),
  });

  const data = await response.json();

  if (!response.ok || !(data as { success?: boolean }).success) {
    throw new Error((data as { error?: string }).error || 'Failed to record payment');
  }
};

export const validateContractId = (contractId: string | null): boolean => {
  if (!contractId) return false;
  
  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(contractId);
};
