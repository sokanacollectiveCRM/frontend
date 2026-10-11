import { describe, expect, it } from 'vitest';

import {
  formatTimeOffReason,
  parseTimeOffReason,
  timeOffBlocksRange,
  timeOffToWindow,
  upcomingUsHolidays,
  validateTimeOffForm,
} from '@/features/scheduling/timeOff';

describe('time-off reasons', () => {
  it('stores the type in the unavailable reason', () => {
    expect(formatTimeOffReason('Holiday', 'Thanksgiving')).toBe(
      'Holiday: Thanksgiving'
    );
    expect(formatTimeOffReason('Vacation')).toBe('Vacation');
    expect(formatTimeOffReason('Other', 'Training')).toBe('Other: Training');
    expect(parseTimeOffReason('Holiday: Thanksgiving')).toEqual({
      type: 'Holiday',
      label: 'Thanksgiving',
    });
  });
});

describe('time-off validation and windows', () => {
  it('requires a reason for Other and a holiday name', () => {
    expect(
      validateTimeOffForm({
        type: 'Other',
        coverage: 'single_day',
        fromDate: '2026-10-16',
        toDate: '',
        startTime: '09:00',
        endTime: '17:00',
        reason: '',
      })
    ).toMatch(/reason/i);
    expect(
      validateTimeOffForm({
        type: 'Holiday',
        coverage: 'single_day',
        fromDate: '2026-11-26',
        toDate: '',
        startTime: '09:00',
        endTime: '17:00',
        reason: '',
      })
    ).toMatch(/holiday/i);
  });

  it('builds all-day and part-day unavailable windows', () => {
    const holiday = timeOffToWindow({
      type: 'Holiday',
      coverage: 'single_day',
      fromDate: '2026-11-26',
      toDate: '',
      startTime: '09:00',
      endTime: '17:00',
      reason: 'Thanksgiving',
    });
    expect(holiday.reason).toBe('Holiday: Thanksgiving');
    expect(holiday.startAt).toBe(new Date(2026, 10, 26, 0, 0, 0).toISOString());

    const afternoon = timeOffToWindow({
      type: 'Vacation',
      coverage: 'part_of_day',
      fromDate: '2026-10-16',
      toDate: '',
      startTime: '13:00',
      endTime: '17:00',
      reason: '',
    });
    expect(afternoon.startAt).toBe(
      new Date(2026, 9, 16, 13, 0, 0).toISOString()
    );
    expect(afternoon.endAt).toBe(new Date(2026, 9, 16, 17, 0, 0).toISOString());
  });
});

describe('time-off blocking', () => {
  const thanksgiving = timeOffToWindow({
    type: 'Holiday',
    coverage: 'single_day',
    fromDate: '2026-11-26',
    toDate: '',
    startTime: '09:00',
    endTime: '17:00',
    reason: 'Thanksgiving',
  });
  const vacation = timeOffToWindow({
    type: 'Vacation',
    coverage: 'date_range',
    fromDate: '2026-10-19',
    toDate: '2026-10-23',
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
  });
  const afternoon = timeOffToWindow({
    type: 'Other',
    coverage: 'part_of_day',
    fromDate: '2026-10-16',
    toDate: '',
    startTime: '13:00',
    endTime: '17:00',
    reason: 'Training',
  });

  it('blocks a visit that overlaps a holiday or vacation week', () => {
    expect(
      timeOffBlocksRange(
        [thanksgiving, vacation],
        new Date(2026, 10, 26, 10, 0).toISOString(),
        new Date(2026, 10, 26, 11, 0).toISOString()
      )
    ).toBe(true);
    expect(
      timeOffBlocksRange(
        [thanksgiving, vacation],
        new Date(2026, 9, 20, 10, 0).toISOString(),
        new Date(2026, 9, 20, 11, 0).toISOString()
      )
    ).toBe(true);
  });

  it('does not block a morning slot when only the afternoon is off', () => {
    expect(
      timeOffBlocksRange(
        [afternoon],
        new Date(2026, 9, 16, 10, 0).toISOString(),
        new Date(2026, 9, 16, 11, 0).toISOString()
      )
    ).toBe(false);
    expect(
      timeOffBlocksRange(
        [afternoon],
        new Date(2026, 9, 16, 13, 0).toISOString(),
        new Date(2026, 9, 16, 14, 0).toISOString()
      )
    ).toBe(true);
  });
});

describe('US holiday quick-add', () => {
  it('includes Thanksgiving and common holidays for the next 12 months', () => {
    const holidays = upcomingUsHolidays(new Date(2026, 9, 11));
    expect(holidays.some((holiday) => holiday.name === 'Thanksgiving')).toBe(
      true
    );
    expect(
      holidays.find((holiday) => holiday.name === 'Thanksgiving')?.date
    ).toBe('2026-11-26');
    expect(holidays.some((holiday) => holiday.name === 'Christmas Day')).toBe(
      true
    );
    expect(holidays.every((holiday) => holiday.date >= '2026-10-11')).toBe(
      true
    );
  });
});
