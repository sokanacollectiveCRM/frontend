import type { Client } from '@/features/clients/data/schema'
import React, { createContext, useContext, useState } from 'react'

type ClientsDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface ClientsContextType {
  open: ClientsDialogType | null
  setOpen: (str: ClientsDialogType | null) => void
  currentRow: Client | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Client | null>>
}

const ClientsContext = createContext<ClientsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ClientsProvider({ children }: Props) {
  const [open, setOpen] = useState<ClientsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Client | null>(null)

  return (
    <ClientsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ClientsContext.Provider>
  )
}

export const useClientsContext = () => {
  const context = useContext(ClientsContext)
  if (!context)
    throw new Error('useClientsContext must be used within a ClientsProvider')
  return context
} 