import { describe, expect, it } from 'vitest';

function normalizeDateOnly(value: string | null | undefined): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  return raw.includes('T') ? raw.slice(0, 10) : raw;
}

function toStartOfDayIso(dateValue: string): string {
  return new Date(`${normalizeDateOnly(dateValue)}T00:00:00`).toISOString();
}

function toEndOfDayIso(dateValue: string): string {
  return new Date(`${normalizeDateOnly(dateValue)}T23:59:59.999`).toISOString();
}

describe('doula availability date normalization', () => {
  it('normalizes full ISO timestamps to date-only values for the form', () => {
    expect(normalizeDateOnly('2026-06-20T00:00:00.000Z')).toBe('2026-06-20');
    expect(normalizeDateOnly('2026-06-27T23:59:59.999Z')).toBe('2026-06-27');
  });

  it('preserves date-only strings', () => {
    expect(normalizeDateOnly('2026-06-20')).toBe('2026-06-20');
  });

  it('builds valid start/end of day ISO strings from full ISO backend values', () => {
    const startIso = toStartOfDayIso('2026-06-20T00:00:00.000Z');
    const endIso = toEndOfDayIso('2026-06-20T00:00:00.000Z');

    expect(Number.isNaN(new Date(startIso).getTime())).toBe(false);
    expect(Number.isNaN(new Date(endIso).getTime())).toBe(false);
    expect(new Date(startIso).getUTCDate()).toBe(20);
    expect(new Date(endIso).getUTCDate()).toBeGreaterThanOrEqual(20);
  });
});
