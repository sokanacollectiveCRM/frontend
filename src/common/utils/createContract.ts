import { Client } from '@/features/clients/data/schema';

// New enhanced contract calculation interface
export interface ContractInput {
  total_hours: number;
  hourly_rate: number;
  deposit_type: 'percent' | 'flat';
  deposit_value: number;
  installments_count: number;
  cadence: 'monthly' | 'biweekly';
}

export interface ClientInfo {
  email: string;
  name: string;
}

export interface CalculatedAmounts {
  total_amount: number;
  deposit_amount: number;
  balance_amount: number;
  installments_amounts: number[];
}

export interface ContractCalculationResponse {
  success: boolean;
  amounts: CalculatedAmounts;
  fields: {
    total_hours: string;
    hourly_rate_fee: string;
    deposit: string;
    overnight_fee_amount: string;
    total_amount: string;
  };
}

export interface ContractSendResponse {
  success: boolean;
  message: string;
  amounts: CalculatedAmounts;
  envelopeId: string;
  signnow: any;
  prefilledValues: any;
}

export interface PaymentIntentResponse {
  success: boolean;
  data: {
    payment_intent_id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
    customer_email: string;
  };
}

// Calculate contract amounts using new API
export async function calculateContractAmounts(contractInput: ContractInput): Promise<ContractCalculationResponse> {
  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/contract/postpartum/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(contractInput),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to calculate contract amounts');
  }
  return data;
}

// Send contract for signature using SignNow API
export async function sendContractForSignature(
  contractInput: ContractInput,
  clientInfo: ClientInfo
): Promise<ContractSendResponse> {
  // First, we need to get the calculated amounts and fields from the calculation API
  const calculationResponse = await calculateContractAmounts(contractInput);
  
  if (!calculationResponse.success) {
    throw new Error('Failed to calculate contract amounts before sending');
  }

  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/contract-signing/generate-contract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      totalInvestment: `$${calculationResponse.amounts.total_amount.toFixed(2)}`,
      depositAmount: `$${calculationResponse.amounts.deposit_amount.toFixed(2)}`
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send contract for signature');
  }
  
  // Transform response to match expected ContractSendResponse format
  return {
    success: data.success,
    message: data.message || 'Contract sent for signature via SignNow',
    amounts: calculationResponse.amounts,
    envelopeId: data.data?.signNow?.documentId || `SN-${Date.now()}`,
    signnow: data.data?.signNow,
    prefilledValues: calculationResponse.fields
  };
}

// Create payment intent after contract signing
export async function createPaymentIntent(contractId: string): Promise<PaymentIntentResponse> {
  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/stripe/contract/${contractId}/create-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create payment intent');
  }
  return data;
}

// Legacy function for backward compatibility
export async function createContract({
  templateId,
  client,
  note,
  fee,
  deposit,
}: {
  templateId: string;
  client: Client;
  note?: string;
  fee?: string;
  deposit?: string;
}) {
  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({
      templateId: templateId,
      clientId: client.id,
      fields: {
        clientname: `${client.firstname} ${client.lastname}`,
        fee,
        deposit,
      },
      note,
      fee,
      deposit,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate contract');
  }
  return data;
}
