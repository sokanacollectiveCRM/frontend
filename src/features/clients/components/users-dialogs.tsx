import { Template } from '@/common/types/template';
import { useClientsContext } from '../context/clients-context';
import { UsersActionDialog } from './users-action-dialog';
import { UsersDeleteDialog } from './users-delete-dialog';
import { UsersInviteDialog } from './users-invite-dialog';

interface UsersDialogsProps {
  draggedTemplate: Template | null;
}

export function ClientsDialogs({ draggedTemplate }: UsersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useClientsContext()
  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
        draggedTemplate={draggedTemplate}
      />

      <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
            draggedTemplate={draggedTemplate}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
} 