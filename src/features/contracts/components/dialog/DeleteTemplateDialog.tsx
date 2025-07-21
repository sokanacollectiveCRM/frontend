import { Button } from '@/common/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Input } from '@/common/components/ui/input';
import { useTemplatesContext } from '@/features/contracts/contexts/TemplatesContext';
import { Dialog, DialogTrigger } from '@radix-ui/react-dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  templateName: string;
  onDelete: () => void;
};

export function DeleteTemplateDialog({ templateName, onDelete }: Props) {
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { getTemplates } = useTemplatesContext();

  const isMatch = confirmation.trim() === templateName.trim();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(
        `http://localhost:5050/contracts/templates/${encodeURIComponent(templateName)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('Failed to delete template');

      toast.success(`${templateName} was deleted successfully.`);
      onDelete();
      closeRef.current?.click();
      getTemplates();
    } catch (err) {
      console.error(err);
      toast.error(
        `Something went wrong. ${err instanceof Error ? err.message : err}.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon' className='h-6 w-6 p-0'>
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>Delete Template</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{templateName}</strong>. <br />
            To confirm, type the template name below:
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder='Template name'
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />

        <DialogFooter className='gap-2'>
          <DialogClose>
            <Button
              type='button'
              variant='secondary'
              ref={closeRef}
              className='w-full'
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant='destructive'
            disabled={!isMatch || isLoading}
            onClick={handleDelete}
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
