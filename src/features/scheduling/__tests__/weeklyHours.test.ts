import { describe, expect, it } from 'vitest';

import {
  WEEKLY_HOURS_HORIZON_WEEKS,
  copyDayToDays,
  emptyWeeklyHours,
  expandWeeklyHours,
  futureAvailableRecords,
  inferWeeklyHours,
  validateWeeklyHours,
} from '@/features/scheduling/weeklyHours';

function hoursWithMonday() {
  return emptyWeeklyHours().map((day) =>
    day.weekday === 1
      ? {
          ...day,
          enabled: true,
          ranges: [
            { start: '09:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
        }
      : day
  );
}

describe('copyDayToDays', () => {
  it('copies Monday ranges onto selected weekdays and leaves the rest alone', () => {
    const copied = copyDayToDays(hoursWithMonday(), 1, [2, 3, 5]);
    expect(copied.find((day) => day.weekday === 2)).toEqual({
      weekday: 2,
      enabled: true,
      ranges: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
      ],
    });
    expect(copied.find((day) => day.weekday === 5)?.enabled).toBe(true);
    expect(copied.find((day) => day.weekday === 4)?.enabled).toBe(false);
    expect(copied.find((day) => day.weekday === 0)?.enabled).toBe(false);
  });

  it('select-all weekdays copies onto Mon-Fri except the source', () => {
    const copied = copyDayToDays(hoursWithMonday(), 1, [1, 2, 3, 4, 5]);
    expect(
      copied.filter((day) => day.enabled).map((day) => day.weekday)
    ).toEqual([1, 2, 3, 4, 5]);
    expect(copied.find((day) => day.weekday === 6)?.enabled).toBe(false);
  });
});

describe('weekly hours expansion', () => {
  it('uses the single 8-week horizon constant', () => {
    expect(WEEKLY_HOURS_HORIZON_WEEKS).toBe(8);
  });

  it('expands enabled weekdays across the rolling window and skips past ranges', () => {
    const now = new Date(2026, 9, 12, 8, 0, 0);
    const windows = expandWeeklyHours(hoursWithMonday(), now);
    expect(windows[0]).toEqual({
      date: '2026-10-12',
      startTime: '09:00',
      endTime: '12:00',
    });
    expect(windows.every((window) => window.date >= '2026-10-12')).toBe(true);
    expect(windows.every((window) => window.date <= '2026-12-06')).toBe(true);
    expect(
      windows.filter((window) => window.startTime === '09:00')
    ).toHaveLength(WEEKLY_HOURS_HORIZON_WEEKS);
    expect(windows).toHaveLength(WEEKLY_HOURS_HORIZON_WEEKS * 2);
  });

  it('skips a same-day range that already ended', () => {
    const now = new Date(2026, 9, 12, 18, 0, 0);
    const windows = expandWeeklyHours(hoursWithMonday(), now);
    expect(windows.some((window) => window.date === '2026-10-12')).toBe(false);
    expect(windows[0]?.date).toBe('2026-10-19');
  });
});

describe('weekly hours validation and replace plan', () => {
  it('requires an enabled day and non-overlapping ranges', () => {
    expect(validateWeeklyHours(emptyWeeklyHours())).toMatch(/at least one/i);
    expect(
      validateWeeklyHours([
        {
          weekday: 1,
          enabled: true,
          ranges: [
            { start: '09:00', end: '13:00' },
            { start: '12:00', end: '17:00' },
          ],
        },
      ])
    ).toMatch(/overlap/i);
  });

  it('lists only future available windows for replacement', () => {
    const now = new Date('2026-10-12T15:00:00.000Z');
    const future = futureAvailableRecords(
      [
        {
          id: 'past',
          doulaId: 'd1',
          startAt: '2026-10-01T15:00:00.000Z',
          endAt: '2026-10-01T18:00:00.000Z',
          availabilityStatus: 'available',
          reason: null,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'keep-blackout',
          doulaId: 'd1',
          startAt: '2026-11-26T06:00:00.000Z',
          endAt: '2026-11-27T05:59:59.000Z',
          availabilityStatus: 'unavailable',
          reason: 'Holiday: Thanksgiving',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'replace',
          doulaId: 'd1',
          startAt: '2026-10-19T15:00:00.000Z',
          endAt: '2026-10-19T18:00:00.000Z',
          availabilityStatus: 'available',
          reason: null,
          createdAt: '',
          updatedAt: '',
        },
      ],
      now
    );
    expect(future.map((row) => row.id)).toEqual(['replace']);
  });

  it('infers weekday ranges from future available records', () => {
    const inferred = inferWeeklyHours(
      [
        {
          id: 'mon',
          doulaId: 'd1',
          startAt: new Date(2026, 9, 19, 10, 0).toISOString(),
          endAt: new Date(2026, 9, 19, 14, 0).toISOString(),
          availabilityStatus: 'available',
          reason: null,
          createdAt: '',
          updatedAt: '',
        },
      ],
      new Date(2026, 9, 12)
    );
    const monday = inferred.find((day) => day.weekday === 1);
    expect(monday?.enabled).toBe(true);
    expect(monday?.ranges).toEqual([{ start: '10:00', end: '14:00' }]);
  });
});
