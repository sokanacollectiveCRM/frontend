import type {
  LimitedContractBillingSummary,
  LimitedContractInstallment,
  LimitedContractPaymentSchedule,
} from '@/features/billing-portal/types';

function formatAmount(value?: number | null): string {
  if (value == null) return 'the scheduled amount';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(value?: string | null): string {
  if (!value) return 'the scheduled due date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function normalize(value?: string | null): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
}

export function isActionRequiredForInstallment(installment: LimitedContractInstallment): boolean {
  const status = normalize(installment.status);
  return status === 'failed' || status === 'overdue' || status === 'pending';
}

export function isActionRequiredForContract(
  contract: Pick<
    LimitedContractBillingSummary,
    'nextDueDate' | 'paymentIssueType' | 'paymentIssueSummary'
  >
): boolean {
  if (contract.paymentIssueType || contract.paymentIssueSummary) {
    return true;
  }

  if (!contract.nextDueDate) return false;
  const dueDate = new Date(contract.nextDueDate);
  if (Number.isNaN(dueDate.getTime())) return false;
  dueDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate.getTime() < today.getTime();
}

function buildIssueLine(issueType?: string | null, issueSummary?: string | null): string {
  if (issueSummary) return issueSummary;
  if (!issueType) return 'the scheduled payment still needs attention';

  const normalized = normalize(issueType);
  if (normalized.includes('declined')) return 'the card on file was declined';
  if (normalized.includes('expired')) return 'the card on file appears to be expired';
  if (normalized.includes('insufficient') || normalized.includes('fund')) {
    return 'the payment could not be completed because the account needs funds added';
  }
  if (normalized.includes('update')) return 'the payment method on file needs to be updated';
  return issueType;
}

export function openBillingOutreachEmail({
  clientName,
  clientEmail,
  contractType,
  contractId,
  amount,
  dueDate,
  issueType,
  issueSummary,
  installmentNumber,
}: {
  clientName: string;
  clientEmail?: string | null;
  contractType: string;
  contractId: string;
  amount?: number | null;
  dueDate?: string | null;
  issueType?: string | null;
  issueSummary?: string | null;
  installmentNumber?: number | null;
}): boolean {
  if (!clientEmail) return false;

  const subject = `Payment update needed for your ${contractType}`;
  const issueLine = buildIssueLine(issueType, issueSummary);
  const installmentLine =
    installmentNumber != null ? `installment #${installmentNumber}` : 'scheduled payment';
  const body = [
    `Hi ${clientName},`,
    '',
    `We’re reaching out because ${issueLine} for your ${contractType} (${installmentLine}).`,
    `Amount: ${formatAmount(amount)}`,
    `Due date: ${formatDate(dueDate)}`,
    '',
    'Please reply to this email or update your payment method so we can complete billing.',
    '',
    `Reference: contract ${contractId}`,
    '',
    'Thank you,',
    'Sokana Collective Billing',
  ].join('\n');

  window.location.href = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return true;
}

export function openContractBillingOutreachEmail(
  contract: LimitedContractBillingSummary | LimitedContractPaymentSchedule
): boolean {
  return openBillingOutreachEmail({
    clientName: contract.clientName,
    clientEmail: contract.clientEmail,
    contractType: contract.contractType,
    contractId: contract.contractId,
    amount: contract.totalAmount,
    dueDate: 'nextDueDate' in contract ? contract.nextDueDate : undefined,
    issueType: contract.paymentIssueType,
    issueSummary: contract.paymentIssueSummary,
  });
}
