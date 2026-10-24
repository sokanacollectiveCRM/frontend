import type { Certification } from '@/api/doulas/doulaService';

export const hasCertificationDetails = (entry: Certification): boolean =>
  Boolean(
    entry.name.trim() ||
      entry.issuingOrganization.trim() ||
      entry.expiration_date
  );

export const isValidExpirationDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  value.slice(0, 4) !== '0000' &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;

export function certificationExpiration(
  entry: Certification,
  today = new Date()
) {
  if (entry.no_expiration) return { text: 'No expiration', expired: false };
  if (!entry.expiration_date || !isValidExpirationDate(entry.expiration_date)) {
    return { text: 'Expiration not provided', expired: false };
  }
  // Date-only values must not shift a day/month when rendered in a local timezone.
  const date = new Date(`${entry.expiration_date}T00:00:00Z`);
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return {
    text: `Expires ${new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date)}`,
    expired: entry.expiration_date < localToday,
  };
}
