import { useClientsTable } from "../../contexts/ClientsContext"
import { ContractCreationDialog } from "./ContractCreationDialog"

export function TableDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useClientsTable()
  return (
    <>
      <ContractCreationDialog
        key='new-contract'
        open={open === 'new-contract'}
        onOpenChange={() => setOpen('new-contract')}
      />
    </>
  )
}
