import { Search } from '@/common/components/header/Search';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import useWorkLog from '@/common/hooks/hours/useWorkLog';
import { useUser } from '@/common/hooks/user/useUser';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import UsersProvider from '@/features/hours/context/clients-context';
import { Card, CardContent } from '@/common/components/ui/card';
import { formatDurationHours } from '@/features/hours/data/hour-types';
import { columns } from './components/users-columns';
import { UsersTable } from './components/users-table';
import { useMemo } from 'react';
import { TotalHoursHoverCard } from './components/total-hours-hover-card';

export default function Hours() {
  const { user, isLoading: userLoading } = useUser();
  const { hours, isLoading: hoursLoading } = useWorkLog(user?.id);

  const transformedData =
    hours?.map((session) => ({
      id: session.id,
      client: {
        firstName: session.client.firstname,
        lastName: session.client.lastname,
      },
      doula: {
        firstName: session.doula.firstname,
        lastName: session.doula.lastname,
      },
      start_time: new Date(session.start_time).toLocaleString(),
      end_time: new Date(session.end_time).toLocaleString(),
      type: session.type,
      note: session.note,
    })) || [];

  const totals = useMemo(() => {
    const summary = {
      total: 0,
      prenatal: 0,
      postpartum: 0,
      unknown: 0,
    };

    for (const session of hours ?? []) {
      const startDate = new Date(session.start_time);
      const endDate = new Date(session.end_time);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        continue;
      }
      const durationHours = Math.max(
        0,
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      );
      summary.total += durationHours;
      if (session.type === 'prenatal' || session.type === 'postpartum') {
        summary[session.type] += durationHours;
      } else {
        summary.unknown += durationHours;
      }
    }

    return summary;
  }, [hours]);

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <LoadingOverlay isLoading={userLoading || hoursLoading} />

      <Main>
        <div className='flex-1 overflow-auto p-4'>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Hours</h2>
              <p className='text-muted-foreground'>Manage doula hours.</p>
            </div>
          </div>
          <div className='mb-4 grid gap-3 md:grid-cols-3'>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground'>Total hours</p>
                <p className='text-2xl font-semibold'>{formatDurationHours(totals.total)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground'>Prenatal hours</p>
                <p className='text-2xl font-semibold'>{formatDurationHours(totals.prenatal)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground'>Postpartum hours</p>
                <p className='text-2xl font-semibold'>{formatDurationHours(totals.postpartum)}</p>
              </CardContent>
            </Card>
          </div>
          <UsersTable data={transformedData} columns={columns} />
          <TotalHoursHoverCard
            totalHours={totals.total}
            prenatalHours={totals.prenatal}
            postpartumHours={totals.postpartum}
          />
        </div>
      </Main>
    </UsersProvider>
  );
}
