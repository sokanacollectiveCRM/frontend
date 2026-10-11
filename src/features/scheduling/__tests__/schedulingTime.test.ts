import { describe, expect, it } from 'vitest';

import {
  formatDateKey,
  formatDateTimeWithZone,
  formatTimeRangeWithZone,
  groupSlotsByDay,
  localDateTimeToUtcIso,
} from '@/features/scheduling/schedulingTime';

const CHICAGO = 'America/Chicago';

describe('scheduling time helpers', () => {
  it('groups slots by America/Chicago calendar day', () => {
    const groups = groupSlotsByDay(
      [
        {
          startAt: '2026-10-15T15:00:00.000Z',
          endAt: '2026-10-15T16:00:00.000Z',
        },
        {
          startAt: '2026-10-15T16:00:00.000Z',
          endAt: '2026-10-15T17:00:00.000Z',
        },
        {
          startAt: '2026-10-16T15:00:00.000Z',
          endAt: '2026-10-16T16:00:00.000Z',
        },
      ],
      CHICAGO
    );

    expect(groups).toHaveLength(2);
    expect(groups[0]?.dateKey).toBe('2026-10-15');
    expect(groups[0]?.slots).toHaveLength(2);
    expect(groups[1]?.dateKey).toBe('2026-10-16');
    expect(groups[0]?.label).toMatch(/Thursday/i);
  });

  it('keeps DST fallback Sunday (Nov 1 2026) on the Chicago calendar day', () => {
    const groups = groupSlotsByDay(
      [
        {
          startAt: '2026-11-01T16:00:00.000Z',
          endAt: '2026-11-01T17:00:00.000Z',
        },
      ],
      CHICAGO
    );

    expect(formatDateKey('2026-11-01T16:00:00.000Z', CHICAGO)).toBe(
      '2026-11-01'
    );
    expect(groups[0]?.dateKey).toBe('2026-11-01');
    expect(formatDateTimeWithZone('2026-11-01T16:00:00.000Z', CHICAGO)).toMatch(
      /CST|CDT/
    );
  });

  it('includes a zone label on formatted ranges', () => {
    const label = formatTimeRangeWithZone(
      '2026-10-15T15:00:00.000Z',
      '2026-10-15T16:00:00.000Z',
      CHICAGO
    );
    expect(label).toMatch(/CDT|CST/);
    expect(label).toMatch(/10:00/);
  });

  it('converts a local date+time to UTC ISO', () => {
    const iso = localDateTimeToUtcIso('2026-10-15', '10:00');
    expect(Number.isNaN(new Date(iso).getTime())).toBe(false);
    expect(iso.endsWith('Z')).toBe(true);
  });
});
