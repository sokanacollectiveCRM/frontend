import { useUsers } from '@/common/contexts/UsersContext'
import { ContractCreationDialog } from '@/features/clients/components/dialog/ContractCreationDialog'

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
