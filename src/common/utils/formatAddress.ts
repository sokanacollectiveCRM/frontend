export interface AddressParts {
  address?: string | null;
  unit_number?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | number | null;
}
export function formatAddress(parts: AddressParts): string {
  const clean = (value: unknown) => String(value ?? '').trim();
  return [
    clean(parts.address),
    clean(parts.unit_number),
    clean(parts.city),
    [clean(parts.state), clean(parts.zip_code)].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');
}
