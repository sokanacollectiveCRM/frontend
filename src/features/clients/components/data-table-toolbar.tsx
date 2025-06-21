import { Button } from '@/common/components/ui/button'
import { Input } from '@/common/components/ui/input'
import { Template } from '@/common/types/template'
import { Table } from '@tanstack/react-table'
import { Plus, X } from 'lucide-react'
import { useTable } from '../contexts/TableContext'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DraggableTemplate } from './DraggableTemplate'

const USER_STATUSES = [
  'lead',
  'contacted',
  'matching',
  'interviewing',
  'follow up',
  'contract',
  'active',
  'complete',
]

const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  matching: 'Matching',
  interviewing: 'Interviewing',
  'follow up': 'Follow Up',
  contract: 'Contract',
  active: 'Active',
  complete: 'Complete',
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  draggedTemplate: Template | null
}

export function DataTableToolbar<TData>({
  table,
  draggedTemplate,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const { setOpen } = useTable()

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Filter by name...'
          value={(table.getColumn('client')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('client')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title='Status'
            options={USER_STATUSES.map((status) => ({
              value: status,
              label: STATUS_LABELS[status],
            }))}
          />
        )}
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
      <div className='flex items-center gap-x-2'>
        {draggedTemplate && <DraggableTemplate template={draggedTemplate} />}
        <Button size='sm' onClick={() => setOpen('new-contract')}>
          <Plus size={16} className='mr-2' />
          New Contract
        </Button>
      </div>
    </div>
  )
}
