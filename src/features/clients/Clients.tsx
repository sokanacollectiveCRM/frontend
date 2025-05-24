import { Search } from '@/common/components/header/Search'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import ClientsBoard from './components/ClientsBoard'
import { TableDialogs } from './components/dialog/TableDialogs'
import ClientsProvider from './contexts/ClientsContext'
import { TemplatesProvider } from './contexts/TemplatesContext'

export default function Clients() {

  return (
    <TemplatesProvider>
      <ClientsProvider>
        <Header fixed>
          <Search />
          <div className='ml-auto flex items-center space-x-4'>
            <ProfileDropdown />
          </div>
        </Header>

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

        <TableDialogs />
      </ClientsProvider>
    </TemplatesProvider>
  )
}
