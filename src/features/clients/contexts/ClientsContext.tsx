import { Template } from '@/common/types/template'
import type { Client } from '@/features/clients/data/schema'
import React, { useState } from 'react'

type ClientsDialogType = 'new-contract' | 'archive' | 'delete'

interface ClientsContextType {
  open: ClientsDialogType | '',
  setOpen: (str: ClientsDialogType | '') => void
  currentRow: Client | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Client | null>>
  dialogTemplate: Template | null
  setDialogTemplate: React.Dispatch<React.SetStateAction<Template | null>>
}

const ClientsContext = React.createContext<ClientsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ClientsProvider({ children }: Props) {
  const [open, setOpen] = useState<ClientsDialogType | ''>('');
  const [currentRow, setCurrentRow] = useState<Client | null>(null)
  const [dialogTemplate, setDialogTemplate] = useState<Template | null>(null)

  return (
    <ClientsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, dialogTemplate, setDialogTemplate }}>
      {children}
    </ClientsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useClientsTable = () => {
  const clientsContext = React.useContext(ClientsContext)

  if (!clientsContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return clientsContext
}
