/** Referral source dropdown — shared by request form and admin lead profile. */
export const REFERRAL_SOURCE_OPTIONS = [
  'Google',
  'Doula Match',
  "I'm a former client.",
  'Sokana Member',
  'Social Media',
  'Email Blast',
  'Other',
] as const;

export const REFERRAL_SOURCE_OTHER_VALUE = 'Other';

/** Stored value from intakes before this copy change (value matched dropdown label). */
export const REFERRAL_SOURCE_LEGACY_FORMER_CLIENT = 'Former client';

/** Map legacy stored values to current option text for display and selects. */
export function normalizeReferralSourceStoredValue(value: string | null | undefined): string {
  const s = String(value ?? '').trim();
  if (s === REFERRAL_SOURCE_LEGACY_FORMER_CLIENT) return "I'm a former client.";
  return s;
}
