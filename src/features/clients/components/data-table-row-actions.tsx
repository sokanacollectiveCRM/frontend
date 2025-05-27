import { Button } from '@/common/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Archive, Trash2 } from 'lucide-react'
import { useTable } from '../contexts/TableContext'
import { Client } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<Client>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useTable()
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
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setCurrentRow(row.original);
              setOpen('archive');
            }}
          >
            Archive
            <DropdownMenuShortcut>
              <Archive size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
  )
}
