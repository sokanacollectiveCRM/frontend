import { Search } from '@/common/components/header/Search'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import { UserContext } from '@/common/contexts/UserContext'
import { useClients } from '@/common/hooks/clients/useClients'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import { useContext, useEffect, useState } from 'react'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { userListSchema, UserSummary } from './data/schema'

export default function Users() {
  const { clients, isLoading, getClients } = useClients();
  const [userList, setUserList] = useState<UserSummary[]>([]);
  const { user } = useContext(UserContext);

  // fetch clients
  useEffect(() => {
    getClients();
  }, []);

  // parse clients and summarize profile for view
  useEffect(() => {
    if (clients.length === 0) return;

    try {
      const parsed = userListSchema.parse(clients);
      setUserList(parsed);
    } catch (err) {
      console.error('Failed to parse client list with Zod:', err);
      setUserList([]);
    }
  }, [clients]);

  if (user?.role !== 'admin') {
    return <div className='p-8 text-center text-red-500'>You do not have permission to view this page.</div>;
  }

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto'>
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='flex-1 space-y-4 p-8 pt-6'>
          <div className='flex items-center justify-between space-y-2'>
            <h2 className='text-3xl font-bold tracking-tight'>Users</h2>
            <div className='flex items-center space-x-2'>
              <UsersPrimaryButtons />
            </div>
          </div>
          <UsersTable columns={columns} data={userList} loading={isLoading} />
        </div>
      </Main>
      <UsersDialogs />
    </UsersProvider>
  )
}
