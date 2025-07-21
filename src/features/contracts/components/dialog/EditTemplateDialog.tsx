import { Button } from '@/common/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/common/components/ui/dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { useToast } from '@/common/hooks/toast/use-toast';
import { Loader2, Pencil } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
  templateId: string;
  templateName: string;
  currentDeposit: number;
  currentFee: number;
  onUpdateSuccess: () => void;
}

export function EditTemplateDialog({
  templateId,
  templateName,
  currentDeposit,
  currentFee,
  onUpdateSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const closeRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon' className='h-6 w-6 p-0'>
          <Pencil className='h-4 w-4' />
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>
            Update the template’s service fee, deposit, or upload a new file.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);

            const form = e.currentTarget;
            const fileInput = form.elements.namedItem(
              'file'
            ) as HTMLInputElement;
            const depositInput = form.elements.namedItem(
              'deposit'
            ) as HTMLInputElement;
            const feeInput = form.elements.namedItem('fee') as HTMLInputElement;

            const file = fileInput?.files?.[0];
            const formData = new FormData();
            formData.append('deposit', depositInput.value);
            formData.append('fee', feeInput.value);
            if (file) formData.append('contract', file);

            const token = localStorage.getItem('authToken');

            try {
              const res = await fetch(
                `${import.meta.env.VITE_APP_BACKEND_URL}/contracts/templates/${templateName}`,
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: formData,
                }
              );

              if (!res.ok) throw new Error('Failed to update template.');

              toast({ title: 'Template updated successfully!' });
              onUpdateSuccess();
              closeRef.current?.click();
            } catch (err) {
              console.error(err);
              toast({
                title: 'Update failed',
                description: 'Please try again.',
                variant: 'destructive',
              });
            } finally {
              setIsLoading(false);
            }
          }}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label>Template Name</Label>
            <Input value={templateName} disabled />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='file'>Upload New .docx File (optional)</Label>
            <Input type='file' name='file' id='file' accept='.docx' />
          </div>

          <div className='flex gap-4'>
            <div className='flex-1 space-y-2'>
              <Label htmlFor='deposit'>Deposit Fee</Label>
              <Input
                name='deposit'
                id='deposit'
                type='number'
                defaultValue={currentDeposit}
                required
              />
            </div>
            <div className='flex-1 space-y-2'>
              <Label htmlFor='fee'>Service Fee</Label>
              <Input
                name='fee'
                id='fee'
                type='number'
                defaultValue={currentFee}
                required
              />
            </div>
          </div>

          <DialogFooter className='pt-2 flex gap-2'>
            <DialogClose asChild>
              <Button
                type='button'
                variant='secondary'
                ref={closeRef}
                className='w-full'
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin mx-auto' />
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
