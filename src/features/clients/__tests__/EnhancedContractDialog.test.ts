import { describe, expect, it } from 'vitest';
import {
  buildInstallmentAmounts,
  buildPaymentDates,
  calculateDepositAmount,
} from '../components/dialog/EnhancedContractDialog';

describe('EnhancedContractDialog installment math', () => {
  it('calculates percent deposits in cents', () => {
    expect(calculateDepositAmount(5000, 'percent', 20)).toBe(1000);
    expect(calculateDepositAmount(4999.99, 'percent', 50)).toBe(2500);
  });

  it('calculates flat deposits in cents', () => {
    expect(calculateDepositAmount(5000, 'flat', 1000)).toBe(1000);
    expect(calculateDepositAmount(5000, 'flat', 1000.129)).toBe(1000.13);
  });

  it('assigns any rounding remainder to the last installment', () => {
    const installments = buildInstallmentAmounts(2500, 3);

    expect(installments).toEqual([833.33, 833.33, 833.34]);
    expect(installments.reduce((sum, value) => sum + value, 0)).toBe(2500);
  });

  it('returns equal installments when the balance divides evenly', () => {
    const installments = buildInstallmentAmounts(2400, 3);

    expect(installments).toEqual([800, 800, 800]);
    expect(installments.reduce((sum, value) => sum + value, 0)).toBe(2400);
  });

  it('returns an empty array when installments count is zero or negative', () => {
    expect(buildInstallmentAmounts(1000, 0)).toEqual([]);
    expect(buildInstallmentAmounts(1000, -1)).toEqual([]);
  });

  it('reconciles deposit plus installments back to the total contract amount', () => {
    const total = 5000;
    const deposit = calculateDepositAmount(total, 'percent', 20);
    const balance = total - deposit;
    const installments = buildInstallmentAmounts(balance, 3);

    expect(deposit).toBe(1000);
    expect(balance).toBe(4000);
    expect(installments).toEqual([1333.33, 1333.33, 1333.34]);
    expect(deposit + installments.reduce((sum, value) => sum + value, 0)).toBe(total);
  });
});

describe('EnhancedContractDialog payment dates', () => {
  it('builds a monthly deposit schedule with the expected number of rows', () => {
    const dates = buildPaymentDates('monthly', 3, new Date('2026-06-10T12:00:00Z'));

    expect(dates.map((item) => item.label)).toEqual([
      'Deposit',
      'Payment 1',
      'Payment 2',
      'Payment 3',
    ]);
    expect(dates.map((item) => item.date)).toEqual([
      'June 10, 2026',
      'July 10, 2026',
      'August 10, 2026',
      'September 10, 2026',
    ]);
  });

  it('builds a biweekly deposit schedule with 14-day spacing', () => {
    const dates = buildPaymentDates('biweekly', 3, new Date('2026-06-10T12:00:00Z'));

    expect(dates.map((item) => item.date)).toEqual([
      'June 10, 2026',
      'June 24, 2026',
      'July 8, 2026',
      'July 22, 2026',
    ]);
  });
});
