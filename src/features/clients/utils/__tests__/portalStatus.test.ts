import { describe, expect, it } from 'vitest';

import { canInviteToPortal, isPortalEligible } from '../portalStatus';

describe('portalStatus invite gating', () => {
  it('disables portal invite when is_eligible is false', () => {
    expect(canInviteToPortal({ is_eligible: false })).toBe(false);
    expect(isPortalEligible({ is_eligible: false } as any)).toBe(false);
  });

  it('enables portal invite when is_eligible is true', () => {
    expect(canInviteToPortal({ is_eligible: true })).toBe(true);
    expect(isPortalEligible({ is_eligible: true } as any)).toBe(true);
  });

  it('blocks portal invite when backend allowed_actions explicitly says no', () => {
    expect(
      canInviteToPortal({
        is_eligible: true,
        allowed_actions: { can_invite_to_portal: false },
      })
    ).toBe(false);
  });

  it('does not allow invite when backend explicitly blocks despite legacy hints', () => {
    expect(
      canInviteToPortal({
        is_eligible: false,
        has_signed_contract: true,
        has_completed_payment: true,
      })
    ).toBe(false);
  });
});
