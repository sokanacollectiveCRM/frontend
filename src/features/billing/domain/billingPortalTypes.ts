export type LimitedBillingStatus =
  | 'draft'
  | 'sent'
  | 'signed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | string;

export type LimitedPaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'succeeded'
  | 'failed'
  | 'overdue'
  | string;

export interface LimitedContractInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: LimitedPaymentStatus;
  paidDate?: string | null;
  invoiceId?: string | null;
  invoiceStatus?: string | null;
  paymentIssueType?: string | null;
  paymentIssueSummary?: string | null;
}

export interface LimitedContractPaymentSchedule {
  contractId: string;
  clientName: string;
  clientEmail?: string | null;
  contractType: string;
  contractStatus: LimitedBillingStatus;
  totalAmount: number;
  depositAmount?: number | null;
  installmentCount?: number | null;
  paymentSchedule?: string | null;
  billingResponsibility?: string | null;
  paymentMethodSummary?: string | null;
  insuranceCoverageType?: string | null;
  deductiblePaymentMethod?: string | null;
  paymentIssueType?: string | null;
  paymentIssueSummary?: string | null;
  installments: LimitedContractInstallment[];
  invoiceStatus?: string | null;
  quickBooksSyncStatus?: string | null;
  createdAt?: string | null;
  sentAt?: string | null;
  signedAt?: string | null;
  limitedViewUrl?: string | null;
}

export interface LimitedContractBillingSummary {
  contractId: string;
  clientName: string;
  clientEmail?: string | null;
  contractType: string;
  contractStatus: LimitedBillingStatus;
  totalAmount: number;
  installmentCount?: number | null;
  paymentSchedule?: string | null;
  nextDueDate?: string | null;
  billingResponsibility?: string | null;
  paymentMethodSummary?: string | null;
  insuranceCoverageType?: string | null;
  deductiblePaymentMethod?: string | null;
  paymentIssueType?: string | null;
  paymentIssueSummary?: string | null;
  invoiceStatus?: string | null;
  quickBooksSyncStatus?: string | null;
  limitedViewUrl?: string | null;
}
