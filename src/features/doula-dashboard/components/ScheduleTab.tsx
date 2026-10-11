import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  createDoulaAvailability,
  deleteDoulaAvailability,
  getDoulaAvailability,
  updateDoulaAvailability,
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
import {
  TimeOffPanel,
  timeOffFormFromRecord,
} from '@/features/scheduling/TimeOffPanel';
import { WeeklyHoursEditor } from '@/features/scheduling/WeeklyHoursEditor';
import {
  formatTimeRangeWithZone,
  getBrowserTimeZone,
  localDateTimeToUtcIso,
} from '@/features/scheduling/schedulingTime';
import {
  emptyTimeOffForm,
  formatTimeOffReason,
  timeOffToWindow,
  upcomingTimeOff,
  upcomingUsHolidays,
  validateTimeOffForm,
  type TimeOffFormValues,
  type UsHoliday,
} from '@/features/scheduling/timeOff';
import {
  expandWeeklyHours,
  futureAvailableRecords,
  inferWeeklyHours,
  validateWeeklyHours,
  type WeekdayHours,
} from '@/features/scheduling/weeklyHours';
import { logFailure } from '@/utils/safeLog';

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Declined',
  cancelled: 'Cancelled',
};

export default function ScheduleTab() {
  const timeZone = useMemo(() => getBrowserTimeZone(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState<DoulaAvailabilityRecord[]>([]);
  const [bookings, setBookings] = useState<SchedulingBooking[]>([]);
  const [hours, setHours] = useState<WeekdayHours[]>(inferWeeklyHours([]));
  const [timeOffForm, setTimeOffForm] =
    useState<TimeOffFormValues>(emptyTimeOffForm());
  const [editingTimeOffId, setEditingTimeOffId] = useState<string | null>(null);
  const [selectedHolidays, setSelectedHolidays] = useState<UsHoliday[]>([]);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isSavingTimeOff, setIsSavingTimeOff] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const holidays = useMemo(() => upcomingUsHolidays(), []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [availability, visitRequests] = await Promise.all([
        getDoulaAvailability(),
        getDoulaBookings(),
      ]);
      setRecords(availability.records);
      setHours(inferWeeklyHours(availability.records));
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

  const timeOffItems = useMemo(() => upcomingTimeOff(records), [records]);
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

  const handleSaveWeeklyHours = async () => {
    const validation = validateWeeklyHours(hours);
    if (validation) {
      toast.error(validation);
      return;
    }
    setIsSavingHours(true);
    try {
      const now = new Date();
      const windows = expandWeeklyHours(hours, now);
      const toReplace = futureAvailableRecords(records, now);
      for (const record of toReplace) {
        await deleteDoulaAvailability(record.id);
      }
      for (const window of windows) {
        await createDoulaAvailability({
          startAt: localDateTimeToUtcIso(window.date, window.startTime),
          endAt: localDateTimeToUtcIso(window.date, window.endTime),
          availabilityStatus: 'available',
        });
      }
      toast.success('Weekly hours saved for the next 8 weeks.');
      await load();
    } catch (error) {
      logFailure('scheduling', 'doula_weekly_hours_save_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to save weekly hours.'
      );
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleSaveTimeOff = async () => {
    const validation = validateTimeOffForm(timeOffForm);
    if (validation) {
      toast.error(validation);
      return;
    }
    setIsSavingTimeOff(true);
    try {
      const window = timeOffToWindow(timeOffForm);
      if (editingTimeOffId) {
        await updateDoulaAvailability(editingTimeOffId, {
          startAt: window.startAt,
          endAt: window.endAt,
          availabilityStatus: 'unavailable',
          reason: window.reason,
        });
        toast.success('Time off updated.');
      } else {
        await createDoulaAvailability({
          startAt: window.startAt,
          endAt: window.endAt,
          availabilityStatus: 'unavailable',
          reason: window.reason,
        });
        toast.success('Time off added.');
      }
      setTimeOffForm(emptyTimeOffForm());
      setEditingTimeOffId(null);
      await load();
    } catch (error) {
      logFailure('scheduling', 'doula_time_off_save_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to save time off.'
      );
    } finally {
      setIsSavingTimeOff(false);
    }
  };

  const handleAddHolidays = async () => {
    if (selectedHolidays.length === 0) return;
    setIsSavingTimeOff(true);
    try {
      const existingReasons = new Set(
        records
          .filter((record) => record.availabilityStatus === 'unavailable')
          .map((record) => record.reason)
      );
      for (const holiday of selectedHolidays) {
        const reason = formatTimeOffReason('Holiday', holiday.name);
        if (existingReasons.has(reason)) continue;
        const window = timeOffToWindow({
          ...emptyTimeOffForm(),
          type: 'Holiday',
          coverage: 'single_day',
          fromDate: holiday.date,
          toDate: holiday.date,
          reason: holiday.name,
        });
        await createDoulaAvailability({
          startAt: window.startAt,
          endAt: window.endAt,
          availabilityStatus: 'unavailable',
          reason,
        });
      }
      toast.success('Selected holidays added.');
      setSelectedHolidays([]);
      await load();
    } catch (error) {
      logFailure('scheduling', 'doula_holiday_add_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to add holidays.'
      );
    } finally {
      setIsSavingTimeOff(false);
    }
  };

  const handleDeleteTimeOff = async (record: DoulaAvailabilityRecord) => {
    try {
      await deleteDoulaAvailability(record.id);
      toast.success('Time off removed.');
      await load();
    } catch (error) {
      logFailure('scheduling', 'doula_time_off_delete_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete time off.'
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
          Set weekly hours, add time off, and review visit requests. Times are
          shown in {timeZone}.
        </p>
      </div>

      <div className='grid gap-6 xl:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CalendarClock className='h-5 w-5' />
              Weekly hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyHoursEditor
              hours={hours}
              onChange={setHours}
              onSave={() => void handleSaveWeeklyHours()}
              isSaving={isSavingHours}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Time off</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeOffPanel
              form={timeOffForm}
              onChange={setTimeOffForm}
              onSave={() => void handleSaveTimeOff()}
              isSaving={isSavingTimeOff}
              editingId={editingTimeOffId}
              onCancelEdit={() => {
                setEditingTimeOffId(null);
                setTimeOffForm(emptyTimeOffForm());
              }}
              items={timeOffItems}
              holidays={holidays}
              selectedHolidayDates={selectedHolidays.map(
                (holiday) => holiday.date
              )}
              onToggleHoliday={(holiday, selected) =>
                setSelectedHolidays((current) =>
                  selected
                    ? [
                        ...current.filter((row) => row.date !== holiday.date),
                        holiday,
                      ]
                    : current.filter((row) => row.date !== holiday.date)
                )
              }
              onAddHolidays={() => void handleAddHolidays()}
              onEdit={(item) => {
                setEditingTimeOffId(item.id);
                setTimeOffForm(timeOffFormFromRecord(item));
              }}
              onDelete={(item) => void handleDeleteTimeOff(item)}
              timeZone={timeZone}
            />
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
