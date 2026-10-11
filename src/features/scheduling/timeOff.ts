import type { DoulaAvailabilityRecord } from '@/api/doulas/doulaService';

import {
  addLocalDays,
  endOfLocalDayIso,
  localDateTimeToUtcIso,
  startOfLocalDayIso,
} from '@/features/scheduling/schedulingTime';
import { localDateFromDate } from '@/features/scheduling/weeklyHours';

export const TIME_OFF_TYPES = ['Holiday', 'Vacation', 'Other'] as const;

export type TimeOffType = (typeof TIME_OFF_TYPES)[number];

export type TimeOffCoverage = 'single_day' | 'date_range' | 'part_of_day';

export interface TimeOffFormValues {
  type: TimeOffType;
  coverage: TimeOffCoverage;
  fromDate: string;
  toDate: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface TimeOffWindow {
  startAt: string;
  endAt: string;
  reason: string;
  type: TimeOffType;
  label: string;
}

export interface UsHoliday {
  date: string;
  name: string;
}

const HOLIDAY_PREFIX = 'Holiday:';
const VACATION_PREFIX = 'Vacation';
const OTHER_PREFIX = 'Other:';

export function emptyTimeOffForm(): TimeOffFormValues {
  return {
    type: 'Vacation',
    coverage: 'single_day',
    fromDate: '',
    toDate: '',
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
  };
}

export function formatTimeOffReason(type: TimeOffType, reason = ''): string {
  const trimmed = reason.trim();
  if (type === 'Holiday') {
    return trimmed ? `${HOLIDAY_PREFIX} ${trimmed}` : 'Holiday';
  }
  if (type === 'Vacation') {
    return trimmed ? `${VACATION_PREFIX}: ${trimmed}` : VACATION_PREFIX;
  }
  return trimmed ? `${OTHER_PREFIX} ${trimmed}` : 'Other';
}

export function parseTimeOffReason(reason: string | null): {
  type: TimeOffType;
  label: string;
} {
  const value = (reason || '').trim();
  if (value.startsWith(HOLIDAY_PREFIX)) {
    return {
      type: 'Holiday',
      label: value.slice(HOLIDAY_PREFIX.length).trim() || 'Holiday',
    };
  }
  if (value === VACATION_PREFIX || value.startsWith(`${VACATION_PREFIX}:`)) {
    return {
      type: 'Vacation',
      label:
        value === VACATION_PREFIX
          ? 'Vacation'
          : value.slice(VACATION_PREFIX.length + 1).trim() || 'Vacation',
    };
  }
  if (value.startsWith(OTHER_PREFIX)) {
    return {
      type: 'Other',
      label: value.slice(OTHER_PREFIX.length).trim() || 'Other',
    };
  }
  return {
    type: value ? 'Other' : 'Vacation',
    label: value || 'Time off',
  };
}

export function validateTimeOffForm(values: TimeOffFormValues): string | null {
  if (!values.fromDate.trim()) return 'Choose a start date for time off.';
  const toDate =
    values.coverage === 'date_range' ? values.toDate.trim() : values.fromDate;
  if (values.coverage === 'date_range' && !values.toDate.trim()) {
    return 'Choose an end date for this time off.';
  }
  if (toDate < values.fromDate) {
    return 'Time off end date must be on or after the start date.';
  }
  if (values.coverage === 'part_of_day') {
    if (!values.startTime.trim() || !values.endTime.trim()) {
      return 'Choose a start time and an end time for part-day time off.';
    }
    if (values.startTime >= values.endTime) {
      return 'End time must be after start time.';
    }
  }
  if (values.type === 'Other' && !values.reason.trim()) {
    return 'Add a short reason for Other time off.';
  }
  if (values.type === 'Holiday' && !values.reason.trim()) {
    return 'Name the holiday.';
  }
  return null;
}

export function timeOffToWindow(values: TimeOffFormValues): TimeOffWindow {
  const toDate =
    values.coverage === 'date_range' ? values.toDate : values.fromDate;
  const reason = formatTimeOffReason(values.type, values.reason);
  const parsed = parseTimeOffReason(reason);
  if (values.coverage === 'part_of_day') {
    return {
      startAt: localDateTimeToUtcIso(values.fromDate, values.startTime),
      endAt: localDateTimeToUtcIso(values.fromDate, values.endTime),
      reason,
      type: parsed.type,
      label: parsed.label,
    };
  }
  return {
    startAt: startOfLocalDayIso(values.fromDate),
    endAt: endOfLocalDayIso(toDate),
    reason,
    type: parsed.type,
    label: parsed.label,
  };
}

export function timeOffBlocksRange(
  windows: Array<Pick<TimeOffWindow, 'startAt' | 'endAt'>>,
  startAt: string,
  endAt: string
): boolean {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  return windows.some((window) => {
    const windowStart = new Date(window.startAt).getTime();
    const windowEnd = new Date(window.endAt).getTime();
    return start < windowEnd && windowStart < end;
  });
}

export function upcomingTimeOff(
  records: DoulaAvailabilityRecord[],
  now: Date = new Date()
): Array<DoulaAvailabilityRecord & { type: TimeOffType; label: string }> {
  return records
    .filter(
      (record) =>
        record.availabilityStatus === 'unavailable' &&
        new Date(record.endAt).getTime() > now.getTime()
    )
    .map((record) => ({
      ...record,
      ...parseTimeOffReason(record.reason),
    }))
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
}

function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number
): string {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  return localDateFromDate(new Date(year, month, day));
}

function lastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number
): string {
  const last = new Date(year, month + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return localDateFromDate(new Date(year, month + 1, -offset));
}

function observedDate(year: number, month: number, day: number): string {
  const date = new Date(year, month, day);
  const weekday = date.getDay();
  if (weekday === 6) return localDateFromDate(new Date(year, month, day - 1));
  if (weekday === 0) return localDateFromDate(new Date(year, month, day + 1));
  return localDateFromDate(date);
}

function holidaysForYear(year: number): UsHoliday[] {
  return [
    { date: observedDate(year, 0, 1), name: "New Year's Day" },
    {
      date: nthWeekdayOfMonth(year, 0, 1, 3),
      name: 'Martin Luther King Jr. Day',
    },
    { date: nthWeekdayOfMonth(year, 1, 1, 3), name: "Presidents' Day" },
    { date: lastWeekdayOfMonth(year, 4, 1), name: 'Memorial Day' },
    { date: observedDate(year, 5, 19), name: 'Juneteenth' },
    { date: observedDate(year, 6, 4), name: 'Independence Day' },
    { date: nthWeekdayOfMonth(year, 8, 1, 1), name: 'Labor Day' },
    {
      date: nthWeekdayOfMonth(year, 9, 1, 2),
      name: 'Indigenous Peoples’ Day',
    },
    { date: observedDate(year, 10, 11), name: 'Veterans Day' },
    { date: nthWeekdayOfMonth(year, 10, 4, 4), name: 'Thanksgiving' },
    { date: observedDate(year, 11, 25), name: 'Christmas Day' },
  ];
}

export function upcomingUsHolidays(
  now: Date = new Date(),
  months = 12
): UsHoliday[] {
  const start = localDateFromDate(now);
  const end = addLocalDays(start, months * 31);
  const years = new Set([now.getFullYear(), now.getFullYear() + 1]);
  const seen = new Set<string>();
  return [...years]
    .flatMap((year) => holidaysForYear(year))
    .filter((holiday) => {
      if (holiday.date < start || holiday.date > end) return false;
      const key = `${holiday.date}:${holiday.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name)
    );
}
