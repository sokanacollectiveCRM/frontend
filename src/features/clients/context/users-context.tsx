import useDialogState from '@/common/hooks/ui/use-dialog-state';
import type { User } from '@/features/clients/data/schema';
import React, { useState } from 'react';

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete';

interface UsersContextType {
  open: UsersDialogType | null;
  setOpen: (str: UsersDialogType | null) => void;
  currentRow: User | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>;
  refreshClients?: () => void;
}

const UsersContext = React.createContext<UsersContextType | null>(null);

interface Props {
  children: React.ReactNode;
  refreshClients?: () => void;
}

export default function UsersProvider({ children, refreshClients }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<User | null>(null);

  return (
    <UsersContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow, refreshClients }}
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
