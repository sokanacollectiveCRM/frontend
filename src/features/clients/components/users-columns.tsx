import { Checkbox } from '@/common/components/ui/checkbox'
import LongText from '@/common/components/ui/long-text'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select'
import updateClientStatus from '@/common/utils/updateClientStatus'
import { cn } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import { callTypes } from '../data/data'
import { User, userStatusSchema } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

const statusOptions = userStatusSchema.options;

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 w-12 z-10 rounded-tl',
      ),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client' />
    ),
    cell: ({ row }) => {
      const { firstname, lastname } = row.original
      const fullName = `${firstname} ${lastname}`
      const initials = `${firstname[0] ?? ''}${lastname[0] ?? ''}`.toUpperCase();

      return (
        <Link to = "/specified" state={{user: row.original}}>
          <div className="flex items-center gap-2 max-w-36 h-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
              {initials}
            </div>
            <LongText className='max-w-36'>{fullName}</LongText>
          </div>
        </Link>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const { firstname, lastname } = row.original
      const fullName = `${firstname} ${lastname}`.toLowerCase()
      return fullName.includes((filterValue as string).toLowerCase())
    },
    meta: { className: 'w-50' },
  },
  {
    accessorKey: 'serviceNeeded',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contract' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('serviceNeeded')}</LongText>
    ),
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
      const requested = row.getValue('requestedAt') as Date;
      return <div className='w-fit text-nowrap'>{requested.toLocaleDateString()}</div>;
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
      const { id, status } = row.original
      const badgeColor = callTypes.get(status)

      const handleStatusChange = async (newStatus: string) => {
        try {
          await updateClientStatus(id, newStatus);
        } catch (err) {
          console.error('Failed to update status:', err)
        }
      }

      return (
        <Select defaultValue={status} onValueChange={handleStatusChange}>
          <SelectTrigger className={cn('w-[160px]', badgeColor)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
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
