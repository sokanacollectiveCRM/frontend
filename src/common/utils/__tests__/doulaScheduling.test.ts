import { describe, expect, it } from 'vitest';
import {
  canClientViewDoulaScheduling,
  getDoulaSchedulingInfo,
} from '@/common/utils/doulaScheduling';

describe('getDoulaSchedulingInfo', () => {
  it('reads scheduling url and available status from nested doula payloads', () => {
    expect(
      getDoulaSchedulingInfo({
        doula: {
          scheduling_url: 'https://calendly.com/sokana/jane',
          availability_status: 'available',
        },
      })
    ).toMatchObject({
      schedulingUrl: 'https://calendly.com/sokana/jane',
      availabilityStatus: 'available',
      availabilityLabel: 'Available',
    });
  });

  it('builds an unavailable message from a time-away window when API omits one', () => {
    expect(
      getDoulaSchedulingInfo({
        is_available: false,
        unavailable_from: '2026-06-15',
        unavailable_until: '2026-06-20',
      })
    ).toMatchObject({
      availabilityStatus: 'unavailable',
      availabilityLabel: 'Unavailable',
      availabilityMessage: 'Unavailable from Jun 15, 2026 to Jun 20, 2026.',
    });
  });
});

describe('canClientViewDoulaScheduling', () => {
  it('allows scheduling visibility once the client record reaches contract stage', () => {
    expect(canClientViewDoulaScheduling({ status: 'contract' })).toBe(true);
    expect(canClientViewDoulaScheduling({ contract_status: 'signed' })).toBe(
      true
    );
    expect(canClientViewDoulaScheduling({ has_signed_contract: true })).toBe(
      true
    );
  });

  it('hides scheduling visibility before contract stage', () => {
    expect(canClientViewDoulaScheduling({ status: 'matched' })).toBe(false);
    expect(canClientViewDoulaScheduling({ contract_status: 'draft' })).toBe(
      false
    );
    expect(canClientViewDoulaScheduling({})).toBe(false);
  });
});
