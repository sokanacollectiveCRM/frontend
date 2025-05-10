import useDialogState from '@/common/hooks/ui/use-dialog-state'
import React, { useState } from 'react'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UsersContextType {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: HoursRows | null
  setCurrentRow: React.Dispatch<React.SetStateAction<HoursRows | null>>
}

export type HoursRows = {
  id: string,
  client: {
    firstName: string,
    lastName: string,
  },
  // Doula fields
  doula: {
    firstName: string,
    lastName: string,
  },
  // Time fields
  start_time: string,
  end_time: string,
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<HoursRows | null>(null)

  return (
    <UsersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UsersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
