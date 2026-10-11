import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  fetchAvailableDoulas,
  type Doula,
} from '@/api/clients/doulaAssignments';
import {
  getAdminBookings,
  getAdminDoulaAvailability,
  type AdminAvailabilityRecord,
  type BookingStatus,
  type SchedulingBooking,
} from '@/api/scheduling/schedulingService';
import { isAdminRole } from '@/common/auth/roles';
import { AccessDenied } from '@/common/components/routes/AccessDenied';
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
import { useUser } from '@/common/hooks/user/useUser';
import {
  formatTimeRangeWithZone,
  getBrowserTimeZone,
} from '@/features/scheduling/schedulingTime';
import { logFailure } from '@/utils/safeLog';

const STATUS_OPTIONS: Array<{ value: '' | BookingStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Declined' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Declined',
  cancelled: 'Cancelled',
};

export default function AdminVisitsPage() {
  const { user, isLoading: userLoading } = useUser();
  const timeZone = useMemo(() => getBrowserTimeZone(), []);
  const [doulas, setDoulas] = useState<Doula[]>([]);
  const [bookings, setBookings] = useState<SchedulingBooking[]>([]);
  const [availability, setAvailability] = useState<AdminAvailabilityRecord[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [doulaId, setDoulaId] = useState('');
  const [clientQuery, setClientQuery] = useState('');
  const [status, setStatus] = useState<'' | BookingStatus>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [team, rows] = await Promise.all([
        fetchAvailableDoulas().catch(() => [] as Doula[]),
        getAdminBookings({
          doulaId: doulaId || undefined,
          status: status || undefined,
          from: fromDate
            ? new Date(`${fromDate}T00:00:00`).toISOString()
            : undefined,
          to: toDate ? new Date(`${toDate}T23:59:59`).toISOString() : undefined,
        }),
      ]);
      setDoulas(team);
      setBookings(rows);
      if (doulaId) {
        const records = await getAdminDoulaAvailability(doulaId);
        setAvailability(records);
      } else {
        setAvailability([]);
      }
    } catch (error) {
      logFailure('scheduling', 'admin_visits_load_failed');
      toast.error(
        error instanceof Error ? error.message : 'Unable to load visits.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [doulaId, fromDate, status, toDate]);

  useEffect(() => {
    if (!isAdminRole(user?.role)) return;
    void load();
  }, [load, user?.role]);

  const filteredBookings = useMemo(() => {
    const needle = clientQuery.trim().toLowerCase();
    if (!needle) return bookings;
    return bookings.filter((booking) => {
      const haystack = [
        booking.clientFirstName,
        booking.clientNumber,
        booking.clientId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [bookings, clientQuery]);

  if (userLoading) {
    return (
      <div className='flex items-center gap-2 p-6 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Loading session...
      </div>
    );
  }

  if (!isAdminRole(user?.role)) {
    return (
      <AccessDenied description='Visit review is limited to Sokana admins.' />
    );
  }

  return (
    <div
      className='flex min-h-0 flex-col overflow-auto p-4'
      data-testid='admin-visits-page'
    >
      <div className='mb-4 shrink-0'>
        <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
          <CalendarDays className='h-6 w-6' />
          Visits
        </h1>
        <p className='mt-1 text-muted-foreground'>
          All booking requests across doulas. Times are shown in {timeZone}.
        </p>
      </div>

      <Card className='mb-4'>
        <CardContent className='grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-5'>
          <div className='space-y-2'>
            <Label htmlFor='visits-doula'>Doula</Label>
            <select
              id='visits-doula'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              value={doulaId}
              onChange={(event) => setDoulaId(event.target.value)}
            >
              <option value=''>All doulas</option>
              {doulas.map((doula) => (
                <option key={doula.id} value={doula.id}>
                  {`${doula.firstname || ''} ${doula.lastname || ''}`.trim() ||
                    doula.email}
                </option>
              ))}
            </select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='visits-client'>Client</Label>
            <Input
              id='visits-client'
              value={clientQuery}
              onChange={(event) => setClientQuery(event.target.value)}
              placeholder='Name or client number'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='visits-status'>Status</Label>
            <select
              id='visits-status'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as '' | BookingStatus)
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='visits-from'>From</Label>
            <Input
              id='visits-from'
              type='date'
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='visits-to'>To</Label>
            <Input
              id='visits-to'
              type='date'
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Booking requests</CardTitle>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => void load()}
            >
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Loading visits...
              </div>
            ) : filteredBookings.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No booking requests match these filters.
              </p>
            ) : (
              <div className='overflow-x-auto'>
                <table
                  className='w-full min-w-[640px] text-left text-sm'
                  data-testid='visits-table'
                >
                  <thead>
                    <tr className='border-b text-xs uppercase tracking-wide text-muted-foreground'>
                      <th className='py-2 pr-3 font-medium'>When</th>
                      <th className='py-2 pr-3 font-medium'>Doula</th>
                      <th className='py-2 pr-3 font-medium'>Client</th>
                      <th className='py-2 font-medium'>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className='border-b last:border-0'>
                        <td className='py-3 pr-3'>
                          {formatTimeRangeWithZone(
                            booking.startAt,
                            booking.endAt,
                            timeZone
                          )}
                        </td>
                        <td className='py-3 pr-3'>
                          {booking.doulaName || 'Doula'}
                        </td>
                        <td className='py-3 pr-3'>
                          {booking.clientFirstName || 'Client'}
                          {booking.clientNumber
                            ? ` · ${booking.clientNumber}`
                            : ''}
                        </td>
                        <td className='py-3'>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doula availability</CardTitle>
          </CardHeader>
          <CardContent>
            {!doulaId ? (
              <p className='text-sm text-muted-foreground'>
                Select a doula to view posted availability and blackouts.
              </p>
            ) : availability.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No availability records for this doula.
              </p>
            ) : (
              <ul className='space-y-2'>
                {availability.map((record) => (
                  <li
                    key={record.id}
                    className='rounded-md border px-3 py-2 text-sm'
                  >
                    <p>
                      {formatTimeRangeWithZone(
                        record.startAt,
                        record.endAt,
                        timeZone
                      )}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {record.availabilityStatus === 'unavailable'
                        ? `Blackout${record.reason ? ` · ${record.reason}` : ''}`
                        : 'Available'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
