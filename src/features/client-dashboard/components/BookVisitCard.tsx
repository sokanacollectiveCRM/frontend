import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  SCHEDULING_VISIT_MINUTES,
  conflictMessage,
  createClientBooking,
  getClientBookings,
  getClientSlots,
  isContractStageError,
  isSchedulingConflictError,
  patchBookingStatus,
  type SchedulingBooking,
  type SchedulingSlot,
} from '@/api/scheduling/schedulingService';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import {
  formatTimeRangeWithZone,
  formatTimeWithZone,
  getBrowserTimeZone,
  groupSlotsByDay,
  nextFourteenDayRange,
} from '@/features/scheduling/schedulingTime';
import { logFailure } from '@/utils/safeLog';

interface BookVisitCardProps {
  doulaId: string;
  doulaName: string;
}

const STATUS_LABEL: Record<SchedulingBooking['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Declined',
  cancelled: 'Cancelled',
};

export default function BookVisitCard({
  doulaId,
  doulaName,
}: BookVisitCardProps) {
  const timeZone = useMemo(() => getBrowserTimeZone(), []);
  const [slots, setSlots] = useState<SchedulingSlot[]>([]);
  const [visits, setVisits] = useState<SchedulingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [contractBlocked, setContractBlocked] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SchedulingSlot | null>(null);
  const [note, setNote] = useState('');
  const [conflict, setConflict] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setContractBlocked(false);
    try {
      const range = nextFourteenDayRange();
      const [openSlots, bookings] = await Promise.all([
        getClientSlots(doulaId, {
          from: range.from,
          to: range.to,
          durationMinutes: SCHEDULING_VISIT_MINUTES,
        }),
        getClientBookings(),
      ]);
      setSlots(openSlots);
      setVisits(bookings.filter((booking) => booking.doulaId === doulaId));
    } catch (error) {
      if (isContractStageError(error)) {
        setContractBlocked(true);
        setSlots([]);
        setVisits([]);
        return;
      }
      logFailure('scheduling', 'client_book_visit_load_failed');
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to load visit times right now.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [doulaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(
    () => groupSlotsByDay(slots, timeZone),
    [slots, timeZone]
  );
  const myVisits = useMemo(
    () =>
      [...visits].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      ),
    [visits]
  );

  const handleRequest = async () => {
    if (!selectedSlot) {
      toast.error('Select a 60-minute time first.');
      return;
    }
    setIsBooking(true);
    setConflict(null);
    try {
      const created = await createClientBooking({
        doulaId,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        notes: note.trim() || undefined,
      });
      setVisits((current) => {
        if (current.some((visit) => visit.id === created.id)) return current;
        return [created, ...current];
      });
      toast.success('Visit requested. Your doula will review it shortly.');
      await load();
    } catch (error) {
      if (isContractStageError(error)) {
        setContractBlocked(true);
        return;
      }
      if (isSchedulingConflictError(error)) {
        setConflict(conflictMessage(error));
        return;
      }
      logFailure('scheduling', 'client_book_visit_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to request that visit.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancel = async (booking: SchedulingBooking) => {
    setCancellingId(booking.id);
    try {
      await patchBookingStatus(booking.id, 'cancelled');
      toast.success('Visit cancelled.');
      await load();
    } catch (error) {
      logFailure('scheduling', 'client_cancel_visit_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to cancel that visit.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div
      className='mt-4 space-y-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4'
      data-testid='book-visit-card'
    >
      <div>
        <h3 className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
          <CalendarDays className='h-4 w-4' />
          Book a visit with {doulaName}
        </h3>
        <p className='mt-1 text-xs text-muted-foreground'>
          Visits are 60 minutes. Times are shown in {timeZone}.
        </p>
      </div>

      {isLoading ? (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin' />
          Loading open times...
        </div>
      ) : contractBlocked ? (
        <p className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950'>
          Visit booking becomes available once you reach the contract stage.
          Contact your care team if you have questions.
        </p>
      ) : grouped.length === 0 ? (
        <p className='rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700'>
          {doulaName} has not posted open times for the next two weeks. Check
          back soon or use the scheduling link if one is available.
        </p>
      ) : (
        <div className='space-y-3'>
          {grouped.map((day) => (
            <div key={day.dateKey}>
              <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {day.label}
              </p>
              <div className='flex flex-wrap gap-2'>
                {day.slots.map((slot) => {
                  const key = `${slot.startAt}|${slot.endAt}`;
                  const selected =
                    selectedSlot?.startAt === slot.startAt &&
                    selectedSlot?.endAt === slot.endAt;
                  return (
                    <Button
                      key={key}
                      type='button'
                      size='sm'
                      variant={selected ? 'default' : 'outline'}
                      data-testid='open-slot'
                      data-slot-start={slot.startAt}
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setConflict(null);
                      }}
                    >
                      {formatTimeWithZone(slot.startAt, timeZone)}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!contractBlocked ? (
        <div className='space-y-3'>
          <div className='space-y-2'>
            <Label htmlFor={`visit-note-${doulaId}`}>Note (optional)</Label>
            <Textarea
              id={`visit-note-${doulaId}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder='Anything your doula should know about this visit'
              rows={3}
            />
          </div>
          {conflict ? (
            <p
              className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900'
              data-testid='booking-conflict'
            >
              {conflict}
            </p>
          ) : null}
          <Button
            type='button'
            data-testid='request-visit'
            disabled={isBooking || !selectedSlot}
            onClick={() => void handleRequest()}
          >
            {isBooking ? 'Requesting...' : 'Request visit'}
          </Button>
        </div>
      ) : null}

      <div data-testid='my-visits'>
        <h4 className='text-sm font-semibold text-slate-900'>My visits</h4>
        {myVisits.length === 0 ? (
          <p className='mt-2 text-sm text-muted-foreground'>
            You have no visits with this doula yet.
          </p>
        ) : (
          <ul className='mt-2 space-y-2'>
            {myVisits.map((visit) => (
              <li
                key={visit.id}
                className='flex flex-wrap items-center justify-between gap-2 rounded-md border bg-white px-3 py-2'
              >
                <div>
                  <p className='text-sm'>
                    {formatTimeRangeWithZone(
                      visit.startAt,
                      visit.endAt,
                      timeZone
                    )}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant={
                      visit.status === 'approved'
                        ? 'default'
                        : visit.status === 'pending'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {STATUS_LABEL[visit.status]}
                  </Badge>
                  {visit.status === 'pending' || visit.status === 'approved' ? (
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      disabled={cancellingId === visit.id}
                      onClick={() => void handleCancel(visit)}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
