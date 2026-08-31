import {
  isFullSupportMethod,
  normalizeBillingPaymentMethod,
  toBillingApiPaymentMethod,
} from './paymentRules';
import { describe, expect, it } from 'vitest';

describe('payment rule normalization', () => {
  it('preserves full-support and unresolved billing paths for the backend', () => {
    expect(
      toBillingApiPaymentMethod('I am unable to pay / Full Support Option')
    ).toBe('I am unable to pay / Full Support Option');
    expect(
      toBillingApiPaymentMethod('Not sure / Need help figuring this out')
    ).toBe('Not sure / Need help figuring this out');
  });

  it('normalizes explicit no-payment labels without converting them to self-pay', () => {
    expect(normalizeBillingPaymentMethod('no client payment')).toBe(
      'No Payment Required'
    );
    expect(toBillingApiPaymentMethod('No Payment Required')).toBe(
      'No Payment Required'
    );
    expect(isFullSupportMethod('Payment Waived')).toBe(true);
  });
});
