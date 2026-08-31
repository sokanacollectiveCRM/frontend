import { ApiError } from '@/api/errors';
import { Button } from '@/common/components/ui/button';
import { fetchSignedContractPdfBlob } from '@/features/billing-portal/billingPortalApi';
import { BillingState } from '@/features/billing-portal/components/BillingState';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function BillingContractViewerPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractId) {
      setError('Contract unavailable.');
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    void (async () => {
      setError(null);
      setPdfUrl(null);
      try {
        const blob = await fetchSignedContractPdfBlob(contractId);
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Unable to load the signed contract PDF.'
        );
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [contractId]);

  if (!contractId) {
    return (
      <BillingState
        title='Contract unavailable'
        description='This signed contract link is invalid.'
      />
    );
  }

  if (error) {
    return (
      <div className='flex min-h-dvh flex-col items-center justify-center gap-4 p-6'>
        <BillingState title='Unable to load contract' description={error} />
        <Button asChild variant='outline'>
          <Link to={`/billing/contracts/${contractId}`}>
            Back to billing details
          </Link>
        </Button>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <BillingState
        title='Loading signed contract'
        description='Preparing the contract PDF for viewing.'
      />
    );
  }

  return (
    <div className='flex min-h-dvh flex-col bg-slate-100'>
      <header className='flex items-center justify-between border-b bg-white px-4 py-3'>
        <p className='text-sm font-medium text-slate-900'>Signed contract</p>
        <Button asChild variant='outline' size='sm'>
          <Link to={`/billing/contracts/${contractId}`}>Billing details</Link>
        </Button>
      </header>
      <iframe
        title='Signed contract PDF'
        src={pdfUrl}
        className='min-h-0 flex-1 w-full border-0 bg-white'
      />
    </div>
  );
}
