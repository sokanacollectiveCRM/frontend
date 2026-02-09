import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { toast } from 'sonner';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { supabase } from '@/lib/supabase';
import { FileText, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Contract {
  id: string;
  contractId: string;
  status: string;
  serviceType: string;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
  signedAt?: string;
}

export default function ClientContractsTab() {
  const { client } = useClientAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (client) {
      fetchContracts();
    }
  }, [client]);

  const fetchContracts = async () => {
    if (!client) return;

    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No session found');
      }

      // TODO: Replace with actual client contracts API endpoint
      // Example: GET /api/clients/me/contracts
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/api/clients/me/contracts`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setContracts(Array.isArray(data) ? data : data.contracts || []);
        } else {
          // Endpoint doesn't exist yet or other error, show empty state
          setContracts([]);
        }
      } catch (fetchError) {
        // Network error or other issue, show empty state
        // Silently handle - endpoint may not exist yet
        setContracts([]);
      }
    } catch (error: any) {
      // Outer catch for session errors
      console.log('Error fetching contracts (endpoint may not exist):', error);
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'signed' || statusLower === 'completed') {
      return (
        <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'>
          <CheckCircle className='h-3 w-3' />
          Signed
        </span>
      );
    } else if (statusLower === 'pending') {
      return (
        <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700'>
          <Clock className='h-3 w-3' />
          Pending
        </span>
      );
    }
    return (
      <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={isLoading} />;
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>My Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className='text-center py-12'>
              <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No contracts found</p>
              <p className='text-sm text-muted-foreground mt-2'>
                Your contracts will appear here once they are created.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {contracts.map((contract) => (
                <Card key={contract.id} className='border-l-4 border-l-primary'>
                  <CardContent className='pt-6'>
                    <div className='flex items-start justify-between'>
                      <div className='space-y-2 flex-1'>
                        <div className='flex items-center gap-3'>
                          <h3 className='text-lg font-semibold'>{contract.serviceType}</h3>
                          {getStatusBadge(contract.status)}
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          Contract ID: {contract.contractId}
                        </p>
                        <div className='grid grid-cols-2 gap-4 mt-4'>
                          <div className='flex items-center gap-2'>
                            <DollarSign className='h-4 w-4 text-muted-foreground' />
                            <div>
                              <p className='text-xs text-muted-foreground'>Total Amount</p>
                              <p className='font-semibold'>
                                ${((contract.totalAmount || 0) / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <DollarSign className='h-4 w-4 text-muted-foreground' />
                            <div>
                              <p className='text-xs text-muted-foreground'>Deposit</p>
                              <p className='font-semibold'>
                                ${((contract.depositAmount || 0) / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-4 mt-4 text-sm text-muted-foreground'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4' />
                            <span>
                              Created:{' '}
                              {contract.createdAt
                                ? format(new Date(contract.createdAt), 'MMM dd, yyyy')
                                : 'N/A'}
                            </span>
                          </div>
                          {contract.signedAt && (
                            <div className='flex items-center gap-2'>
                              <CheckCircle className='h-4 w-4' />
                              <span>
                                Signed:{' '}
                                {format(new Date(contract.signedAt), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

