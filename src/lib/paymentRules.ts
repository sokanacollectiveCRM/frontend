/**
 * Payment-collection business rules.
 *
 * Single source of truth for conditional logic that spans:
 *  - Intake / request form (Step9Payment)
 *  - Client portal billing (ClientProfileTab)
 *  - Admin billing workflow (LeadProfileModal)
 */

export const PAYMENT_METHOD_OPTIONS = [
  'Commercial Insurance',
  'Private Insurance',
  'Medicaid',
  'Self-Pay',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHOD_OPTIONS)[number];

export type PaymentAuthorizationStatus =
  | 'not_required'
  | 'required'
  | 'on_file'
  | 'failed';

export const PAYMENT_AUTHORIZATION_STATUS_LABELS: Record<PaymentAuthorizationStatus, string> = {
  not_required: 'Not Required',
  required: 'Required',
  on_file: 'On File',
  failed: 'Failed',
};

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
}

export function isMedicaidMethod(method: unknown): boolean {
  return normalize(method) === 'medicaid';
}

export function isSelfPayMethod(method: unknown): boolean {
  const n = normalize(method);
  return n === 'self-pay' || n === 'self pay' || n === 'selfpay';
}

export function isInsuranceMethod(method: unknown): boolean {
  const n = normalize(method);
  return n === 'commercial insurance' || n === 'private insurance';
}

/**
 * Returns true when the client **must** have a payment method on file.
 * Medicaid clients are excluded — they follow the Medicaid workflow only.
 */
export function requiresPaymentMethodOnFile(method: unknown): boolean {
  return !isMedicaidMethod(method) && Boolean(normalize(method));
}

/**
 * Returns true when insurance-specific fields (provider, member ID, etc.)
 * should be collected.
 */
export function requiresInsuranceDetails(method: unknown): boolean {
  return isInsuranceMethod(method);
}

// ---------------------------------------------------------------------------
// UI messaging
// ---------------------------------------------------------------------------

export type PaymentMethodMessageVariant = 'info' | 'success' | 'warning';

export interface PaymentMethodMessage {
  text: string;
  variant: PaymentMethodMessageVariant;
}

export function getPaymentMethodMessage(method: unknown): PaymentMethodMessage | null {
  if (!normalize(method)) return null;

  if (isMedicaidMethod(method)) {
    return {
      text: 'No payment method required. Your services will be billed through Medicaid.',
      variant: 'success',
    };
  }

  if (isSelfPayMethod(method)) {
    return {
      text: 'A payment authorization is required. Our team will send you a payment authorization form—return it to us; you do not enter card numbers in this portal.',
      variant: 'info',
    };
  }

  if (isInsuranceMethod(method)) {
    return {
      text: 'Payment authorization is required for copays, deductibles, or self-pay balances. Our team will send a payment authorization form when needed; you do not enter card numbers in this portal.',
      variant: 'info',
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Derived authorization status
// ---------------------------------------------------------------------------

/**
 * Derives the `paymentAuthorizationStatus` value for client-submitted billing saves.
 * **`on_file` is not set here** — the backend (or staff) should set that when
 * payment authorization is received (e.g. signed form) or a token is stored in the PSP.
 *
 * @param hasAuthorizationOnFile - true only if the app already knows auth is complete (e.g. from API); usually omitted.
 */
export function derivePaymentAuthorizationStatus(
  method: unknown,
  hasAuthorizationOnFile = false
): PaymentAuthorizationStatus {
  if (isMedicaidMethod(method)) return 'not_required';
  if (!normalize(method)) return 'required';
  return hasAuthorizationOnFile ? 'on_file' : 'required';
}

// ---------------------------------------------------------------------------
// Normalise raw string to canonical PaymentMethod value
// ---------------------------------------------------------------------------

export function normalizePaymentMethod(raw: unknown): string {
  const n = normalize(raw);

  if (isMedicaidMethod(n)) return 'Medicaid';
  if (isSelfPayMethod(n)) return 'Self-Pay';
  if (n === 'commercial insurance') return 'Commercial Insurance';
  if (n === 'private insurance') return 'Private Insurance';

  return String(raw ?? '').trim();
}

// ---------------------------------------------------------------------------
// Admin clients table — at-a-glance card-on-file expectation
// ---------------------------------------------------------------------------

export type AdminPaymentCardColumn = {
  /** Short label for the table cell */
  label: string;
  /** Optional second line (e.g. payment method) */
  sublabel: string | null;
  /** Tailwind classes for the badge */
  badgeClass: string;
  /** Full sentence for tooltip */
  tooltip: string;
};

/**
 * For staff list views: whether payment authorization / a card should be on file
 * (by payment method) and, when the API provides it, current state.
 * **`on_file`** = team has what they need to charge (signed authorization, processor token, etc.).
 */
export function getAdminPaymentCardColumn(
  paymentMethod: unknown,
  paymentAuthorizationStatus?: string | null
): AdminPaymentCardColumn {
  const method = normalizePaymentMethod(paymentMethod);
  const methodDisplay = String(paymentMethod ?? '').trim() || null;
  const auth = String(paymentAuthorizationStatus ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  if (!methodDisplay && !auth) {
    return {
      label: '—',
      sublabel: null,
      badgeClass: 'bg-muted text-muted-foreground border-border',
      tooltip: 'Payment method not set. Open the client profile to set billing.',
    };
  }

  // List API may return authorization without payment_method — still show state
  if (!methodDisplay && auth) {
    if (auth === 'on_file') {
      return {
        label: 'On file',
        sublabel: null,
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        tooltip: 'Payment authorization is on file (e.g. form received or recorded in the system).',
      };
    }
    if (auth === 'failed') {
      return {
        label: 'Failed',
        sublabel: null,
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        tooltip: 'Authorization failed. Client should retry adding a card.',
      };
    }
    if (auth === 'not_required') {
      return {
        label: 'Not needed',
        sublabel: null,
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
        tooltip: 'No card on file required for this client.',
      };
    }
    return {
      label: 'Needed',
      sublabel: null,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      tooltip: 'Card on file expected; open profile for payment method details.',
    };
  }

  if (isMedicaidMethod(paymentMethod) || isMedicaidMethod(method)) {
    return {
      label: 'Not needed',
      sublabel: 'Medicaid',
      badgeClass: 'bg-green-100 text-green-800 border-green-200',
      tooltip: 'Medicaid: no card on file required for this billing path.',
    };
  }

  if (!requiresPaymentMethodOnFile(paymentMethod)) {
    return {
      label: '—',
      sublabel: methodDisplay,
      badgeClass: 'bg-muted text-muted-foreground border-border',
      tooltip: 'Set a standard payment method to see card requirements.',
    };
  }

  if (auth === 'on_file') {
    return {
      label: 'On file',
      sublabel: methodDisplay,
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      tooltip:
        'Payment authorization is on file (e.g. received form or processor) — staff can charge per your processes.',
    };
  }

  if (auth === 'failed') {
    return {
      label: 'Failed',
      sublabel: methodDisplay,
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      tooltip: 'Authorization failed. Client should retry adding a card or use another method.',
    };
  }

  if (auth === 'not_required') {
    return {
      label: 'Not needed',
      sublabel: methodDisplay,
      badgeClass: 'bg-green-100 text-green-800 border-green-200',
      tooltip: 'Backend marked card as not required for this client.',
    };
  }

  // required, missing, or unknown — expectation is still “card should be on file”
  return {
    label: 'Needed',
    sublabel: methodDisplay,
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    tooltip:
      'This payment path requires payment authorization on file (signed form and/or processor). Until the API reports “on file”, treat as not ready to charge.',
  };
}
