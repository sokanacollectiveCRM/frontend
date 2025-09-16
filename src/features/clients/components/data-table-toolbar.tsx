import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Template } from '@/common/types/template';
import { STATUS_LABELS, USER_STATUSES } from '@/features/clients/data/schema';
import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { UsersPrimaryButtons } from './users-primary-buttons';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  draggedTemplate?: Template | null;
  clients?: any[];
}

export function DataTableToolbar<TData>({
  table,
  draggedTemplate,
  clients,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-row items-center gap-x-2'>
        <Input
          placeholder='Filter clients...'
          value={(table.getColumn('client')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('client')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={USER_STATUSES.map((status) => ({
                label: STATUS_LABELS[status],
                value: status,
              }))}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <UsersPrimaryButtons draggedTemplate={draggedTemplate ?? null} clients={clients} />
    </div>
  );
}
