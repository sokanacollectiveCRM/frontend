import { useEffect, useState } from 'react';
import { PaymentSummary } from '../types/payment';
import { fetchPaymentDetails, validateContractId } from '../utils/paymentApi';

interface UsePaymentDetailsReturn {
  paymentDetails: PaymentSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePaymentDetails = (contractId: string | null): UsePaymentDetailsReturn => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!contractId) {
      setError('Contract ID is required');
      return;
    }

    if (!validateContractId(contractId)) {
      setError('Invalid contract ID format');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const details = await fetchPaymentDetails(contractId);
      setPaymentDetails(details);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment details';
      setError(errorMessage);
      console.error('Payment details fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [contractId]);

  return {
    paymentDetails,
    loading,
    error,
    refetch: fetchDetails,
  };
};
