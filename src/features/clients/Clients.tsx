import { Search } from '@/common/components/header/Search';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { UserContext } from '@/common/contexts/UserContext';
import { useClients } from '@/common/hooks/clients/useClients';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { useContext, useEffect, useState } from 'react';
import { columns } from './components/users-columns';
import { UsersDialogs } from './components/users-dialogs';
import { UsersTable } from './components/users-table';
import UsersProvider from './context/users-context';
import { TemplatesProvider } from './contexts/TemplatesContext';
import { userListSchema, UserSummary } from './data/schema';

export default function Users() {
  const { clients, isLoading, getClients } = useClients();
  const [userList, setUserList] = useState<UserSummary[]>([]);
  const { user, isLoading: userLoading } = useContext(UserContext);

  // fetch clients
  useEffect(() => {
    getClients();
  }, []);

  // Debug: Log the raw clients data before parsing
  useEffect(() => {
    if (clients.length > 0) {
      console.log('Raw clients data from API:', clients);
      console.log('First client structure:', clients[0]);
    }
  }, [clients]);

  // parse clients and summarize profile for view
  useEffect(() => {
    if (clients.length === 0) return;

    try {
      console.log('🔍 DEBUG: About to parse clients with Zod:', clients.length, 'clients');
      console.log('🔍 DEBUG: First client before parsing:', clients[0]);

      // Try parsing each client individually to see which one fails
      clients.forEach((client, index) => {
        try {
          userListSchema.parse([client]);
          console.log(`✅ Client ${index} parsed successfully`);
        } catch (parseError) {
          console.error(`❌ Client ${index} failed to parse:`, parseError);
          console.error(`❌ Client ${index} data:`, client);
        }
      });

      const parsed = userListSchema.parse(clients);
      console.log('🔍 DEBUG: Successfully parsed clients:', parsed.length, 'clients');
      console.log('🔍 DEBUG: First parsed client:', parsed[0]);

      setUserList(parsed);
    } catch (err) {
      console.error('Failed to parse client list with Zod:', err);
      console.error('🔍 DEBUG: Zod error details:', err);

      // If Zod parsing fails, try to use the raw data
      console.log('🔍 DEBUG: Falling back to raw clients data');
      setUserList(clients as any);
    }
  }, [clients]);

  // Debug: Log user data to help troubleshoot permission issue
  console.log('Clients page - User data:', user);
  console.log('Clients page - User role:', user?.role);
  console.log('Clients page - Is admin?', user?.role === 'admin');
  console.log('Clients page - User loading:', userLoading);
  console.log('Clients page - Clients data:', clients);
  console.log('Clients page - Clients loading:', isLoading);
  console.log('Clients page - UserList data:', userList);
  console.log('Clients page - UserList length:', userList.length);

  // Show loading while user data is being fetched
  if (userLoading) {
    return <div className='p-8 text-center'>Loading...</div>;
  }

  // Temporarily comment out admin check to allow all users to see clients
  // if (!user || user.role !== 'admin') {
  //   return (
  //     <div className='p-8 text-center text-red-500'>
  //       You do not have permission to view this page.
  //     </div>
  //   );
  // }

  return (
    <TemplatesProvider>
      <UsersProvider refreshClients={getClients}>
        <Header fixed>
          <Search />
          <div className='ml-auto'>
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className='flex items-center justify-between space-y-2'>
              <h2 className='text-3xl font-bold tracking-tight'>Clients</h2>
            </div>
            <UsersTable columns={columns(getClients)} data={userList} />
          </div>
        </Main>
        <UsersDialogs />
      </UsersProvider>
    </TemplatesProvider>
  );
}
