/**
 * Portal eligibility display helpers.
 *
 * The backend is the source of truth for eligibility. These utilities format
 * backend-computed state for labels, badges, and summaries — they do not
 * determine whether a client is portal eligible.
 */

export type PortalBlocker =
  | 'contract_unsigned'
  | 'deposit_unpaid'
  | 'missing_card_on_file'
  | 'payment_authorization_required'
  | 'billing_path_unknown';

export type BillingPath =
  | 'insurance'
  | 'self_pay'
  | 'medicaid'
  | 'full_support'
  | 'unknown';

export type PortalAllowedActions = {
  can_invite_to_portal?: boolean;
  can_mark_contract_signed?: boolean;
  can_mark_deposit_paid?: boolean;
};

export type ClientEligibilityFields = {
  is_eligible?: boolean;
  portal_blockers?: PortalBlocker[];
  primary_portal_blocker?: PortalBlocker | null;
  billing_path?: BillingPath;
  payment_authorization_required?: boolean;
  payment_authorization_satisfied?: boolean;
  card_on_file?: boolean;
  qb_customer_id?: string | null;
  qb_stored_payment_method_id?: string | null;
  verification_invoice_id?: string | null;
  verification_invoice_sent_at?: string | null;
  verification_invoice_paid_at?: string | null;
  allowed_actions?: PortalAllowedActions;
  /** Legacy readiness hints — display only when backend gates are absent */
  has_signed_contract?: boolean;
  has_completed_payment?: boolean;
  contract_status?: string;
  payment_status?: string;
  /** Legacy PDF authorization — historical display only */
  payment_authorization_status?: string | null;
};

export type ReadinessGateSummary = {
  contractSigned: boolean | null;
  depositPaid: boolean | null;
  billingPath: BillingPath | null;
  paymentAuthorizationRequired: boolean | null;
  paymentAuthorizationSatisfied: boolean | null;
  cardOnFile: boolean | null;
  portalEligibility: 'eligible' | 'locked' | 'unknown';
  primaryBlocker: PortalBlocker | null;
  verificationInvoiceStatus: string | null;
};

export type PrimaryPortalAction =
  | { type: 'invite' }
  | { type: 'blocked'; label: string; description: string }
  | { type: 'none' };

const PORTAL_BLOCKER_LABELS: Record<PortalBlocker, string> = {
  contract_unsigned: 'Contract unsigned',
  deposit_unpaid: 'Deposit unpaid',
  missing_card_on_file: 'Missing card on file',
  payment_authorization_required: 'Payment authorization required',
  billing_path_unknown: 'Billing path unknown',
};

const PORTAL_BLOCKER_DESCRIPTIONS: Record<PortalBlocker, string> = {
  contract_unsigned: 'A signed contract is required before portal invite.',
  deposit_unpaid: 'Deposit must be paid before portal invite.',
  missing_card_on_file:
    'Deposit paid, but no reusable payment method was saved in QuickBooks.',
  payment_authorization_required:
    'Payment authorization must be satisfied before portal invite.',
  billing_path_unknown: 'Billing path could not be determined. Review client billing settings.',
};

const BILLING_PATH_LABELS: Record<BillingPath, string> = {
  insurance: 'Insurance',
  self_pay: 'Self-Pay',
  medicaid: 'Medicaid',
  full_support: 'Full Support',
  unknown: 'Unknown',
};

const VALID_PORTAL_BLOCKERS = new Set<string>([
  'contract_unsigned',
  'deposit_unpaid',
  'missing_card_on_file',
  'payment_authorization_required',
  'billing_path_unknown',
]);

const VALID_BILLING_PATHS = new Set<string>([
  'insurance',
  'self_pay',
  'medicaid',
  'full_support',
  'unknown',
]);

function asRecord(client: unknown): Record<string, unknown> {
  return client && typeof client === 'object' ? (client as Record<string, unknown>) : {};
}

function readBoolean(
  record: Record<string, unknown>,
  snakeKey: string,
  camelKey: string
): boolean | undefined {
  const snake = record[snakeKey];
  if (typeof snake === 'boolean') return snake;
  const camel = record[camelKey];
  if (typeof camel === 'boolean') return camel;
  return undefined;
}

function readString(
  record: Record<string, unknown>,
  snakeKey: string,
  camelKey: string
): string | null | undefined {
  const snake = record[snakeKey];
  if (snake === null) return null;
  if (typeof snake === 'string' && snake.trim()) return snake;
  const camel = record[camelKey];
  if (camel === null) return null;
  if (typeof camel === 'string' && camel.trim()) return camel;
  return undefined;
}

function readPortalBlockers(record: Record<string, unknown>): PortalBlocker[] {
  const raw = record.portal_blockers ?? record.portalBlockers;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is PortalBlocker =>
    typeof item === 'string' && VALID_PORTAL_BLOCKERS.has(item)
  );
}

function readPrimaryBlocker(record: Record<string, unknown>): PortalBlocker | null {
  const raw = record.primary_portal_blocker ?? record.primaryPortalBlocker;
  if (typeof raw === 'string' && VALID_PORTAL_BLOCKERS.has(raw)) {
    return raw as PortalBlocker;
  }
  return null;
}

function readBillingPath(record: Record<string, unknown>): BillingPath | undefined {
  const raw = record.billing_path ?? record.billingPath;
  if (typeof raw === 'string' && VALID_BILLING_PATHS.has(raw)) {
    return raw as BillingPath;
  }
  return undefined;
}

function readAllowedActions(record: Record<string, unknown>): PortalAllowedActions | undefined {
  const raw = record.allowed_actions ?? record.allowedActions;
  if (!raw || typeof raw !== 'object') return undefined;
  return raw as PortalAllowedActions;
}

/** Normalize snake_case / camelCase eligibility fields from any client record. */
export function normalizeClientEligibility(client: unknown): ClientEligibilityFields {
  const record = asRecord(client);
  return {
    is_eligible: readBoolean(record, 'is_eligible', 'isEligible'),
    portal_blockers: readPortalBlockers(record),
    primary_portal_blocker: readPrimaryBlocker(record),
    billing_path: readBillingPath(record),
    payment_authorization_required: readBoolean(
      record,
      'payment_authorization_required',
      'paymentAuthorizationRequired'
    ),
    payment_authorization_satisfied: readBoolean(
      record,
      'payment_authorization_satisfied',
      'paymentAuthorizationSatisfied'
    ),
    card_on_file: readBoolean(record, 'card_on_file', 'cardOnFile'),
    qb_customer_id: readString(record, 'qb_customer_id', 'qbCustomerId'),
    qb_stored_payment_method_id: readString(
      record,
      'qb_stored_payment_method_id',
      'qbStoredPaymentMethodId'
    ),
    verification_invoice_id: readString(record, 'verification_invoice_id', 'verificationInvoiceId'),
    verification_invoice_sent_at: readString(
      record,
      'verification_invoice_sent_at',
      'verificationInvoiceSentAt'
    ),
    verification_invoice_paid_at: readString(
      record,
      'verification_invoice_paid_at',
      'verificationInvoicePaidAt'
    ),
    allowed_actions: readAllowedActions(record),
    has_signed_contract: readBoolean(record, 'has_signed_contract', 'hasSignedContract'),
    has_completed_payment: readBoolean(record, 'has_completed_payment', 'hasCompletedPayment'),
    contract_status: readString(record, 'contract_status', 'contractStatus') ?? undefined,
    payment_status: readString(record, 'payment_status', 'paymentStatus') ?? undefined,
    payment_authorization_status:
      readString(record, 'payment_authorization_status', 'paymentAuthorizationStatus') ??
      undefined,
  };
}

/** Read backend is_eligible when present (snake_case or camelCase). */
export function readIsEligible(client: unknown): boolean | undefined {
  return normalizeClientEligibility(client).is_eligible;
}

/**
 * Portal invite gate driven by backend action flags when present.
 * Falls back to backend is_eligible, then legacy contract + deposit hints.
 */
export function canInviteToPortal(client: unknown): boolean {
  const eligibility = normalizeClientEligibility(client);
  const allowed = eligibility.allowed_actions?.can_invite_to_portal;
  if (typeof allowed === 'boolean') return allowed;

  if (eligibility.is_eligible === true) return true;
  if (eligibility.is_eligible === false) return false;

  return legacyPortalEligibleFallback(eligibility);
}

function inferPortalEligibilityState(
  eligibility: ClientEligibilityFields
): ReadinessGateSummary['portalEligibility'] {
  const allowed = eligibility.allowed_actions?.can_invite_to_portal;
  if (allowed === true) return 'eligible';
  if (allowed === false) return 'locked';

  if (eligibility.is_eligible === true) return 'eligible';
  if (eligibility.is_eligible === false) return 'locked';

  return legacyPortalEligibleFallback(eligibility) ? 'eligible' : 'unknown';
}

function legacyPortalEligibleFallback(eligibility: ClientEligibilityFields): boolean {
  if (eligibility.has_signed_contract === true && eligibility.has_completed_payment === true) {
    return true;
  }
  if (eligibility.contract_status === 'signed' && eligibility.payment_status === 'succeeded') {
    return true;
  }
  return false;
}

export function getPortalBlockerLabel(blocker: PortalBlocker | string | null | undefined): string {
  if (!blocker || typeof blocker !== 'string') return 'Blocked';
  if (VALID_PORTAL_BLOCKERS.has(blocker)) {
    return PORTAL_BLOCKER_LABELS[blocker as PortalBlocker];
  }
  return blocker.replace(/_/g, ' ');
}

export function getPortalBlockerDescription(
  blocker: PortalBlocker | string | null | undefined
): string {
  if (!blocker || typeof blocker !== 'string') {
    return 'Portal invite is locked until onboarding requirements are met.';
  }
  if (VALID_PORTAL_BLOCKERS.has(blocker)) {
    return PORTAL_BLOCKER_DESCRIPTIONS[blocker as PortalBlocker];
  }
  return 'Portal invite is locked until onboarding requirements are met.';
}

export function getBillingPathLabel(billingPath: BillingPath | string | null | undefined): string {
  if (!billingPath || typeof billingPath !== 'string') return '—';
  if (VALID_BILLING_PATHS.has(billingPath)) {
    return BILLING_PATH_LABELS[billingPath as BillingPath];
  }
  return billingPath.replace(/_/g, ' ');
}

function inferLegacyContractSigned(eligibility: ClientEligibilityFields): boolean | null {
  if (typeof eligibility.has_signed_contract === 'boolean') return eligibility.has_signed_contract;
  if (eligibility.contract_status === 'signed') return true;
  return null;
}

function inferLegacyDepositPaid(eligibility: ClientEligibilityFields): boolean | null {
  if (typeof eligibility.has_completed_payment === 'boolean') return eligibility.has_completed_payment;
  if (eligibility.payment_status === 'succeeded' || eligibility.payment_status === 'completed') {
    return true;
  }
  return null;
}

function formatVerificationInvoiceStatus(eligibility: ClientEligibilityFields): string | null {
  if (eligibility.verification_invoice_paid_at) {
    return `Paid (${eligibility.verification_invoice_paid_at})`;
  }
  if (eligibility.verification_invoice_sent_at) {
    return `Sent (${eligibility.verification_invoice_sent_at})`;
  }
  if (eligibility.verification_invoice_id) {
    return `Created (${eligibility.verification_invoice_id})`;
  }
  return null;
}

export function getReadinessGateSummary(client: unknown): ReadinessGateSummary {
  const eligibility = normalizeClientEligibility(client);

  return {
    contractSigned: inferLegacyContractSigned(eligibility),
    depositPaid: inferLegacyDepositPaid(eligibility),
    billingPath: eligibility.billing_path ?? null,
    paymentAuthorizationRequired: eligibility.payment_authorization_required ?? null,
    paymentAuthorizationSatisfied: eligibility.payment_authorization_satisfied ?? null,
    cardOnFile: eligibility.card_on_file ?? null,
    portalEligibility: inferPortalEligibilityState(eligibility),
    primaryBlocker: eligibility.primary_portal_blocker ?? null,
    verificationInvoiceStatus: formatVerificationInvoiceStatus(eligibility),
  };
}

export function getPrimaryPortalAction(client: unknown): PrimaryPortalAction {
  const eligibility = normalizeClientEligibility(client);

  if (canInviteToPortal(client)) {
    return { type: 'invite' };
  }

  const blocker = eligibility.primary_portal_blocker;
  if (eligibility.is_eligible === false && blocker) {
    return {
      type: 'blocked',
      label: getPortalBlockerLabel(blocker),
      description: getPortalBlockerDescription(blocker),
    };
  }

  if (eligibility.is_eligible === false) {
    return {
      type: 'blocked',
      label: 'Portal locked',
      description: 'Portal invite is locked until onboarding requirements are met.',
    };
  }

  return { type: 'none' };
}

/** Tooltip copy for portal column when blocked by missing card. */
export function getMissingCardPortalTooltip(): string {
  return 'Portal locked: deposit paid, but no reusable payment method is currently saved.';
}

export function formatYesNo(value: boolean | null | undefined): string {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '—';
}
