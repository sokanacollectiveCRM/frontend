import { Search } from '@/common/components/header/Search'
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import { useClients } from '@/common/hooks/clients/useClients'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import updateClientStatus from '@/common/utils/updateClientStatus'
import { UsersBoard } from '@/features/pipeline/components/UsersBoard'
import UsersProvider from '@/features/pipeline/context/users-context'
import { useEffect, useMemo, useState } from 'react'
import { USER_STATUSES, userListSchema, UserStatus, UserSummary } from './data/schema'

export default function Pipeline() {

  const { clients, isLoading, getClients } = useClients();
  const [userList, setUserList] = useState<UserSummary[]>([]);

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

        <LoadingOverlay isLoading={isLoading}/>

        <Main>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Pipeline</h2>
              <p className='text-muted-foreground'>
                Drag and drop to manage your users here.
              </p>
            </div>
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>

          <UsersBoard
            usersByStatus={groupedUsers}
            onStatusChange={ async (userId: string, newStatus: UserStatus) => {
              setUserList((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
              );

              try {
                const client = await updateClientStatus(userId, newStatus);
                console.log('Client status updated successfully: ', client);
              } catch (error) {
                console.error('Failed to update user status:', error);
                
                setUserList((prev) =>
                  prev.map((u) => (u.id === userId ? { ...u, status: u.status } : u))
                );
              }
            }}
          />
          </div>
        </Main>

      </UsersProvider>
  )
}
