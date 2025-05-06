import { ContractCreationDialog } from '@/features/contracts/components/ContractCreationDialog'
import { useUsers } from '../../context/users-context'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <ContractCreationDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />
    </>
  )
}
