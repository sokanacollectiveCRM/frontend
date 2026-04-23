import { describe, expect, it } from 'vitest';
import { buildClientProfileUpdatePayload } from '@/features/client-dashboard/components/ClientProfileTab';

describe('buildClientProfileUpdatePayload', () => {
  it('sends a numeric ZIP as a string', () => {
    const payload = buildClientProfileUpdatePayload({
      firstname: 'Jane',
      lastname: 'Doe',
      phone: '555-555-5555',
      address: '123 Main St',
      city: 'Chicago',
      state: 'IL',
      zip_code: 60601,
      bio: 'hello',
    });

    expect(payload.zip_code).toBe('60601');
  });

  it('preserves leading zeros in ZIP codes', () => {
    const payload = buildClientProfileUpdatePayload({
      firstname: 'Jane',
      lastname: 'Doe',
      phone: '555-555-5555',
      address: '123 Main St',
      city: 'Chicago',
      state: 'IL',
      zip_code: ' 01234 ',
      bio: 'hello',
    });

    expect(payload.zip_code).toBe('01234');
  });
});
