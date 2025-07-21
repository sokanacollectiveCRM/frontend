import { Template } from '@/common/types/template';
import type { User } from '@/features/clients/data/schema';
import React, { useState } from 'react';

type ClientsDialogType = 'new-contract' | 'archive' | 'delete' | 'edit';

interface ClientsContextType {
  open: ClientsDialogType | '';
  setOpen: (str: ClientsDialogType | '') => void;
  currentRow: User | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>;
  dialogTemplate: Template | null;
  setDialogTemplate: React.Dispatch<React.SetStateAction<Template | null>>;
}

const TableContext = React.createContext<ClientsContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function TableProvider({ children }: Props) {
  const [open, setOpen] = useState<ClientsDialogType | ''>('');
  const [currentRow, setCurrentRow] = useState<User | null>(null);
  const [dialogTemplate, setDialogTemplate] = useState<Template | null>(null);

  return (
    <TableContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        dialogTemplate,
        setDialogTemplate,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export const useTable = () => {
  const tableContext = React.useContext(TableContext);

  if (!tableContext) {
    throw new Error('useTable has to be used within <TableProvider>');
  }

  return tableContext;
};
