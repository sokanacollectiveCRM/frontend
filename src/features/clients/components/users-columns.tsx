import { Badge } from '@/common/components/ui/badge';
import LongText from '@/common/components/ui/long-text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import updateClientStatus from '@/common/utils/updateClientStatus';
import {
  STATUS_LABELS,
  User,
  userStatusSchema,
} from '@/features/clients/data/schema';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

const statusOptions = userStatusSchema.options;

export const columns = (refreshClients: () => void): ColumnDef<User>[] => [
  {
    id: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client' />
    ),
    cell: ({ row }) => {
      const { firstname, lastname } = row.original;
      const displayName =
        firstname && lastname ? `${firstname} ${lastname}` : '—';
      return <LongText className='max-w-36'>{displayName}</LongText>;
    },
    filterFn: (row, _columnId, filterValue) => {
      const { firstname, lastname } = row.original;
      const displayName =
        firstname && lastname ? `${firstname} ${lastname}` : '';
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
      const { serviceNeeded } = row.original;
      return (
        <Badge variant='outline' className='max-w-36'>
          {serviceNeeded}
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
    id: 'actions',
    cell: DataTableRowActions,
    meta: { className: 'sticky right-0 z-10 w-16' },
  },
];
