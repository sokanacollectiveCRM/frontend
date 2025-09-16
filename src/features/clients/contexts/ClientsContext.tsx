import { useClients } from '@/common/hooks/clients/useClients';
import { Client, clientListSchema } from '@/features/clients/data/schema';
import { Template } from '@/common/types/template';
import useDialogState from '@/common/hooks/ui/use-dialog-state';
import { createContext, useContext, useEffect, useState } from 'react';

type ClientsDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'new-contract' | 'archive';

interface ClientsContextType {
  clients: Client[];
  isLoading: boolean;
  refreshClients: () => void;
  open: ClientsDialogType | '';
  setOpen: (str: ClientsDialogType | '') => void;
  currentRow: Client | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Client | null>>;
  dialogTemplate: Template | null;
  setDialogTemplate: React.Dispatch<React.SetStateAction<Template | null>>;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const { clients: rawClients, getClients, isLoading } = useClients();
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState<ClientsDialogType | ''>('');
  const [currentRow, setCurrentRow] = useState<Client | null>(null);
  const [dialogTemplate, setDialogTemplate] = useState<Template | null>(null);

  useEffect(() => {
    getClients();
  }, []);

  useEffect(() => {
    try {
      const parsed = clientListSchema.parse(rawClients);
      setClients(parsed);
    } catch (err) {
      console.error('Client list schema parse failed:', err);
      setClients([]);
    }
  }, [rawClients]);

  return (
    <ClientsContext.Provider
      value={{ 
        clients, 
        isLoading, 
        refreshClients: getClients,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        dialogTemplate,
        setDialogTemplate
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
}

export function useClientsContext() {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClientsContext must be used within a ClientsProvider');
  }
  return context;
}
