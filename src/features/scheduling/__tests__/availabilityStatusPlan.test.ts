import { describe, expect, it } from 'vitest';

import {
  findCoveringUnavailableRecord,
  planMarkAvailableMutations,
} from '@/features/scheduling/availabilityStatusPlan';

const now = new Date('2026-10-12T17:00:00.000Z');

describe('planMarkAvailableMutations', () => {
  it('deletes only the blackout that covers today and keeps future rows', () => {
    const mutations = planMarkAvailableMutations(
      [
        {
          id: 'today',
          startAt: '2026-10-12T00:00:00.000Z',
          endAt: '2026-10-13T00:00:00.000Z',
          availabilityStatus: 'unavailable',
          reason: 'Sick',
        },
        {
          id: 'future',
          startAt: '2026-10-20T00:00:00.000Z',
          endAt: '2026-10-21T00:00:00.000Z',
          availabilityStatus: 'unavailable',
          reason: 'Training',
        },
        {
          id: 'past',
          startAt: '2026-10-01T00:00:00.000Z',
          endAt: '2026-10-02T00:00:00.000Z',
          availabilityStatus: 'unavailable',
          reason: 'PTO',
        },
      ],
      now
    );

    expect(mutations).toEqual([{ type: 'delete', id: 'today' }]);
  });

  it('ends a multi-day blackout at tomorrow so later days stay blocked', () => {
    const mutations = planMarkAvailableMutations(
      [
        {
          id: 'span',
          startAt: '2026-10-10T00:00:00.000Z',
          endAt: '2026-10-18T00:00:00.000Z',
          availabilityStatus: 'unavailable',
          reason: 'Conference',
        },
      ],
      now
    );

    expect(mutations).toHaveLength(1);
    expect(mutations[0]?.type).toBe('update');
    if (mutations[0]?.type === 'update') {
      expect(new Date(mutations[0].startAt).getTime()).toBeGreaterThan(
        now.getTime()
      );
      expect(mutations[0].endAt).toBe('2026-10-18T00:00:00.000Z');
    }
  });

  it('finds the unavailable record covering now', () => {
    const covering = findCoveringUnavailableRecord(
      [
        {
          id: 'future',
          startAt: '2026-10-20T00:00:00.000Z',
          endAt: '2026-10-21T00:00:00.000Z',
          availabilityStatus: 'unavailable',
          reason: 'Training',
        },
        {
          id: 'now',
          startAt: '2026-10-12T00:00:00.000Z',
          endAt: '2026-10-13T00:00:00.000Z',
          availabilityStatus: 'unavailable',
          reason: 'Today',
        },
      ],
      now
    );
    expect(covering?.id).toBe('now');
  });
});
