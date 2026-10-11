import { addDays } from 'date-fns';

import type { SchedulingSlot } from '@/api/scheduling/schedulingService';

export const DEFAULT_SCHEDULING_TIME_ZONE = 'America/Chicago';

export interface GroupedSlotDay {
  dateKey: string;
  label: string;
  slots: SchedulingSlot[];
}

function timeZoneOrFallback(timeZone?: string): string {
  if (timeZone && timeZone.trim()) return timeZone;
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      DEFAULT_SCHEDULING_TIME_ZONE
    );
  } catch {
    return DEFAULT_SCHEDULING_TIME_ZONE;
  }
}

export function getBrowserTimeZone(): string {
  return timeZoneOrFallback();
}

export function formatDateKey(
  iso: string,
  timeZone: string = getBrowserTimeZone()
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatTimeWithZone(
  iso: string,
  timeZone: string = getBrowserTimeZone()
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export function formatDateTimeWithZone(
  iso: string,
  timeZone: string = getBrowserTimeZone()
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export function formatDayHeading(
  iso: string,
  timeZone: string = getBrowserTimeZone()
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatTimeRangeWithZone(
  startAt: string,
  endAt: string,
  timeZone: string = getBrowserTimeZone()
): string {
  const start = formatDateTimeWithZone(startAt, timeZone);
  const end = formatTimeWithZone(endAt, timeZone);
  return `${start} – ${end}`;
}

export function groupSlotsByDay(
  slots: SchedulingSlot[],
  timeZone: string = getBrowserTimeZone()
): GroupedSlotDay[] {
  const groups = new Map<string, GroupedSlotDay>();
  const sorted = [...slots].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  for (const slot of sorted) {
    const dateKey = formatDateKey(slot.startAt, timeZone);
    if (!dateKey) continue;
    const existing = groups.get(dateKey);
    if (existing) {
      existing.slots.push(slot);
      continue;
    }
    groups.set(dateKey, {
      dateKey,
      label: formatDayHeading(slot.startAt, timeZone),
      slots: [slot],
    });
  }

  return [...groups.values()];
}

export function localDateTimeToUtcIso(date: string, time: string): string {
  const normalizedDate = date.trim();
  const normalizedTime =
    time.trim().length === 5 ? `${time.trim()}:00` : time.trim();
  const parsed = new Date(`${normalizedDate}T${normalizedTime}`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Enter a valid date and time.');
  }
  return parsed.toISOString();
}

export function addLocalDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  const next = new Date(year, month - 1, day + days);
  const yyyy = String(next.getFullYear()).padStart(4, '0');
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function nextFourteenDayRange(now: Date = new Date()): {
  from: string;
  to: string;
} {
  return {
    from: now.toISOString(),
    to: addDays(now, 14).toISOString(),
  };
}

export function startOfLocalDayIso(date: string): string {
  return localDateTimeToUtcIso(date, '00:00');
}

export function endOfLocalDayIso(date: string): string {
  const parsed = new Date(`${date.trim()}T23:59:59.999`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Enter a valid date.');
  }
  return parsed.toISOString();
}
