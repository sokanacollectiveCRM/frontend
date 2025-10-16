import { useUsers } from '@/features/clients/context/users-context';
import { LeadProfileModal } from './dialog/LeadProfileModal';
import { UsersActionDialog } from './users-action-dialog';
import { UsersDeleteDialog } from './users-delete-dialog';
import { UsersInviteDialog } from './users-invite-dialog';

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, refreshClients } =
    useUsers();
  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
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
              setOpen('edit');
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
            onUpdateSuccess={refreshClients}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete');
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
            onDeleteSuccess={refreshClients}
          />
        </>
      )}

      {/* Lead Profile Modal - opens when clicking on a row */}
      {currentRow && (
        <LeadProfileModal
          key={`lead-profile-${currentRow.id}`}
          open={open === 'lead-profile'}
          onOpenChange={(isOpen) => {
            setOpen(isOpen ? 'lead-profile' : null);
            if (!isOpen) {
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }
          }}
          client={currentRow}
          refreshClients={refreshClients}
        />
      )}
    </>
  );
}
