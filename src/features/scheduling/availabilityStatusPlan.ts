export interface AvailabilityInterval {
  id: string;
  startAt: string;
  endAt: string;
  availabilityStatus: 'available' | 'unavailable';
  reason: string | null;
}

export type AvailabilityMutation =
  | { type: 'delete'; id: string }
  | {
      type: 'update';
      id: string;
      startAt: string;
      endAt: string;
      reason: string | null;
    };

export function intervalCoversInstant(
  startAt: string,
  endAt: string,
  now: Date
): boolean {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const instant = now.getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return start <= instant && instant < end;
}

export function startOfLocalTomorrow(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

/**
 * Saving profile status "Available" must only end the blackout that covers
 * right now. Future blackouts stay on the calendar.
 */
export function planMarkAvailableMutations(
  records: AvailabilityInterval[],
  now: Date = new Date()
): AvailabilityMutation[] {
  const tomorrow = startOfLocalTomorrow(now);
  const mutations: AvailabilityMutation[] = [];

  for (const record of records) {
    if (record.availabilityStatus !== 'unavailable') continue;
    if (!intervalCoversInstant(record.startAt, record.endAt, now)) continue;

    const endsAfterTomorrow =
      new Date(record.endAt).getTime() > tomorrow.getTime();
    if (endsAfterTomorrow) {
      mutations.push({
        type: 'update',
        id: record.id,
        startAt: tomorrow.toISOString(),
        endAt: record.endAt,
        reason: record.reason,
      });
    } else {
      mutations.push({ type: 'delete', id: record.id });
    }
  }

  return mutations;
}

export function findCoveringUnavailableRecord<T extends AvailabilityInterval>(
  records: T[],
  now: Date = new Date()
): T | undefined {
  return records.find(
    (record) =>
      record.availabilityStatus === 'unavailable' &&
      intervalCoversInstant(record.startAt, record.endAt, now)
  );
}
