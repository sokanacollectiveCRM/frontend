export function normalizeZipCode(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const normalized = String(value).trim();
  if (normalized === '-1') {
    return '';
  }

  return normalized;
}
