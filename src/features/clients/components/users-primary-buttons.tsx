import { Button } from '@/common/components/ui/button';
import { UserContext } from '@/common/contexts/UserContext';
import { Send, SquarePlus } from 'lucide-react';
import { useContext, useState } from 'react';
import { EnhancedContractDialog } from './dialog/EnhancedContractDialog';
import { fetchWithAuth, buildUrl } from '@/api/http';

export function UsersPrimaryButtons() {
  const [isEnhancedContractDialogOpen, setIsEnhancedContractDialogOpen] =
    useState(false);
  const { user } = useContext(UserContext);
  const canExportCsv = user?.role === 'admin';

  const fetchCSV = async () => {
    try {
      const data = await fetchWithAuth(buildUrl('/clients/fetchCSV'));

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
    <div className='ml-auto flex shrink-0 flex-wrap justify-end gap-2'>
      {canExportCsv ? (
        <Button variant='outline' className='space-x-1' onClick={fetchCSV}>
          <span>Export</span>
          <SquarePlus size={18} />
        </Button>
      ) : null}
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
