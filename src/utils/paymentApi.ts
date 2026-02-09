import { PaymentIntent, PaymentResponse, PaymentSummary } from '../types/payment';
import { buildUrl, fetchWithAuth } from '@/api/http';

export const fetchPaymentDetails = async (contractId: string): Promise<PaymentSummary> => {
  const response = await fetchWithAuth(buildUrl(`/api/stripe/contract/${contractId}/payment-summary`), {
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
  const response = await fetchWithAuth(buildUrl(`/api/stripe/contract/${contractId}/create-payment`), {
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

export const validateContractId = (contractId: string | null): boolean => {
  if (!contractId) return false;
  
  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(contractId);
};
