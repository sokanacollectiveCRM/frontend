import { Search } from '@/common/components/header/Search'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import { UserContext } from '@/common/contexts/UserContext'
import { useClients } from '@/common/hooks/clients/useClients'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import { Client, clientSchema } from '@/common/types/client'
import { Template } from '@/common/types/template'
import { useContext, useEffect, useState } from 'react'
import { z } from 'zod'
import { ClientsTable } from './components/ClientsTable'
import { columns } from './components/users-columns'
import { ClientsDialogs } from './components/users-dialogs'
import { ClientsPrimaryButtons } from './components/users-primary-buttons'
import ClientsProvider from './context/clients-context'

const clientListSchema = z.array(clientSchema)

export default function Clients() {
  const { clients, isLoading, getClients } = useClients();
  const [clientList, setClientList] = useState<Client[]>([]);
  const { user } = useContext(UserContext);
  const [draggedTemplate, setDraggedTemplate] = useState<Template | null>(null);

  // fetch clients
  useEffect(() => {
    getClients();
  }, []);

  // parse clients and summarize profile for view
  useEffect(() => {
    if (clients.length === 0) return;

    try {
      const parsed = clientListSchema.parse(clients);
      setClientList(parsed);
    } catch (err) {
      console.error('Failed to parse client list with Zod:', err);
      setClientList([]);
    }
  }, [clients]);

  if (user?.role !== 'admin') {
    return <div className='p-8 text-center text-red-500'>You do not have permission to view this page.</div>;
  }

  return (
    <ClientsProvider>
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
            <div className='flex items-center space-x-2'>
              <ClientsPrimaryButtons draggedTemplate={draggedTemplate} />
            </div>
          </div>
          <ClientsTable columns={columns} data={clientList} draggedTemplate={draggedTemplate} />
        </div>
      </Main>
      <ClientsDialogs draggedTemplate={draggedTemplate} />
    </ClientsProvider>
  )
}
