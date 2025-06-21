import { Button } from '@/common/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/common/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu'
import { Client } from '@/common/types/client'
import { Row } from '@tanstack/react-table'
import { Edit, MoreHorizontal, Trash, User } from 'lucide-react'
import { useState } from 'react'
import { ArchiveClientDialog } from './dialog/ArchiveClientDialog'
import { DeleteClientDialog } from './dialog/DeleteClientDialog'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const client = row.original as Client
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  return (
    <>
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
            >
              <MoreHorizontal className='h-4 w-4' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[160px]'>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <User className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                View Profile
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem>
              <Edit className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsArchiveOpen(true)}>
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteOpen(true)}
              className='text-red-500'
            >
              <Trash className='mr-2 h-3.5 w-3.5' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <div>View Profile dialog content goes here</div>
        </DialogContent>
      </Dialog>

      <ArchiveClientDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        client={client}
      />
      <DeleteClientDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        client={client}
      />
    </>
  )
}
