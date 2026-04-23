import { describe, expect, it } from 'vitest';
import { normalizeZipCode } from '@/common/utils/zipCode';

describe('normalizeZipCode', () => {
  it('returns a trimmed string for numeric ZIP values', () => {
    expect(normalizeZipCode(60601)).toBe('60601');
  });

  it('preserves leading zeros in string ZIP values', () => {
    expect(normalizeZipCode(' 01234 ')).toBe('01234');
  });

  it('returns an empty string for nullish ZIP values', () => {
    expect(normalizeZipCode(null)).toBe('');
    expect(normalizeZipCode(undefined)).toBe('');
  });
});
