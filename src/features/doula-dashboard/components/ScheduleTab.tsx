import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  createDoulaAvailability,
  deleteDoulaAvailability,
  getDoulaAvailability,
  type DoulaAvailabilityRecord,
} from '@/api/doulas/doulaService';
import {
  getDoulaBookings,
  patchBookingStatus,
  type BookingStatus,
  type SchedulingBooking,
} from '@/api/scheduling/schedulingService';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import {
  MAX_REPEAT_WEEKS,
  validateAvailabilityForm,
  validateBlackoutForm,
} from '@/features/scheduling/availabilityForm';
import {
  addLocalDays,
  endOfLocalDayIso,
  formatTimeRangeWithZone,
  getBrowserTimeZone,
  localDateTimeToUtcIso,
  startOfLocalDayIso,
} from '@/features/scheduling/schedulingTime';
import { logFailure } from '@/utils/safeLog';

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Declined',
  cancelled: 'Cancelled',
};

function upcomingRecords(
  records: DoulaAvailabilityRecord[],
  status: 'available' | 'unavailable',
  now: Date
): DoulaAvailabilityRecord[] {
  return records
    .filter(
      (record) =>
        record.availabilityStatus === status &&
        new Date(record.endAt).getTime() > now.getTime()
    )
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
}

export default function ScheduleTab() {
  const timeZone = useMemo(() => getBrowserTimeZone(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState<DoulaAvailabilityRecord[]>([]);
  const [bookings, setBookings] = useState<SchedulingBooking[]>([]);
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [availabilityStart, setAvailabilityStart] = useState('10:00');
  const [availabilityEnd, setAvailabilityEnd] = useState('14:00');
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [blackoutFrom, setBlackoutFrom] = useState('');
  const [blackoutTo, setBlackoutTo] = useState('');
  const [blackoutReason, setBlackoutReason] = useState('');
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [isSavingBlackout, setIsSavingBlackout] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [availability, visitRequests] = await Promise.all([
        getDoulaAvailability(),
        getDoulaBookings(),
      ]);
      setRecords(availability.records);
      setBookings(visitRequests);
    } catch (error) {
      logFailure('scheduling', 'doula_schedule_load_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to load your schedule.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const now = new Date();
  const availableWindows = upcomingRecords(records, 'available', now);
  const blackouts = upcomingRecords(records, 'unavailable', now);
  const sortedBookings = useMemo(() => {
    const rank: Record<BookingStatus, number> = {
      pending: 0,
      approved: 1,
      cancelled: 2,
      rejected: 3,
    };
    return [...bookings].sort((a, b) => {
      const statusDelta = rank[a.status] - rank[b.status];
      if (statusDelta !== 0) return statusDelta;
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });
  }, [bookings]);

  const handleAddAvailability = async (event: React.FormEvent) => {
    event.preventDefault();
    const weeks = Number(repeatWeeks) || 1;
    const validation = validateAvailabilityForm({
      date: availabilityDate,
      startTime: availabilityStart,
      endTime: availabilityEnd,
      repeatWeeks: weeks,
    });
    if (validation) {
      toast.error(validation);
      return;
    }

    setIsSavingAvailability(true);
    try {
      for (let index = 0; index < weeks; index += 1) {
        const date = addLocalDays(availabilityDate, index * 7);
        await createDoulaAvailability({
          startAt: localDateTimeToUtcIso(date, availabilityStart),
          endAt: localDateTimeToUtcIso(date, availabilityEnd),
          availabilityStatus: 'available',
        });
      }
      toast.success(
        weeks > 1
          ? `Added availability for ${weeks} weeks.`
          : 'Availability added.'
      );
      await load();
    } catch (error) {
      logFailure('scheduling', 'doula_availability_create_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to add availability.'
      );
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const handleAddBlackout = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateBlackoutForm({
      fromDate: blackoutFrom,
      toDate: blackoutTo,
      reason: blackoutReason,
    });
    if (validation) {
      toast.error(validation);
      return;
    }

    setIsSavingBlackout(true);
    try {
      await createDoulaAvailability({
        startAt: startOfLocalDayIso(blackoutFrom),
        endAt: endOfLocalDayIso(blackoutTo),
        availabilityStatus: 'unavailable',
        reason: blackoutReason.trim() || null,
      });
      toast.success('Blackout added.');
      setBlackoutReason('');
      await load();
    } catch (error) {
      logFailure('scheduling', 'doula_blackout_create_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to add blackout.'
      );
    } finally {
      setIsSavingBlackout(false);
    }
  };

  const handleDeleteRecord = async (record: DoulaAvailabilityRecord) => {
    try {
      await deleteDoulaAvailability(record.id);
      toast.success(
        record.availabilityStatus === 'unavailable'
          ? 'Blackout removed.'
          : 'Availability removed.'
      );
      await load();
    } catch (error) {
      logFailure('scheduling', 'doula_availability_delete_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete that window.'
      );
    }
  };

  const handleBookingStatus = async (
    booking: SchedulingBooking,
    status: BookingStatus
  ) => {
    setPendingActionId(booking.id);
    try {
      await patchBookingStatus(booking.id, status);
      toast.success(`Visit ${STATUS_LABEL[status].toLowerCase()}.`);
      await load();
    } catch (error) {
      logFailure('scheduling', 'doula_booking_status_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to update that visit.'
      );
    } finally {
      setPendingActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 py-12 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Loading schedule...
      </div>
    );
  }

  return (
    <div className='space-y-6' data-testid='doula-schedule-page'>
      <div>
        <h2 className='text-2xl font-semibold text-slate-900'>Schedule</h2>
        <p className='mt-1 text-sm text-slate-600'>
          Post open windows, add blackout dates, and review visit requests.
          Times are shown in {timeZone}.
        </p>
      </div>

      <div className='grid gap-6 xl:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CalendarClock className='h-5 w-5' />
              Add availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='space-y-4'
              onSubmit={handleAddAvailability}
              data-testid='schedule-availability-form'
            >
              <div className='space-y-2'>
                <Label htmlFor='availability-date'>Date</Label>
                <Input
                  id='availability-date'
                  type='date'
                  value={availabilityDate}
                  onChange={(event) => setAvailabilityDate(event.target.value)}
                  required
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-2'>
                  <Label htmlFor='availability-start'>Start time</Label>
                  <Input
                    id='availability-start'
                    type='time'
                    value={availabilityStart}
                    onChange={(event) =>
                      setAvailabilityStart(event.target.value)
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='availability-end'>End time</Label>
                  <Input
                    id='availability-end'
                    type='time'
                    value={availabilityEnd}
                    onChange={(event) => setAvailabilityEnd(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='availability-repeat'>
                  Repeat weekly for N weeks
                </Label>
                <Input
                  id='availability-repeat'
                  type='number'
                  min={1}
                  max={MAX_REPEAT_WEEKS}
                  value={repeatWeeks}
                  onChange={(event) =>
                    setRepeatWeeks(Number(event.target.value) || 1)
                  }
                />
              </div>
              <Button type='submit' disabled={isSavingAvailability}>
                {isSavingAvailability ? 'Saving...' : 'Add availability'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Add blackout</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='space-y-4'
              onSubmit={handleAddBlackout}
              data-testid='schedule-blackout-form'
            >
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-2'>
                  <Label htmlFor='blackout-from'>From date</Label>
                  <Input
                    id='blackout-from'
                    type='date'
                    value={blackoutFrom}
                    onChange={(event) => setBlackoutFrom(event.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='blackout-to'>To date</Label>
                  <Input
                    id='blackout-to'
                    type='date'
                    value={blackoutTo}
                    onChange={(event) => setBlackoutTo(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='blackout-reason'>Reason</Label>
                <Input
                  id='blackout-reason'
                  value={blackoutReason}
                  onChange={(event) => setBlackoutReason(event.target.value)}
                  placeholder='Training'
                />
              </div>
              <Button
                type='submit'
                variant='secondary'
                disabled={isSavingBlackout}
              >
                {isSavingBlackout ? 'Saving...' : 'Add blackout'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 xl:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Upcoming availability</CardTitle>
          </CardHeader>
          <CardContent>
            {availableWindows.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No upcoming open windows. Add a date and time above.
              </p>
            ) : (
              <ul className='space-y-3'>
                {availableWindows.map((record) => (
                  <li
                    key={record.id}
                    className='flex items-start justify-between gap-3 rounded-lg border p-3'
                  >
                    <p className='text-sm'>
                      {formatTimeRangeWithZone(
                        record.startAt,
                        record.endAt,
                        timeZone
                      )}
                    </p>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      aria-label={`Delete availability ${record.id}`}
                      onClick={() => void handleDeleteRecord(record)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Upcoming blackouts</CardTitle>
          </CardHeader>
          <CardContent>
            {blackouts.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No upcoming blackouts.
              </p>
            ) : (
              <ul className='space-y-3'>
                {blackouts.map((record) => (
                  <li
                    key={record.id}
                    className='flex items-start justify-between gap-3 rounded-lg border p-3'
                  >
                    <div>
                      <p className='text-sm'>
                        {formatTimeRangeWithZone(
                          record.startAt,
                          record.endAt,
                          timeZone
                        )}
                      </p>
                      {record.reason ? (
                        <p className='mt-1 text-xs text-muted-foreground'>
                          {record.reason}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      aria-label={`Delete blackout ${record.id}`}
                      onClick={() => void handleDeleteRecord(record)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Visit requests</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedBookings.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No visit requests yet.
            </p>
          ) : (
            <ul className='space-y-3' data-testid='visit-requests'>
              {sortedBookings.map((booking) => (
                <li
                  key={booking.id}
                  className='space-y-3 rounded-lg border p-3'
                >
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div>
                      <p className='text-sm font-medium'>
                        {formatTimeRangeWithZone(
                          booking.startAt,
                          booking.endAt,
                          timeZone
                        )}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {booking.clientFirstName ||
                          booking.clientNumber ||
                          'Assigned client'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.status === 'approved'
                          ? 'default'
                          : booking.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {STATUS_LABEL[booking.status]}
                    </Badge>
                  </div>
                  {booking.status === 'pending' ||
                  booking.status === 'approved' ? (
                    <div className='flex flex-wrap gap-2'>
                      {booking.status === 'pending' ? (
                        <>
                          <Button
                            type='button'
                            size='sm'
                            disabled={pendingActionId === booking.id}
                            onClick={() =>
                              void handleBookingStatus(booking, 'approved')
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            type='button'
                            size='sm'
                            variant='secondary'
                            disabled={pendingActionId === booking.id}
                            onClick={() =>
                              void handleBookingStatus(booking, 'rejected')
                            }
                          >
                            Decline
                          </Button>
                        </>
                      ) : null}
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        disabled={pendingActionId === booking.id}
                        onClick={() =>
                          void handleBookingStatus(booking, 'cancelled')
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
