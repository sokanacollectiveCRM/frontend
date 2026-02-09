import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import LongText from '@/common/components/ui/long-text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/components/ui/tooltip';
import updateClientStatus from '@/common/utils/updateClientStatus';
import {
  STATUS_LABELS,
  User,
  userStatusSchema,
  type PortalStatus,
} from '@/features/clients/data/schema';
import { derivePortalStatus, isPortalEligible } from '@/features/clients/utils/portalStatus';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

const statusOptions = userStatusSchema.options;

interface PortalHandlers {
  onInviteClick: (lead: User) => void;
  onResendInvite: (lead: User) => void;
  onDisablePortal: (lead: User) => void;
}

export const columns = (
  refreshClients: () => void,
  portalHandlers?: PortalHandlers
): ColumnDef<User>[] => [
  {
    id: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client' />
    ),
    cell: ({ row }) => {
      const u = row.original as Record<string, unknown>;
      const firstname = (u.firstname ?? u.first_name ?? u.firstName) as string | undefined;
      const lastname = (u.lastname ?? u.last_name ?? u.lastName) as string | undefined;
      const email = u.email as string | undefined;
      const id = (u.id ?? '') as string;
      let displayName = '—';

      const hasValidFirstname = firstname && String(firstname).trim();
      const hasValidLastname = lastname && String(lastname).trim();

      if (hasValidFirstname && hasValidLastname) {
        displayName = `${String(firstname).trim()} ${String(lastname).trim()}`;
      } else if (hasValidFirstname) {
        displayName = String(firstname).trim();
      } else if (hasValidLastname) {
        displayName = String(lastname).trim();
      } else if (email && String(email).trim()) {
        displayName = String(email).trim();
      } else {
        displayName = id ? `Client ${id}` : '—';
      }

      return <LongText className='max-w-36'>{displayName}</LongText>;
    },
    filterFn: (row, _columnId, filterValue) => {
      const u = row.original as Record<string, unknown>;
      const firstname = (u.firstname ?? u.first_name ?? u.firstName) as string | undefined;
      const lastname = (u.lastname ?? u.last_name ?? u.lastName) as string | undefined;
      const email = u.email as string | undefined;
      const id = (u.id ?? '') as string;

      const hasValidFirstname = firstname && String(firstname).trim();
      const hasValidLastname = lastname && String(lastname).trim();

      let displayName = '';
      if (hasValidFirstname && hasValidLastname) {
        displayName = `${String(firstname).trim()} ${String(lastname).trim()}`;
      } else if (hasValidFirstname) {
        displayName = String(firstname).trim();
      } else if (hasValidLastname) {
        displayName = String(lastname).trim();
      } else if (email && String(email).trim()) {
        displayName = String(email).trim();
      } else {
        displayName = id ? `Client ${id}` : '';
      }

      return displayName
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
    meta: { className: 'pl-10 w-60' },
  },
  {
    accessorKey: 'serviceNeeded',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contract' />
    ),
    cell: ({ row }) => {
      const u = row.original as Record<string, unknown>;
      const service = (u.service_needed ?? u.serviceNeeded ?? '') as string;
      return (
        <Badge variant='outline' className='max-w-36'>
          {service || '—'}
        </Badge>
      );
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },

  {
    accessorKey: 'requestedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Requested' />
    ),
    cell: ({ row }) => {
      const { requestedAt } = row.original;
      return (
        <div className='w-fit text-nowrap'>
          {requestedAt.toLocaleDateString() ?? '-'}
        </div>
      );
    },
    meta: {
      className: cn(''),
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Updated' />
    ),
    cell: ({ row }) => {
      const updated = row.getValue('updatedAt') as Date;
      return <div>{updated.toLocaleDateString()}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { id, status } = row.original;
      const handleStatusChange = async (newStatus: string) => {
        console.log('🚨 STATUS CHANGE TRIGGERED!');
        console.log('🚨 Client ID:', id);
        console.log('🚨 New Status:', newStatus);

        try {
          const result = await updateClientStatus(id, newStatus);
          if (result.success) {
            toast.success('Successfully updated client status');
            // Refresh the client list to show updated timestamp
            refreshClients();
          } else {
            toast.error(result.error || 'Failed to update client status');
          }
        } catch (err) {
          console.error('Failed to update status:', err);
          toast.error('Failed to update client status...');
        }
      };
      return (
        <Select defaultValue={status} onValueChange={handleStatusChange}>
          <SelectTrigger className={cn('w-[120px]')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {STATUS_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: false,
    enableSorting: true,
  },
  {
    id: 'portal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Portal' />
    ),
    cell: ({ row }) => {
      const lead = row.original;
      // Get portal_status (invitation state) from backend
      const portalStatus = derivePortalStatus(lead);
      // Check eligibility separately (contract signed + payment succeeded)
      const eligible = isPortalEligible(lead);

      const handleInviteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (portalHandlers?.onInviteClick) {
          portalHandlers.onInviteClick(lead);
        }
      };

      // If not eligible, always show "Not eligible" badge
      if (!eligible) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant='outline'
                  className='bg-gray-100 text-gray-700 border-gray-200'
                >
                  Not eligible
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Available after contract signed + first payment completed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      // If eligible, show appropriate UI based on portal_status
      switch (portalStatus) {
        case 'not_invited':
          // Eligible and not invited yet - show invite button
          return (
            <Button
              size='sm'
              variant='default'
              onClick={handleInviteClick}
              className='h-7'
            >
              Invite
            </Button>
          );

        case 'invited':
          return (
            <Badge
              variant='outline'
              className='bg-amber-100 text-amber-700 border-amber-200'
            >
              Invited
            </Badge>
          );

        case 'active':
          return (
            <Badge
              variant='outline'
              className='bg-green-100 text-green-700 border-green-200'
            >
              Active
            </Badge>
          );

        case 'disabled':
          return (
            <Badge
              variant='outline'
              className='bg-red-100 text-red-700 border-red-200'
            >
              Disabled
            </Badge>
          );

        default:
          // Fallback: if portal_status is missing but eligible, show invite button
          return (
            <Button
              size='sm'
              variant='default'
              onClick={handleInviteClick}
              className='h-7'
            >
              Invite
            </Button>
          );
      }
    },
    meta: { className: 'w-32' },
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActions row={row} portalHandlers={portalHandlers} />
    ),
    meta: { className: 'sticky right-0 z-10 w-16' },
  },
];
