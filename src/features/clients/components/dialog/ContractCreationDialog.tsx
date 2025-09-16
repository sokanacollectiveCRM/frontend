import { EnhancedContractDialog } from './EnhancedContractDialog';

interface Props {
  open: boolean;
  onOpenChange: (open: string) => void;
}

export function ContractCreationDialog({ open, onOpenChange }: Props) {
  return (
    <EnhancedContractDialog
      open={open}
      onOpenChange={(isOpen) => onOpenChange(isOpen ? 'new-contract' : '')}
    />
  );
}
