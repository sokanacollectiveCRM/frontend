'use client'

import { Alert, AlertDescription, AlertTitle } from '@/common/components/ui/alert'
import { ConfirmDialog } from '@/common/components/ui/confirm-dialog'
import { Input } from '@/common/components/ui/input'
import { Label } from '@/common/components/ui/label'
import { Client } from '@/common/types/client'
import { TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client
}

export function DeleteClientDialog({ open, onOpenChange, client }: Props) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!open) setValue('')
  }, [open])

  if (!client) return null

  const fullName = `${client.firstName} ${client.lastName}`

  const handleDelete = () => {
    if (value !== fullName) {
      toast.error('Please enter full name to continue')
      return
    }

    // TODO: ADD BACKEND LOGIC TO DELETE USER HERE

    onOpenChange(false)

    toast.success(`${client.firstName} was successfully deleted.`)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      confirmText='Delete'
      className='max-w-sm'
      destructive
      title={
        <span>
          <TriangleAlert className='mr-1 inline-block' size={18} />
          Delete Client
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Are you sure you want to permanently delete{' '}
            <strong>{fullName}</strong>?<br />
            This will delete their account and all associated data.
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

          <Alert variant='destructive'>
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action is irreversible. Please be certain.
            </AlertDescription>
          </Alert>
        </div>
      }
    />
  )
}