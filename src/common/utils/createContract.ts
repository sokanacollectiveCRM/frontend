import { Client } from '@/features/clients/data/schema';

// New contract generation API interfaces
export interface ContractData {
  clientName: string;
  clientEmail: string;
  totalInvestment: string;  // Format: "$2,500"
  depositAmount: string;    // Format: "$500"
  serviceType: 'Labor Support Services' | 'Postpartum Doula Services';
  remainingBalance?: string;  // Optional - auto-calculated if not provided
  contractDate?: string;     // Optional - auto-generated if not provided
  dueDate?: string;         // Optional - auto-calculated if not provided
  startDate?: string;        // Optional - auto-generated if not provided
  endDate?: string;         // Optional - auto-calculated if not provided
  // Postpartum-specific fields
  totalHours?: string;       // Total hours for Postpartum contracts
  hourlyRate?: string;       // Hourly rate for Postpartum contracts
  overnightFee?: string;     // Overnight fee for Postpartum contracts
}

export interface ContractResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    contractId: string;
    clientName: string;
    clientEmail: string;
    docxPath: string;
    pdfPath: string;
    signNow: {
      documentId: string;
      invitationSent: boolean;
      status: string;
    };
    emailDelivery: {
      provider: string;
      sent: boolean;
      message: string;
    };
  };
}

// Legacy contract calculation interface (for backward compatibility)
export interface ContractInput {
  contract_type?: 'labor_support' | 'postpartum' | 'combined';
  // Labor Support fields
  labor_support_amount?: number;
  // Postpartum fields
  total_hours?: number;
  hourly_rate?: number;
  // Payment plan fields (optional for postpartum-only contracts)
  deposit_type?: 'percent' | 'flat';
  deposit_value?: number;
  installments_count?: number;
  cadence?: 'monthly' | 'biweekly';
  total_amount?: number; // Optional total amount for backend validation
}

export interface ClientInfo {
  email: string;
  name: string;
}

// New contract generation function
export async function generateContract(contractData: ContractData): Promise<ContractResponse> {
  console.log('🔍 API Request Debug:');
  console.log('- Contract data being sent:', contractData);
  console.log('- JSON stringified body:', JSON.stringify(contractData));
  console.log('- Body keys:', Object.keys(contractData));
  console.log('- Postpartum fields check:');
  console.log('  - totalHours:', contractData.totalHours);
  console.log('  - hourlyRate:', contractData.hourlyRate);
  console.log('  - overnightFee:', contractData.overnightFee);
  console.log('  - serviceType:', contractData.serviceType);
  
  const requestBody = JSON.stringify(contractData);
  console.log('🔍 Final HTTP Request Body:');
  console.log('- Request body:', requestBody);
  console.log('- Request body includes totalHours:', requestBody.includes('totalHours'));
  console.log('- Request body includes hourlyRate:', requestBody.includes('hourlyRate'));
  console.log('- Request body includes overnightFee:', requestBody.includes('overnightFee'));
  
  const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/contract-signing/generate-contract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: requestBody
  });
  
  if (!response.ok) {
    throw new Error(`Contract generation failed: ${response.statusText}`);
  }
  
  return await response.json();
}

// Helper function to convert service type to backend format
function getServiceTypeName(contractType?: string): string {
  switch (contractType) {
    case 'Labor Support Services':
      return 'Labor Support Services';
    case 'Postpartum Doula Services':
      return 'Postpartum Doula Services';
    default:
      return 'Labor Support Services';
  }
}

// Helper function to get service end date
function getServiceEndDate(_contractType?: string): string {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 90); // 90 days from now
  return endDate.toISOString().split('T')[0];
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
  console.log('🔍 Sending to backend:', contractInput);
  console.log('🔍 Backend URL:', `${import.meta.env.VITE_APP_BACKEND_URL}/api/contract/postpartum/calculate`);
  
  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/contract/postpartum/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(contractInput),
  });

  const data = await res.json();
  console.log('🔍 Backend response:', { status: res.status, data });
  
  if (!res.ok) {
    console.error('🔍 Backend error details:', data);
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
      // Basic client info
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      
      // Contract amounts
      totalInvestment: `$${calculationResponse.amounts.total_amount.toFixed(2)}`,
      depositAmount: `$${calculationResponse.amounts.deposit_amount.toFixed(2)}`,
      
      // Complete contract data
      contractData: {
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        serviceType: getServiceTypeName(contractInput.contract_type),
        serviceHours: contractInput.total_hours?.toString() || '0',
        hourlyRate: contractInput.hourly_rate?.toString() || '0',
        serviceDeposit: `$${calculationResponse.amounts.deposit_amount.toFixed(2)}`,
        totalAmount: `$${calculationResponse.amounts.total_amount.toFixed(2)}`,
        serviceStartDate: new Date().toISOString().split('T')[0],
        serviceEndDate: getServiceEndDate(contractInput.contract_type),
        date: new Date().toISOString().split('T')[0],
        
        // Additional contract details
        contractType: contractInput.contract_type,
        laborSupportAmount: contractInput.labor_support_amount?.toString() || '0',
        depositType: contractInput.deposit_type || 'percent',
        depositValue: contractInput.deposit_value?.toString() || '0',
        installmentsCount: contractInput.installments_count?.toString() || '0',
        cadence: contractInput.cadence || 'monthly',
        paymentSchedule: calculationResponse.amounts.installments_amounts || []
      }
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
