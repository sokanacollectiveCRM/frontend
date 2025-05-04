import { ContractCreationDialog } from '@/features/contracts/components/ContractCreationDialog'
import { useUsers } from '@/features/contracts/context/users-context'

export function ContractsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <ContractCreationDialog
        key='contract-create'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />
    </>
  )
}
