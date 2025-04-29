import { Search } from '@/common/components/header/Search'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import { useUser } from '@/common/hooks/useUser'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import { User } from '@/common/types/auth'
import { useEffect, useState } from 'react'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { userListSchema, UserSummary } from './data/schema'

export default function Users() {
  
  const { data: { getClients } } = useUser();
  const [clients, setClients] = useState<User[] | null>(null);
  const [userList, setUserList] = useState<UserSummary[]>([]);
  
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const result = await getClients();
        console.log('clients fetched from backend', result);
        setClients(result);
  
        const parsed = userListSchema.parse(result);
        setUserList(parsed);
      } catch (err) {
        console.error('Failed to parse client list with Zod:', err);
        setUserList([]); // fallback to empty list
      }
    };
  
    fetchClients();
  }, []);

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Clients</h2>
            <p className='text-muted-foreground'>
              Manage your clients and their status here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
