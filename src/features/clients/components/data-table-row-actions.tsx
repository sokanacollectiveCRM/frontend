import { Button } from '@/common/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import { useUsers } from '@/features/clients/context/users-context';
import { User } from '@/features/clients/data/schema';
import { derivePortalStatus } from '@/features/clients/utils/portalStatus';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { Archive, Mail, Trash2, XCircle } from 'lucide-react';

interface PortalHandlers {
  onInviteClick: (lead: User) => void;
  onResendInvite: (lead: User) => void;
  onDisablePortal: (lead: User) => void;
}

interface DataTableRowActionsProps {
  row: Row<User>;
  portalHandlers?: PortalHandlers;
}

export function DataTableRowActions({
  row,
  portalHandlers,
}: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers();
  const lead = row.original;
  // Use existing portal_status if available, otherwise derive it
  const portalStatus =
    ((lead as any).portal_status as string) || derivePortalStatus(lead);

  const handleInviteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (portalHandlers?.onInviteClick) {
      portalHandlers.onInviteClick(lead);
    }
  };

  const handleResendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (portalHandlers?.onResendInvite) {
      portalHandlers.onResendInvite(lead);
    }
  };

  const handleDisableClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (portalHandlers?.onDisablePortal) {
      portalHandlers.onDisablePortal(lead);
    }
  };

  const isInviteEnabled = portalStatus === 'eligible';
  const isResendEnabled = portalStatus === 'invited';
  const isDisableEnabled = portalStatus === 'active';
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Button
              variant='ghost'
              className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
            >
              <DotsHorizontalIcon className='h-4 w-4' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setCurrentRow(row.original);
              setOpen('edit');
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <Archive size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setCurrentRow(row.original);
              setOpen('invite');
            }}
          >
            Invite to CRM
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {portalHandlers && (
            <>
              <DropdownMenuItem
                onClick={handleInviteClick}
                disabled={!isInviteEnabled}
                className={!isInviteEnabled ? 'opacity-50 cursor-not-allowed' : ''}
                title={
                  !isInviteEnabled
                    ? 'Invite available after contract signed + first payment completed'
                    : undefined
                }
              >
                <Mail size={16} className='mr-2' />
                Invite to portal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleResendClick}
                disabled={!isResendEnabled}
                className={!isResendEnabled ? 'opacity-50 cursor-not-allowed' : ''}
                title={!isResendEnabled ? 'Only available for invited leads' : undefined}
              >
                <Mail size={16} className='mr-2' />
                Resend invite
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDisableClick}
                disabled={!isDisableEnabled}
                className={!isDisableEnabled ? 'opacity-50 cursor-not-allowed' : ''}
                title={
                  !isDisableEnabled ? 'Only available for active portal users' : undefined
                }
              >
                <XCircle size={16} className='mr-2' />
                Disable portal access
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation(); // ✅ prevent row click
              setCurrentRow(row.original);
              setOpen('delete');
            }}
            className='!text-red-500'
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
