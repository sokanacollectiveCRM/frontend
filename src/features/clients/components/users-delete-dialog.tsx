'use client';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/common/components/ui/alert';
import { ConfirmDialog } from '@/common/components/ui/confirm-dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import deleteClient from '@/common/utils/deleteClient';
import { User } from '@/features/clients/data/schema';
import { TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: User;
  onDeleteSuccess?: () => void;
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow, onDeleteSuccess }: Props) {
  const [confirmValue, setConfirmValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmValue('');
      setErrorMessage('');
      setIsLoading(false);
    }
  }, [open]);

  // Check if confirm value matches (case-insensitive)
  const isConfirmValid = confirmValue.trim().toLowerCase() === 'confirm';

  const handleDelete = async () => {
    if (!isConfirmValid) {
      setErrorMessage('Please type \'confirm\' to proceed.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await deleteClient(currentRow.id);

      if (result.success) {
        onOpenChange(false);
        setTimeout(() => {
          toast.success(
            `${currentRow.firstname} ${currentRow.lastname} was successfully deleted.`
          );
        }, 150);
        // Refresh the client list
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        setErrorMessage(result.error || 'Failed to delete client. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmValue(e.target.value);
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={!isConfirmValid || isLoading}
      isLoading={isLoading}
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
            Are you sure you want to delete{' '}
            <strong>{currentRow.firstname} {currentRow.lastname}</strong>?<br />
            This action will permanently remove the user from the system. This cannot be undone.
          </p>

          <div className='space-y-2'>
            <Label>
              Type 'confirm' to proceed:
              <Input
                value={confirmValue}
                onChange={handleInputChange}
                placeholder="Type 'confirm' to proceed"
                className='mt-1'
                disabled={isLoading}
              />
            </Label>

            {errorMessage && (
              <p className='text-sm text-red-500'>{errorMessage}</p>
            )}
          </div>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation cannot be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  );
}
