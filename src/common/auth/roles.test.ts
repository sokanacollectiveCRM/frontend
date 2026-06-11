import {
  canAccessBillingPortal,
  canAccessFullCrm,
  getBillingHomePath,
  isBillingOnlyRole,
  isBillingRole,
} from '@/common/auth/roles';
import { describe, expect, it } from 'vitest';

describe('billing role helpers', () => {
  it('recognizes only the billing role as the limited billing role', () => {
    expect(isBillingRole('billing')).toBe(true);
    expect(isBillingRole('accountant')).toBe(false);
    expect(isBillingRole('finance')).toBe(false);
    expect(isBillingRole('billing_admin')).toBe(false);
    expect(isBillingRole('admin')).toBe(false);
  });

  it('treats billing users as limited access and redirects them to billing home', () => {
    expect(isBillingOnlyRole('billing')).toBe(true);
    expect(canAccessBillingPortal('billing')).toBe(true);
    expect(canAccessFullCrm('billing', false)).toBe(false);
    expect(getBillingHomePath()).toBe('/billing/contracts');
  });

  it('preserves non-billing full CRM behavior', () => {
    expect(canAccessFullCrm('admin', false)).toBe(true);
    expect(canAccessFullCrm('doula', false)).toBe(true);
    expect(canAccessFullCrm('client', true)).toBe(true);
  });
});
