import { describe, expect, it } from 'vitest';

import {
  conflictMessage,
  isContractStageError,
  isSchedulingConflictError,
  mapSchedulingBooking,
  SchedulingApiError,
  unwrapSchedulingList,
} from '@/api/scheduling/schedulingService';

describe('scheduling service normalization', () => {
  it('unwraps mixed list wrappers', () => {
    expect(
      unwrapSchedulingList({ success: true, data: [{ id: '1' }] })
    ).toEqual([{ id: '1' }]);
    expect(unwrapSchedulingList({ slots: [{ startAt: 'a' }] })).toEqual([
      { startAt: 'a' },
    ]);
    expect(unwrapSchedulingList({ bookings: [{ id: 'b' }] })).toEqual([
      { id: 'b' },
    ]);
    expect(unwrapSchedulingList([{ id: 'raw' }])).toEqual([{ id: 'raw' }]);
  });

  it('maps snake_case booking fields and admin join aliases', () => {
    const booking = mapSchedulingBooking({
      id: 'bk-1',
      client_id: 'client-1',
      doula_id: 'doula-1',
      requested_by: 'client-1',
      start_at: '2026-10-15T15:00:00.000Z',
      end_at: '2026-10-15T16:00:00.000Z',
      status: 'pending',
      notes: 'Prenatal visit',
      created_at: '2026-10-11T12:00:00.000Z',
      updated_at: '2026-10-11T12:00:00.000Z',
      doula_name: 'Maya Rivers',
      client_number: 'C-1042',
      client_first_name: 'Jordan',
    });

    expect(booking.doulaId).toBe('doula-1');
    expect(booking.clientId).toBe('client-1');
    expect(booking.startAt).toBe('2026-10-15T15:00:00.000Z');
    expect(booking.doulaName).toBe('Maya Rivers');
    expect(booking.clientNumber).toBe('C-1042');
    expect(booking.clientFirstName).toBe('Jordan');
  });

  it('treats contract-stage API errors as an empty-state signal', () => {
    const error = new SchedulingApiError(
      'Client is not in contract stage',
      403,
      'CONTRACT_STAGE_REQUIRED'
    );
    expect(isContractStageError(error)).toBe(true);
    expect(isSchedulingConflictError(error)).toBe(false);
  });

  it('maps 409 conflicts to a friendly retry message', () => {
    const error = new SchedulingApiError('Overlap', 409, 'OVERLAP');
    expect(isSchedulingConflictError(error)).toBe(true);
    expect(conflictMessage(error)).toMatch(/no longer available/i);
  });
});
