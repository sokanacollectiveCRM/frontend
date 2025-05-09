import { Search } from '@/common/components/header/Search'
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import { useClients } from '@/common/hooks/clients/useClients'
import { useUser } from '@/common/hooks/user/useUser'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import ClientsBoard from './components/ClientsBoard'
import { UsersDialogs } from './components/dialog/UsersDialogs'
import UsersProvider from './context/users-context'

export default function Users() {
  
  const { isLoading: userLoading } = useUser(); 
  const { isLoading } = useClients();

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <LoadingOverlay isLoading={isLoading || userLoading} />
      
      <Main>
        <div className="flex-1 overflow-auto p-4">
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Clients</h2>
              <p className='text-muted-foreground'>
                Manage your clients and their status here.
              </p>
            </div>
          </div>
          
          <ClientsBoard />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
