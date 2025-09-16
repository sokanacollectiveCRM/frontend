export interface PaymentSummary {
  contract_id?: string;
  total_amount: number;
  total_paid: number;
  total_due: number;
  overdue_amount: number;
  next_payment_due: string;
  next_payment_amount: number;
  payment_count: number;
  overdue_count: number;
  installments?: Installment[];
}

export interface Installment {
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface PaymentIntent {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: PaymentSummary | PaymentIntent;
  error?: string;
}

export interface PaymentFormData {
  cardholderName: string;
  email: string;
}
