import { ProfileDropdown } from '@/common/components/profile-dropdown'
import { Search } from '@/common/components/Search'
import { useUser } from '@/common/hooks/useUser'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import { User } from '@/common/types/auth'
import { UsersBoard } from '@/features/pipeline/components/UsersBoard'
import UsersProvider from '@/features/pipeline/context/users-context'
import { useEffect, useMemo, useState } from 'react'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { USER_STATUSES, userListSchema, UserStatus, UserSummary } from './data/schema'

export default function Pipeline() {
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

  const groupedUsers: Record<UserStatus, UserSummary[]> = useMemo(() => {
    const groups: Record<UserStatus, UserSummary[]> = {
      'lead': [],
      'contacted': [],
      'matching': [],
      'interviewing': [],
      'follow up': [],
      'contract': [],
      'active': [],
      'complete': [],
    };
    for (const user of userList) {
      if (USER_STATUSES.includes(user.status as UserStatus)) {
        groups[user.status as UserStatus].push(user);
      }
    }
    return groups;
  }, [userList]);

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
              <h2 className='text-2xl font-bold tracking-tight'>Pipeline</h2>
              <p className='text-muted-foreground'>
                Drag and drop to manage your users here.
              </p>
            </div>
            <UsersPrimaryButtons />
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>

          <UsersBoard
            usersByStatus={groupedUsers}
            onStatusChange={(userId: string, newStatus: UserStatus) => {
              setUserList((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
              );
              // Add backend call here to change status of user once we're done with logic
            }}
          />

          </div>
        </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
