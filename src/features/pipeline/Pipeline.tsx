import { Search } from '@/common/components/header/Search'
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay'
import { useClients } from '@/common/hooks/clients/useClients'
import { useUser } from '@/common/hooks/user/useUser'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import updateClientStatus from '@/common/utils/updateClientStatus'
import { UsersBoard } from '@/features/pipeline/components/UsersBoard'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Client, clientListSchema, USER_STATUSES, UserStatus } from './data/schema'

export default function Pipeline() {

  const { isLoading: userLoading } = useUser();
  const { clients, isLoading, getClients } = useClients();
  const [userList, setUserList] = useState<Client[]>([]);

  // fetch clients
  useEffect(() => {
    getClients();
  }, []);

  // parse clients and summarize profile for view
  useEffect(() => {
    if (clients.length === 0) return;

    try {
      const parsed = clientListSchema.parse(clients);
      console.log(parsed);
      setUserList(parsed);
    } catch (err) {
      console.error('Failed to parse client list with Zod:', err);
      setUserList([]);
    }
  }, [clients]);

  const groupedUsers: Record<UserStatus, Client[]> = useMemo(() => {
    const groups: Record<UserStatus, Client[]> = {
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
    <div>
      <Header fixed>
        <Search />
      </Header>

      <LoadingOverlay isLoading={isLoading || userLoading} />

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
            onStatusChange={async (userId: string, newStatus: UserStatus) => {
              setUserList((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
              );

              try {
                const client = await updateClientStatus(userId, newStatus);
                toast.success(`Client status updated to ${newStatus}`);
              } catch (error) {
                console.error('Failed to update user status:', error);
                toast.error(`Something went wrong. ${error instanceof Error ? error.message : error}`);
                setUserList((prev) =>
                  prev.map((u) => (u.id === userId ? { ...u, status: u.status } : u))
                );
              }
            }}
          />
        </div>
      </Main>
    </div>
  )
}
