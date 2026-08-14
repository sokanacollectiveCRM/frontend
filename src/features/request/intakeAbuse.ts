export const INTAKE_HONEYPOT_FIELDS = [
  'website',
  'company_url',
  'fax_number',
  'hp_field',
] as const;

export type IntakeHoneypotField = (typeof INTAKE_HONEYPOT_FIELDS)[number];

export const intakeHoneypotValues: Record<IntakeHoneypotField, string> = {
  website: '',
  company_url: '',
  fax_number: '',
  hp_field: '',
};

export function resetIntakeHoneypotValues(): void {
  for (const field of INTAKE_HONEYPOT_FIELDS) {
    intakeHoneypotValues[field] = '';
  }
}

export function createIntakeIdempotencyKey(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `intake-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function formatIntakeRateLimitError(
  status: number,
  body: { error?: string; code?: string },
  retryAfterHeader: string | null
): string | null {
  if (status !== 429 && body.code !== 'RATE_LIMITED') return null;
  const seconds =
    retryAfterHeader && /^\d+$/.test(retryAfterHeader.trim())
      ? Number(retryAfterHeader.trim())
      : null;
  if (seconds) {
    return `Too many requests. Please try again in ${seconds} seconds.`;
  }
  return body.error || 'Too many requests. Please try again later.';
}
