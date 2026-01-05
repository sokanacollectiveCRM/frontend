import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import type { User } from '../data/schema';

interface PortalInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: User | null;
  onConfirm: () => void;
}

export function PortalInviteModal({
  open,
  onOpenChange,
  lead,
  onConfirm,
}: PortalInviteModalProps) {
  console.log('PortalInviteModal - open:', open, 'lead:', lead);

  if (!lead) {
    console.log('PortalInviteModal - No lead provided, returning null');
    return null;
  }

  const handleConfirm = () => {
    console.log('PortalInviteModal - Send Invite button clicked');
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite client to portal</DialogTitle>
          <DialogDescription className='space-y-2 pt-2'>
            <p>
              This will email a secure link to create a password and access the
              client dashboard.
            </p>
            <p>
              Invite is available after contract is signed and first payment is
              completed.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

