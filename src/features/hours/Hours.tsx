import { Search } from '@/common/components/header/Search'
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import useWorkLog from "@/common/hooks/hours/useWorkLog"
import { useUser } from "@/common/hooks/user/useUser"
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import UsersProvider from '@/features/hours/context/clients-context'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersTable } from './components/users-table'

export default function Hours() {
  const { user, isLoading: userLoading } = useUser();
  const { hours, isLoading: hoursLoading } = useWorkLog(user?.id);

  const transformedData = hours?.map(session => ({
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
    // Add any other fields your table might need
  })) || [];


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

        </div>
        {/* <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Your Hours</h2>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <UsersTable data={transformedData} columns={columns} />
        </div> */}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
