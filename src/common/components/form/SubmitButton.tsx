import { Button } from '@/common/components/ui/button';
import { ReactNode } from 'react';

type SubmitButtonProps = {
  children: ReactNode,
  onClick: () => void,
}

export default function SubmitButton({ children, onClick }: SubmitButtonProps) {
  return (
    <Button type='submit' onClick={onClick}>
      {children}
    </Button>
  );
}

