import {
  canAccessBillingPortal,
  canAccessFullCrm,
  getBillingHomePath,
  isBillingOnlyRole,
  isBillingRole,
  isStaffRole,
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
    expect(canAccessFullCrm('client', true)).toBe(false);
    expect(canAccessFullCrm('client', false)).toBe(false);
  });

  it('treats admin, doula, and billing as staff and never infers staff from empty role', () => {
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('doula')).toBe(true);
    expect(isStaffRole('billing')).toBe(true);
    expect(isStaffRole('client')).toBe(false);
    expect(isStaffRole(undefined)).toBe(false);
  });
});
