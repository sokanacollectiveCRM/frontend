import { Button } from '@/common/components/ui/button';
import { Template } from '@/common/types/template';
import { Send, SquarePlus } from 'lucide-react';
import { useState } from 'react';
import { EnhancedContractDialog } from './dialog/EnhancedContractDialog';

interface Props {
  draggedTemplate: Template | null;
  clients?: any[]; // Simple clients prop
}

export function UsersPrimaryButtons({
  draggedTemplate,
  clients = [],
}: Props) {
  const [isEnhancedContractDialogOpen, setIsEnhancedContractDialogOpen] = useState(false);

  const fetchCSV = async () => {
    const baseUrl =
      import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';
    try {
      const data = await fetch(`${baseUrl}/clients/fetchCSV`, {
        credentials: 'include',
        headers: {
        },
      });

      const csvData = await data.text();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'demographics.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      throw new Error(`Error Retrieving CSV${error}`);
    }
  };
  return (
    <div className='flex gap-2'>
      <Button variant='outline' className='space-x-1' onClick={fetchCSV}>
        <span>Export</span>
        <SquarePlus size={18} />
      </Button>
      <Button
        className='space-x-1'
        onClick={() => setIsEnhancedContractDialogOpen(true)}
      >
        <span>Send Contract</span>
        <Send size={18} />
      </Button>

      <EnhancedContractDialog
        open={isEnhancedContractDialogOpen}
        onOpenChange={setIsEnhancedContractDialogOpen}
      />
    </div>
  );
}
