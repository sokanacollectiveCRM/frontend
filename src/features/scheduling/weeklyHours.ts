import type { DoulaAvailabilityRecord } from '@/api/doulas/doulaService';

import {
  addLocalDays,
  formatDateKey,
  localDateTimeToUtcIso,
} from '@/features/scheduling/schedulingTime';

export const WEEKLY_HOURS_HORIZON_WEEKS = 8;

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const WEEKDAYS = [1, 2, 3, 4, 5] as const;

export const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export interface TimeRange {
  start: string;
  end: string;
}

export interface WeekdayHours {
  weekday: number;
  enabled: boolean;
  ranges: TimeRange[];
}

export interface LocalAvailabilityWindow {
  date: string;
  startTime: string;
  endTime: string;
}

export function weekdaySlug(weekday: number): string {
  return (WEEKDAY_LABELS[weekday] || 'day').toLowerCase();
}

export function emptyTimeRange(): TimeRange {
  return { start: '09:00', end: '17:00' };
}

export function emptyWeeklyHours(): WeekdayHours[] {
  return WEEKDAY_ORDER.map((weekday) => ({
    weekday,
    enabled: false,
    ranges: [emptyTimeRange()],
  }));
}

export function copyDayToDays(
  hours: WeekdayHours[],
  sourceWeekday: number,
  targetWeekdays: number[]
): WeekdayHours[] {
  const source = hours.find((day) => day.weekday === sourceWeekday);
  if (!source) return hours.map((day) => ({ ...day, ranges: [...day.ranges] }));

  const copiedRanges = source.ranges.map((range) => ({ ...range }));
  const targets = new Set(
    targetWeekdays.filter((day) => day !== sourceWeekday)
  );

  return hours.map((day) => {
    if (!targets.has(day.weekday)) {
      return { ...day, ranges: day.ranges.map((range) => ({ ...range })) };
    }
    return {
      weekday: day.weekday,
      enabled: source.enabled,
      ranges:
        copiedRanges.length > 0
          ? copiedRanges.map((range) => ({ ...range }))
          : [emptyTimeRange()],
    };
  });
}

export function validateTimeRange(range: TimeRange): string | null {
  if (!range.start.trim() || !range.end.trim()) {
    return 'Each range needs a start time and an end time.';
  }
  if (range.start >= range.end) {
    return 'End time must be after start time.';
  }
  return null;
}

export function validateWeeklyHours(hours: WeekdayHours[]): string | null {
  const enabledDays = hours.filter((day) => day.enabled);
  if (enabledDays.length === 0) {
    return 'Turn on at least one weekday before saving weekly hours.';
  }
  for (const day of enabledDays) {
    if (day.ranges.length === 0) {
      return `Add at least one time range for ${WEEKDAY_LABELS[day.weekday]}.`;
    }
    for (const range of day.ranges) {
      const rangeError = validateTimeRange(range);
      if (rangeError) {
        return `${WEEKDAY_LABELS[day.weekday]}: ${rangeError}`;
      }
    }
    const sorted = [...day.ranges].sort((a, b) =>
      a.start.localeCompare(b.start)
    );
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      if (previous && current && previous.end > current.start) {
        return `${WEEKDAY_LABELS[day.weekday]}: time ranges overlap.`;
      }
    }
  }
  return null;
}

export function localDateFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function weekdayFromLocalDate(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1).getDay();
}

export function expandWeeklyHours(
  hours: WeekdayHours[],
  now: Date = new Date(),
  horizonWeeks: number = WEEKLY_HOURS_HORIZON_WEEKS
): LocalAvailabilityWindow[] {
  const startDate = localDateFromDate(now);
  const windows: LocalAvailabilityWindow[] = [];
  const totalDays = horizonWeeks * 7;

  for (let offset = 0; offset < totalDays; offset += 1) {
    const date = addLocalDays(startDate, offset);
    const weekday = weekdayFromLocalDate(date);
    const day = hours.find((entry) => entry.weekday === weekday);
    if (!day?.enabled) continue;
    for (const range of day.ranges) {
      if (validateTimeRange(range)) continue;
      const endAt = new Date(localDateTimeToUtcIso(date, range.end));
      if (endAt.getTime() <= now.getTime()) continue;
      windows.push({
        date,
        startTime: range.start,
        endTime: range.end,
      });
    }
  }
  return windows;
}

function localTimeFromIso(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

export function inferWeeklyHours(
  records: DoulaAvailabilityRecord[],
  now: Date = new Date()
): WeekdayHours[] {
  const template = emptyWeeklyHours();
  const rangesByDay = new Map<number, Map<string, TimeRange>>();

  for (const record of records) {
    if (record.availabilityStatus !== 'available') continue;
    if (new Date(record.endAt).getTime() <= now.getTime()) continue;
    const dateKey = formatDateKey(record.startAt);
    if (!dateKey) continue;
    const weekday = weekdayFromLocalDate(dateKey);
    const range = {
      start: localTimeFromIso(record.startAt),
      end: localTimeFromIso(record.endAt),
    };
    if (!range.start || !range.end) continue;
    const existing = rangesByDay.get(weekday) ?? new Map<string, TimeRange>();
    existing.set(`${range.start}-${range.end}`, range);
    rangesByDay.set(weekday, existing);
  }

  return template.map((day) => {
    const ranges = [...(rangesByDay.get(day.weekday)?.values() ?? [])].sort(
      (a, b) => a.start.localeCompare(b.start)
    );
    if (ranges.length === 0) return day;
    return {
      weekday: day.weekday,
      enabled: true,
      ranges,
    };
  });
}

export function futureAvailableRecords(
  records: DoulaAvailabilityRecord[],
  now: Date = new Date()
): DoulaAvailabilityRecord[] {
  return records.filter(
    (record) =>
      record.availabilityStatus === 'available' &&
      new Date(record.endAt).getTime() > now.getTime()
  );
}
