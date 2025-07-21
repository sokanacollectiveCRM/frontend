'use client';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/common/components/ui/alert';
import { ConfirmDialog } from '@/common/components/ui/confirm-dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { toast } from '@/common/hooks/toast/use-toast';
import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { User } from 'features/clients/data/schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: User;
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('');

  const handleDelete = () => {
    const { firstname, lastname } = currentRow;
    const fullName = `${firstname} ${lastname}`;
    if (value.trim() !== fullName) return;

    onOpenChange(false);
    toast({
      title: 'The following user has been deleted:',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>
            {JSON.stringify(currentRow, null, 2)}
          </code>
        </pre>
      ),
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      className='max-w-sm'
      title={
        <span className='text-destructive'>
          <TriangleAlert
            className='mr-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete <br />
            This action will permanently remove the user with the role of from
            the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Username:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter username to confirm deletion.'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be carefull, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  );
}
