import { useClients } from '@/common/hooks/clients/useClients'
import { Client, clientListSchema } from '@/features/clients/data/schema'
import { createContext, useContext, useEffect, useState } from 'react'

interface ClientsContextType {
  clients: Client[]
  isLoading: boolean
  refreshClients: () => void
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined)

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const { clients: rawClients, getClients, isLoading } = useClients()
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    getClients()
  }, [])

  useEffect(() => {
    try {
      const parsed = clientListSchema.parse(rawClients)
      setClients(parsed)
    } catch (err) {
      console.error('Client list schema parse failed:', err)
      setClients([])
    }
  }, [rawClients])

  return (
    <ClientsContext.Provider value={{ clients, isLoading, refreshClients: getClients }}>
      {children}
    </ClientsContext.Provider>
  )
}

export function useClientsContext() {
  const context = useContext(ClientsContext)
  if (!context) {
    throw new Error('useClientsContext must be used within a ClientsProvider')
  }
  return context
}