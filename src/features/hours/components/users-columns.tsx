import LongText from '@/common/components/ui/long-text';
import { HoursRows } from '@/features/hours/context/clients-context';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from './data-table-column-header';

export const columns: ColumnDef<HoursRows>[] = [
  {
    id: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client' />
    ),
    cell: ({ row }) => {
      const { firstName, lastName } = row.original.client;
      const fullName = `${firstName} ${lastName}`;
      return <LongText className='max-w-36'>{fullName}</LongText>;
    },
    meta: { className: 'w-36' },
  },
  {
    id: 'doula',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Doula' />
    ),
    cell: ({ row }) => {
      const { firstName, lastName } = row.original.doula;
      const fullName = `${firstName} ${lastName}`;
      return <LongText className='max-w-36'>{fullName}</LongText>;
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'start_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Start' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('start_time')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'sticky left-6 md:table-cell'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'end_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='End' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap flex flex-row items-center h-8 w-8'>
        {row.getValue('end_time')}
      </div>
    ),
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Duration' />
    ),
    cell: ({ row }) => {
      const start_time = row.getValue('start_time');
      const end_time = row.getValue('end_time');

      if (!start_time || !end_time) {
        return <div>N/A</div>;
      }

      const startDate = new Date(start_time as string);
      const endDate = new Date(end_time as string);

      // Calculate duration in milliseconds
      const durationMs = endDate.getTime() - startDate.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      // Format the duration string
      const durationStr = `${hours}h ${minutes}m`;

      return <div>{durationStr}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'note',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notes' />
    ),
    cell: ({ row }) => {
      const noteContent = row.original.note?.content || '';
      return <LongText className='max-w-36'>{noteContent}</LongText>;
    },
    meta: {
      className: 'w-36',
    },
    enableHiding: false,
    enableSorting: true,
  },
];
