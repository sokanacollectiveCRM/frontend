import { describe, expect, it, vi } from 'vitest';

import {
  canInviteToPortal,
  formatYesNo,
  getBillingPathLabel,
  getPortalBlockerDescription,
  getPortalBlockerLabel,
  getReadinessGateSummary,
  normalizeClientEligibility,
} from '../portalEligibility';

describe('portalEligibility display helpers', () => {
  it('maps blocker labels and descriptions', () => {
    expect(getPortalBlockerLabel('missing_card_on_file')).toBe('Missing card on file');
    expect(getPortalBlockerDescription('missing_card_on_file')).toBe(
      'Deposit paid, but no reusable payment method was saved in QuickBooks.'
    );
    expect(getPortalBlockerLabel('contract_unsigned')).toBe('Contract unsigned');
    expect(getPortalBlockerLabel('deposit_unpaid')).toBe('Deposit unpaid');
    expect(getPortalBlockerLabel('payment_authorization_required')).toBe(
      'Payment authorization required'
    );
    expect(getPortalBlockerLabel('billing_path_unknown')).toBe('Billing path unknown');
  });

  it('maps billing path labels', () => {
    expect(getBillingPathLabel('insurance')).toBe('Insurance');
    expect(getBillingPathLabel('self_pay')).toBe('Self-Pay');
    expect(getBillingPathLabel(null)).toBe('—');
  });

  it('normalizes snake_case and camelCase eligibility fields', () => {
    const normalized = normalizeClientEligibility({
      isEligible: false,
      primaryPortalBlocker: 'deposit_unpaid',
      portalBlockers: ['deposit_unpaid'],
      billingPath: 'insurance',
      paymentAuthorizationRequired: true,
      cardOnFile: false,
    });

    expect(normalized.is_eligible).toBe(false);
    expect(normalized.primary_portal_blocker).toBe('deposit_unpaid');
    expect(normalized.billing_path).toBe('insurance');
    expect(normalized.payment_authorization_required).toBe(true);
    expect(normalized.card_on_file).toBe(false);
  });

  it('allows portal invite when backend is_eligible is true', () => {
    expect(canInviteToPortal({ is_eligible: true })).toBe(true);
    expect(canInviteToPortal({ isEligible: true })).toBe(true);
    expect(canInviteToPortal({ is_eligible: false })).toBe(false);
    expect(canInviteToPortal({ isEligible: false })).toBe(false);
  });

  it('treats backend invite allowed_actions as authoritative when present', () => {
    expect(
      canInviteToPortal({
        is_eligible: true,
        allowed_actions: { can_invite_to_portal: false },
      })
    ).toBe(false);

    expect(
      canInviteToPortal({
        is_eligible: false,
        allowed_actions: { can_invite_to_portal: true },
      })
    ).toBe(true);
  });

  it('uses legacy contract + deposit fallback when is_eligible is absent', () => {
    expect(
      canInviteToPortal({
        has_signed_contract: true,
        has_completed_payment: true,
      })
    ).toBe(true);
    expect(
      canInviteToPortal({
        has_signed_contract: true,
        has_completed_payment: false,
      })
    ).toBe(false);
    expect(canInviteToPortal({})).toBe(false);
  });

  it('renders readiness gate summary from backend fields', () => {
    const summary = getReadinessGateSummary({
      is_eligible: false,
      primary_portal_blocker: 'missing_card_on_file',
      billing_path: 'self_pay',
      payment_authorization_required: true,
      payment_authorization_satisfied: false,
      card_on_file: false,
      has_signed_contract: true,
      has_completed_payment: true,
      verification_invoice_sent_at: '2026-01-02T12:00:00Z',
    });

    expect(summary.contractSigned).toBe(true);
    expect(summary.depositPaid).toBe(true);
    expect(summary.billingPath).toBe('self_pay');
    expect(summary.portalEligibility).toBe('locked');
    expect(summary.primaryBlocker).toBe('missing_card_on_file');
    expect(summary.verificationInvoiceStatus).toContain('Sent');
  });

  it('uses the same invite fallback rules in readiness summary when is_eligible is absent', () => {
    expect(
      getReadinessGateSummary({
        allowed_actions: { can_invite_to_portal: true },
      }).portalEligibility
    ).toBe('eligible');

    expect(
      getReadinessGateSummary({
        has_signed_contract: true,
        has_completed_payment: true,
      }).portalEligibility
    ).toBe('eligible');

    expect(
      getReadinessGateSummary({
        allowed_actions: { can_invite_to_portal: false },
      }).portalEligibility
    ).toBe('locked');
  });

  it('uses backend invite allowed_actions first in readiness summary', () => {
    expect(
      getReadinessGateSummary({
        is_eligible: true,
        allowed_actions: { can_invite_to_portal: false },
      }).portalEligibility
    ).toBe('locked');
  });

  it('formats yes/no with null-safe fallback', () => {
    expect(formatYesNo(true)).toBe('Yes');
    expect(formatYesNo(false)).toBe('No');
    expect(formatYesNo(null)).toBe('—');
    expect(formatYesNo(undefined)).toBe('—');
  });
});

describe('generateInstallmentInvoice API', () => {
  it('posts only the client and installment identifiers', async () => {
    vi.resetModules();

    vi.doMock('@/api/config', () => ({
      API_CONFIG: { useLegacyApi: false, baseUrl: 'https://api.example.com' },
    }));

    const post = vi.fn().mockResolvedValue({
      message: 'Invoice created',
      payment_link: 'https://pay.example/invoice/1',
    });

    vi.doMock('@/api/http', () => ({ post }));
    vi.doMock('@/common/utils/syncQuickBooksCustomer', () => ({
      syncQuickBooksCustomerFromClient: vi.fn(),
    }));

    const { generateInstallmentInvoice } = await import('@/api/services/clients.service');
    const result = await generateInstallmentInvoice('client-123', 'installment-2');

    expect(post).toHaveBeenCalledWith('/clients/client-123/billing/installments/installment-2/invoice');
    expect(result.payment_link).toBe('https://pay.example/invoice/1');
  });
});
