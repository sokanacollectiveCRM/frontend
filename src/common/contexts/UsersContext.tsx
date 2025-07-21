import useDialogState from '@/common/hooks/ui/use-dialog-state';
import type { Client } from '@/features/clients/data/schema';
import React, { useState } from 'react';
import { Template } from 'common/types/template';

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete';

interface UsersContextType {
  open: UsersDialogType | null;
  setOpen: (str: UsersDialogType | null) => void;
  currentRow: Client | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Client | null>>;
  dialogTemplate: Template | null;
  setDialogTemplate: React.Dispatch<React.SetStateAction<Template | null>>;
}

const UsersContext = React.createContext<UsersContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Client | null>(null);
  const [dialogTemplate, setDialogTemplate] = useState<Template | null>(null);

  return (
    <UsersContext.Provider
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
    </UsersContext.Provider>
  );
}

export const useUsers = () => {
  const usersContext = React.useContext(UsersContext);

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>');
  }

  return usersContext;
};
