export const PHONE_ERROR = 'Enter a 10-digit phone number';

export function isValidPhone(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^(?:[0-9]{10}|[0-9]{3}-[0-9]{3}-[0-9]{4})$/.test(value)
  );
}

export function formatPhone(value: string): string {
  if (!/^[0-9-]*$/.test(value)) return value;
  const digits = value.replace(/-/g, '');
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)]
    .filter(Boolean)
    .join('-');
}
