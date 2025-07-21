'use client';

import { ConfirmDialog } from '@/common/components/ui/confirm-dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import deleteClient from '@/common/utils/deleteClient';
import { Client } from '@/features/clients/data/schema';
import { TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onDeleteSuccess?: () => void;
}

export function DeleteClientDialog({ open, onOpenChange, client, onDeleteSuccess }: Props) {
  const [confirmValue, setConfirmValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setConfirmValue('');
      setErrorMessage('');
      setIsLoading(false);
    }
  }, [open]);

  if (!client) return null;

  const fullName = `${client.firstname} ${client.lastname}`;

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
      const result = await deleteClient(client.id);

      if (result.success) {
        toast.success(`${client.firstname} was successfully deleted.`);
        onOpenChange(false);

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
        </div>
      }
    />
  );
}
