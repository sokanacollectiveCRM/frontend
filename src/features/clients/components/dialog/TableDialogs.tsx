import { useTable } from 'features/clients/contexts/TableContext';
import { ArchiveClientDialog } from './ArchiveClientDialog';
import { ContractCreationDialog } from './ContractCreationDialog';
import { DeleteClientDialog } from './DeleteClientDialog';

export function TableDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTable();
  return (
    <>
      <ContractCreationDialog
        key='new-contract'
        open={open === 'new-contract'}
        onOpenChange={(state) => setOpen(state ? 'new-contract' : '')}
      />

      <DeleteClientDialog
        key='delete'
        open={open === 'delete'}
        onOpenChange={(state) => setOpen(state ? 'delete' : '')}
        client={currentRow}
      />

      <ArchiveClientDialog
        key='archive'
        open={open === 'archive'}
        onOpenChange={(state) => setOpen(state ? 'archive' : '')}
        client={currentRow}
      />
    </>
  );
}
