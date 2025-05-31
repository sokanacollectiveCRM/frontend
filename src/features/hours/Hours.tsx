import { Search } from '@/common/components/header/Search'
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import useWorkLog from "@/common/hooks/hours/useWorkLog"
import { useUser } from "@/common/hooks/user/useUser"
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import UsersProvider from '@/features/hours/context/clients-context'
import { columns } from './components/users-columns'
import { UsersTable } from './components/users-table'
import { useEffect, useState } from 'react'
import { TotalHoursHoverCard } from './components/total-hours-hover-card'

export default function Hours() {
  const { user, isLoading: userLoading } = useUser();
  const { hours, isLoading: hoursLoading } = useWorkLog(user?.id);
  const [totalHours, setTotalHours] = useState<string>("");

  const transformedData = hours?.map(session => {
    return {
      id: session.id,
      // Client fields
      client: {
        firstName: session.client.firstname,
        lastName: session.client.lastname
      },
      // Doula fields
      doula: {
        firstName: session.doula.firstname,
        lastName: session.doula.lastname
      },
      // Time fields
      start_time: new Date(session.start_time).toLocaleString(),
      end_time: new Date(session.end_time).toLocaleString(),
      note: session.note
    }
  }) || [];

  if(!hoursLoading) {
    console.log("hours is", hours)
  }

  useEffect(() => {
    if(hours && hours.length > 0) {
      const durationMs = hours.reduce((acc, session) => {
        const startDate = new Date(session.start_time);
        const endDate = new Date(session.end_time); // Fixed: use end_time
        const durationMs = endDate.getTime() - startDate.getTime();
        return acc + durationMs;
      }, 0);
      const num_hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      setTotalHours(`${num_hours}h ${minutes}m`);
    }
  }, [hours])

  if(!hoursLoading) {
    // console.log("hours is", hours)
  }

  useEffect(() => {
    if(hours && hours.length > 0) {
      const durationMs = hours.reduce((acc, session) => {
        const startDate = new Date(session.start_time);
        const endDate = new Date(session.end_time); // Fixed: use end_time
        const durationMs = endDate.getTime() - startDate.getTime();
        return acc + durationMs;
      }, 0);
      const num_hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      setTotalHours(`${num_hours}h ${minutes}m`);
    }
  }, [hours])

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
        <div className="flex-1 overflow-auto p-4">
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Hours</h2>
              <p className='text-muted-foreground'>
                Manage doula hours.
              </p>
            </div>
          </div>
          <UsersTable data={transformedData} columns={columns} />
          <TotalHoursHoverCard
            text={totalHours} 
          />
          <TotalHoursHoverCard
            text={totalHours} 
          />
        </div>
      </Main>

    </UsersProvider>
  )
}
