import { describe, expect, it } from 'vitest';
import { formatIntakeRateLimitError } from '../intakeAbuse';

describe('formatIntakeRateLimitError', () => {
  it('returns null for non-rate-limit responses', () => {
    expect(formatIntakeRateLimitError(400, { error: 'bad' }, null)).toBeNull();
  });

  it('uses Retry-After seconds when present', () => {
    expect(
      formatIntakeRateLimitError(429, { code: 'RATE_LIMITED' }, '30')
    ).toBe('Too many requests. Please try again in 30 seconds.');
  });

  it('falls back to backend error text', () => {
    expect(
      formatIntakeRateLimitError(
        429,
        {
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
        },
        null
      )
    ).toBe('Too many requests. Please try again later.');
  });
});
