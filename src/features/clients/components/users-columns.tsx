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
  USER_STATUSES,
  User,
  type PortalStatus,
} from '@/features/clients/data/schema';
import { derivePortalStatus, canInviteToPortal } from '@/features/clients/utils/portalStatus';
import {
  getMissingCardPortalTooltip,
  getPortalBlockerDescription,
  getPortalBlockerLabel,
  normalizeClientEligibility,
  readIsEligible,
} from '@/lib/portalEligibility';
import { getAdminPaymentCardColumn } from '@/lib/paymentRules';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

const statusOptions = USER_STATUSES;

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
    id: 'client_number',
    accessorKey: 'clientNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='#' />
    ),
    cell: ({ row }) => {
      const u = row.original as Record<string, unknown>;
      const clientNumber = (u.clientNumber ?? u.client_number ?? '') as string;
      return <span className='font-mono text-muted-foreground'>{clientNumber || '—'}</span>;
    },
    meta: { className: 'w-[120px]' },
  },
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
    meta: { className: 'pl-10 w-[240px]' },
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
        <div className='min-w-0'>
          <Badge variant='outline' className='flex max-w-full justify-start'>
            <span className='truncate'>{service || '—'}</span>
          </Badge>
        </div>
      );
    },
    meta: {
      className: cn(
        'w-[220px] drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none'
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
        <div className='w-full text-nowrap'>
          {requestedAt.toLocaleDateString() ?? '-'}
        </div>
      );
    },
    meta: {
      className: cn('w-[120px]'),
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Updated' />
    ),
    cell: ({ row }) => {
      const updated = row.getValue('updatedAt') as Date;
      return <div className='w-full text-nowrap'>{updated.toLocaleDateString()}</div>;
    },
    enableSorting: true,
    meta: { className: 'w-[120px]' },
  },
  {
    id: 'payment_card',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Card' />
    ),
    cell: ({ row }) => {
      const u = row.original as Record<string, unknown>;
      const paymentMethod = (u.payment_method ?? u.paymentMethod) as string | undefined;
      const authStatus = (u.payment_authorization_status ??
        u.paymentAuthorizationStatus) as string | undefined;
      const summary = getAdminPaymentCardColumn(paymentMethod, authStatus);
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex max-w-[140px] flex-col gap-0.5'>
                <Badge
                  variant='outline'
                  className={cn('justify-start truncate px-2 py-0.5 text-xs font-medium', summary.badgeClass)}
                >
                  {summary.label}
                </Badge>
                {summary.sublabel ? (
                  <span className='truncate text-[11px] text-muted-foreground leading-tight'>
                    {summary.sublabel}
                  </span>
                ) : null}
              </div>
            </TooltipTrigger>
            <TooltipContent side='top' className='max-w-xs'>
              <p className='text-sm'>{summary.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    meta: { className: 'w-[96px]' },
    enableHiding: true,
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
        const u = row.original as Record<string, unknown>;
        const email = u.email as string | undefined;

        try {
          const result = await updateClientStatus(id, newStatus, {
            id,
            firstName: u.firstname as string | undefined,
            lastName: u.lastname as string | undefined,
            email: email,
          });
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
        <div className="relative">
          <span className="text-sm font-medium" data-testid="status-display">
            {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
          </span>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className={cn('w-[120px] absolute inset-0 opacity-0')}>
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
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: false,
    enableSorting: true,
    meta: { className: 'w-[120px]' },
  },
  {
    id: 'portal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Portal' />
    ),
    cell: ({ row }) => {
      const lead = row.original;
      const portalStatus = derivePortalStatus(lead);
      const eligible = canInviteToPortal(lead);
      const eligibility = normalizeClientEligibility(lead);
      const backendEligible = readIsEligible(lead);
      const primaryBlocker = eligibility.primary_portal_blocker;
      const blockerLabel = primaryBlocker ? getPortalBlockerLabel(primaryBlocker) : 'Blocked';
      const blockerDescription = primaryBlocker
        ? primaryBlocker === 'missing_card_on_file'
          ? getMissingCardPortalTooltip()
          : getPortalBlockerDescription(primaryBlocker)
        : 'Portal invite is locked until onboarding requirements are met.';

      const handleInviteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (portalHandlers?.onInviteClick) {
          portalHandlers.onInviteClick(lead);
        }
      };

      if (!eligible) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex max-w-[160px] flex-col gap-1'>
                  <Badge
                    variant='outline'
                    className='bg-gray-100 text-gray-700 border-gray-200 justify-start'
                  >
                    {backendEligible === false ? blockerLabel : 'Not eligible'}
                  </Badge>
                  {primaryBlocker === 'missing_card_on_file' ? (
                    <Badge
                      variant='outline'
                      className='bg-amber-50 text-amber-800 border-amber-200 justify-start text-[11px]'
                    >
                      Missing card on file
                    </Badge>
                  ) : null}
                </div>
              </TooltipTrigger>
              <TooltipContent className='max-w-xs'>
                <p className='text-sm'>{blockerDescription}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      switch (portalStatus) {
        case 'not_invited':
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex flex-col gap-1'>
                    <Badge
                      variant='outline'
                      className='bg-green-100 text-green-700 border-green-200 w-fit'
                    >
                      Eligible
                    </Badge>
                    <Button
                      size='sm'
                      variant='default'
                      onClick={handleInviteClick}
                      className='h-7'
                    >
                      Invite
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-sm'>Ready for portal invite</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
          return (
            <div className='flex flex-col gap-1'>
              <Badge
                variant='outline'
                className='bg-green-100 text-green-700 border-green-200 w-fit'
              >
                Eligible
              </Badge>
              <Button
                size='sm'
                variant='default'
                onClick={handleInviteClick}
                className='h-7'
              >
                Invite
              </Button>
            </div>
          );
      }
    },
    meta: { className: 'w-[160px]' },
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActions row={row} portalHandlers={portalHandlers} />
    ),
    meta: { className: 'w-[48px] pr-2 text-right' },
  },
];
