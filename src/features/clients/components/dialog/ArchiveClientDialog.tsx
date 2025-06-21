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
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArchiveClientDialog({ open, onOpenChange, client }: Props) {
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue('')
  }, [open])

  if (!client) return null

  const fullName = `${client.firstName} ${client.lastName}`

  const handleArchive = async () => {
    if (value !== fullName) {
      toast.error('Please enter full name to continue.')
      return
    }

    // TODO: ADD BACKEND LOGIC TO ACTUALLY ARCHIVE

    onOpenChange(false)

    toast.success(`Successfully archived ${client.firstName}`)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleArchive}
      confirmText='Archive'
      className='max-w-sm'
      destructive
      title={
        <span>
          <TriangleAlert className='mr-1 inline-block' size={18} />
          Archive Client
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Are you sure you want to archive <strong>{fullName}</strong>?<br />
            This will disable their account and hide them from active views.
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
            <AlertTitle>Note:</AlertTitle>
            <AlertDescription>
              Archiving disables login and hides the client from dashboards. You
              can restore them later.
            </AlertDescription>
          </Alert>
        </div>
      }
    />
  )
}