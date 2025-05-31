import LongText from '@/common/components/ui/long-text'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select'
import updateClientStatus from '@/common/utils/updateClientStatus'
import { cn } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Client, STATUS_LABELS, userStatusSchema } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/common/components/ui/badge'

const statusOptions = userStatusSchema.options;

export const columns: ColumnDef<Client>[] = [
  {
    id: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client' />
    ),
    cell: ({ row }) => {
      const { user: { firstname, lastname } } = row.original
      const fullName = `${firstname} ${lastname}`
      const initials = `${firstname[0] ?? ''}${lastname[0] ?? ''}`.toUpperCase();

      return (
        <div className="flex items-center gap-2 max-w-36 h-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
            {initials}
          </div>
          <LongText className='max-w-36'>{fullName}</LongText>
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const { user: { firstname, lastname } } = row.original
      const fullName = `${firstname} ${lastname}`.toLowerCase()
      return fullName.includes((filterValue as string).toLowerCase())
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
     return  <Badge variant='outline' className='max-w-36'>{serviceNeeded}</Badge>
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
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
      return <div className='w-fit text-nowrap'>{requestedAt.toLocaleDateString() ?? '-'}</div>
    },
    meta: {
      className: cn(
        ''
      ),
    }
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
      const { id, status } = row.original

      const handleStatusChange = async (newStatus: string) => {
        try {
          await updateClientStatus(id, newStatus);
          toast.success('Successfully updated client status');
        } catch (err) {
          console.error('Failed to update status:', err)
          toast.error('Failed to update client status...');
        }
      }

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
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
    meta: { className: 'sticky right-0 z-10 w-16' }
  },
]
