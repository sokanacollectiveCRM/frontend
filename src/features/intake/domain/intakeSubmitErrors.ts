export type IntakeFieldError = {
  name: string;
  message: string;
};

export class IntakeSubmitError extends Error {
  readonly fields: IntakeFieldError[];
  readonly status: number;

  constructor(
    message: string,
    options?: { fields?: IntakeFieldError[]; status?: number }
  ) {
    super(message);
    this.name = 'IntakeSubmitError';
    this.fields = options?.fields ?? [];
    this.status = options?.status ?? 0;
  }
}

export const NETWORK_SUBMIT_MESSAGE =
  'We could not reach the server to submit your request. Please check your internet connection and try again. If this keeps happening, contact Sokana Collective — this is not a missing field on this page.';

export const CONFIG_SUBMIT_MESSAGE =
  'This form is not connected to the server. Please contact Sokana Collective so they can finish setup.';

export const GENERIC_SUBMIT_MESSAGE =
  'We could not submit your request. Please try again in a moment. If the problem continues, contact Sokana Collective for help.';

const SERVER_FIELD_HINTS: { pattern: RegExp; name: string }[] = [
  { pattern: /first name/i, name: 'firstname' },
  { pattern: /last name/i, name: 'lastname' },
  { pattern: /service_needed|service needed/i, name: 'service_needed' },
  { pattern: /email/i, name: 'email' },
  { pattern: /phone/i, name: 'phone_number' },
  { pattern: /zip/i, name: 'zip_code' },
  { pattern: /address/i, name: 'address' },
  { pattern: /\bage\b/i, name: 'age' },
  { pattern: /provider_type|provider type/i, name: 'provider_type' },
  { pattern: /home_adults_count/i, name: 'home_adults_count' },
  { pattern: /home_youth_count/i, name: 'home_youth_count' },
  { pattern: /birth_hospital|birth location name/i, name: 'birth_hospital' },
  { pattern: /birth_location|birth location/i, name: 'birth_location' },
  {
    pattern: /payment_method|payment method|how you plan to pay/i,
    name: 'payment_method',
  },
  { pattern: /referral_source_other|how you heard/i, name: 'referral_source' },
  { pattern: /referral_source/i, name: 'referral_source' },
  {
    pattern: /insurance_provider|insurance company/i,
    name: 'insurance_provider',
  },
  {
    pattern: /member id|subscriber id|insurance_member_id/i,
    name: 'insurance_member_id',
  },
];

function isBlankMessage(message: string): boolean {
  return !message || !message.trim() || message.trim() === 'undefined';
}

export function isBareFailedToFetch(message: string): boolean {
  const trimmed = message.trim().toLowerCase();
  return (
    trimmed === 'failed to fetch' ||
    trimmed === 'failed to fetch!' ||
    trimmed === 'load failed' ||
    trimmed === 'networkerror when attempting to fetch resource.' ||
    trimmed === 'network error' ||
    trimmed === 'the internet connection appears to be offline.'
  );
}

function isNetworkFailure(error: unknown, raw: string): boolean {
  if (error instanceof TypeError) return true;
  return (
    isBareFailedToFetch(raw) ||
    /failed to fetch|networkerror|load failed|network request failed/i.test(raw)
  );
}

export function formatIntakeSubmitError(error: unknown): string {
  if (error instanceof IntakeSubmitError) {
    if (isBareFailedToFetch(error.message) || isBlankMessage(error.message)) {
      return error.status === 0
        ? NETWORK_SUBMIT_MESSAGE
        : GENERIC_SUBMIT_MESSAGE;
    }
    return error.message;
  }

  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  if (isNetworkFailure(error, raw)) {
    return NETWORK_SUBMIT_MESSAGE;
  }

  if (isBlankMessage(raw) || isBareFailedToFetch(raw)) {
    return GENERIC_SUBMIT_MESSAGE;
  }

  return raw;
}

export function mapServerErrorToFields(message: string): IntakeFieldError[] {
  if (!message || isBareFailedToFetch(message)) return [];
  const matched: IntakeFieldError[] = [];
  const seen = new Set<string>();
  for (const hint of SERVER_FIELD_HINTS) {
    if (!hint.pattern.test(message) || seen.has(hint.name)) continue;
    seen.add(hint.name);
    matched.push({ name: hint.name, message });
  }
  return matched;
}

export function stepIndexForField(
  field: string,
  fieldsByStep: readonly (readonly string[])[]
): number {
  return fieldsByStep.findIndex((fields) => fields.includes(field));
}

export function missingBackendUrlError(): IntakeSubmitError {
  return new IntakeSubmitError(CONFIG_SUBMIT_MESSAGE, { status: 0 });
}
