import { Search } from '@/common/components/header/Search';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { useClients } from '@/common/hooks/clients/useClients';
import { useUser } from '@/common/hooks/user/useUser';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { ContractsDialogs } from '@/features/contracts/components/ContractsDialogs';
import UsersProvider from '@/features/contracts/context/users-context';
import { userListSchema, UserSummary } from '@/features/contracts/data/schema';
import { useEffect, useState } from 'react';
import { ContractsBoard } from './components/ContractsBoard';

export default function Contracts() {
  const { isLoading: userLoading } = useUser();
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

  return (
      <UsersProvider>
        <Header fixed>
          <Search />
          <div className='ml-auto flex items-center space-x-4'>
            <ProfileDropdown />
          </div>
        </Header>

        <LoadingOverlay isLoading={isLoading || userLoading}/>

        <Main>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Contracts</h2>
              <p className='text-muted-foreground'>
                Drag a template to a client to initiate a contract
              </p>
            </div>
          </div>

          <ContractsBoard userList={userList} />

          <ContractsDialogs />
        </Main>

      </UsersProvider>
  )
}
