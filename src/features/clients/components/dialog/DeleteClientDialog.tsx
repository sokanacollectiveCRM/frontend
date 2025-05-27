'use client'

import { ConfirmDialog } from '@/common/components/ui/confirm-dialog'
import { Input } from '@/common/components/ui/input'
import { Label } from '@/common/components/ui/label'

import { TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Client } from '../../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
}

export function DeleteClientDialog({ open, onOpenChange, client }: Props) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!open) {
      setValue('');
    }
  }, [open])

  if (!client) return null

  const fullName = `${client.user.firstname} ${client.user.lastname}`

  const handleDelete = () => {
    if (value.trim() !== fullName) {
      toast.error("Please enter full name to continue");
      return
    }

    // TODO: ADD BACKEND LOGIC TO DELETE USER HERE

    onOpenChange(false)

    toast.success(`${client.user.firstname} was successfully deleted.`);
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      confirmText='Delete'
      destructive
      className='max-w-sm'
      title={
        <span>
          <TriangleAlert className='mr-1 inline-block' size={18} />
          Delete Client
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Are you sure you want to delete <strong>{fullName}</strong>?<br />
            This action cannot be undone.
          </p>

          <Label>
            Confirm client name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter full name to confirm'
              className='mt-1'
            />
          </Label>
        </div>
      }
    />
  )
}