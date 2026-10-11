import { describe, expect, it } from 'vitest';

import {
  validateAvailabilityForm,
  validateBlackoutForm,
} from '@/features/scheduling/availabilityForm';

describe('availability form validation', () => {
  it('accepts a valid window with weekly repeat', () => {
    expect(
      validateAvailabilityForm({
        date: '2026-10-13',
        startTime: '10:00',
        endTime: '14:00',
        repeatWeeks: 2,
      })
    ).toBeNull();
  });

  it('rejects a missing date or inverted times', () => {
    expect(
      validateAvailabilityForm({
        date: '',
        startTime: '10:00',
        endTime: '14:00',
        repeatWeeks: 1,
      })
    ).toMatch(/date/i);
    expect(
      validateAvailabilityForm({
        date: '2026-10-13',
        startTime: '14:00',
        endTime: '10:00',
        repeatWeeks: 1,
      })
    ).toMatch(/after start/i);
  });

  it('rejects a repeat outside 1-12 weeks', () => {
    expect(
      validateAvailabilityForm({
        date: '2026-10-13',
        startTime: '10:00',
        endTime: '14:00',
        repeatWeeks: 0,
      })
    ).toMatch(/1 and 12/);
  });
});

describe('blackout form validation', () => {
  it('accepts an inclusive date range', () => {
    expect(
      validateBlackoutForm({
        fromDate: '2026-10-16',
        toDate: '2026-10-16',
        reason: 'Training',
      })
    ).toBeNull();
  });

  it('rejects a missing or inverted range', () => {
    expect(
      validateBlackoutForm({
        fromDate: '',
        toDate: '2026-10-16',
        reason: 'Training',
      })
    ).toMatch(/start date/i);
    expect(
      validateBlackoutForm({
        fromDate: '2026-10-17',
        toDate: '2026-10-16',
        reason: 'Training',
      })
    ).toMatch(/on or after/i);
  });
});
