import { get } from '@/api/http';
import type {
  LimitedContractBillingSummary,
  LimitedContractPaymentSchedule,
} from '@/features/billing-portal/types';

export async function getLimitedBillingContracts(): Promise<LimitedContractBillingSummary[]> {
  return get<LimitedContractBillingSummary[]>('/api/billing/contracts');
}

export async function getLimitedContractPaymentSchedule(
  contractId: string
): Promise<LimitedContractPaymentSchedule> {
  return get<LimitedContractPaymentSchedule>(`/api/billing/contracts/${contractId}`);
}
