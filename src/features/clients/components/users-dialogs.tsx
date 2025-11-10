import { useUsers } from '@/features/clients/context/users-context';
import { LeadProfileModal } from './dialog/LeadProfileModal';
import { UsersActionDialog } from './users-action-dialog';
import { UsersDeleteDialog } from './users-delete-dialog';
import { UsersInviteDialog } from './users-invite-dialog';
import { useLocation, useNavigate } from 'react-router-dom';

interface UsersDialogsProps {
  missingClientId?: string;
  onLeadProfileClose?: () => void;
}

export function UsersDialogs({
  missingClientId,
  onLeadProfileClose,
}: UsersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow, refreshClients } =
    useUsers();
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = location.pathname.startsWith('/admin/clients')
    ? '/admin/clients'
    : '/clients';

  const handleLeadProfileOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setOpen('lead-profile');
      return;
    }

    onLeadProfileClose?.();
    setOpen(null);

    // Remove the clientId from the URL when closing the modal.
    if (location.pathname !== basePath) {
      navigate(basePath, { replace: true });
    }

    setTimeout(() => {
      setCurrentRow(null);
    }, 300);
  };

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

      {/* Lead Profile Modal - opens when clicking on a row or via deep link */}
      {open === 'lead-profile' && (
        <LeadProfileModal
          key={
            currentRow
              ? `lead-profile-${currentRow.id}`
              : 'lead-profile-missing-client'
          }
          open
          onOpenChange={handleLeadProfileOpenChange}
          client={currentRow}
          refreshClients={refreshClients}
          missingClientId={missingClientId}
        />
      )}
    </>
  );
}
