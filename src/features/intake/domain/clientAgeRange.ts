/** Demographics age buckets shown historically on the intake form. */
export const CLIENT_AGE_RANGE_OPTIONS = [
  'Under 20',
  '20-25',
  '26-35',
  '36 and older',
] as const;

export type ClientAgeRangeOption = (typeof CLIENT_AGE_RANGE_OPTIONS)[number];

/** Derive the optional demographics age range from exact age when provided. */
export function clientAgeRangeFromYears(
  age: unknown
): ClientAgeRangeOption | '' {
  const years =
    typeof age === 'number' ? age : parseInt(String(age ?? ''), 10);
  if (!Number.isFinite(years) || years < 1) return '';
  if (years < 20) return 'Under 20';
  if (years <= 25) return '20-25';
  if (years <= 35) return '26-35';
  return '36 and older';
}
