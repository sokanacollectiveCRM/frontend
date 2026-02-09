import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { toast } from 'sonner';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { supabase } from '@/lib/supabase';
import { buildUrl, fetchWithAuth } from '@/api/http';
import { CreditCard, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  status: string;
  description: string;
  contractId?: string;
  createdAt: string;
  paymentMethod?: string;
}

export default function ClientPaymentHistoryTab() {
  const { client } = useClientAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (client) {
      fetchPayments();
    }
  }, [client]);

  const fetchPayments = async () => {
    if (!client) return;

    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No session found');
      }

      // TODO: Replace with actual client payment history API endpoint
      // Example: GET /api/clients/me/payments
      try {
        const response = await fetchWithAuth(buildUrl('/api/clients/me/payments'), {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPayments(Array.isArray(data) ? data : data.payments || []);
        } else {
          // Endpoint doesn't exist yet or other error, show empty state
          setPayments([]);
        }
      } catch (fetchError) {
        // Network error or other issue, show empty state
        console.log('Payments endpoint not available:', fetchError);
        setPayments([]);
      }
    } catch (error: any) {
      console.log('Payments endpoint not available (this is expected if backend endpoint is not implemented yet)');
      // Silently handle errors - endpoint may not exist yet
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'succeeded' || statusLower === 'completed' || statusLower === 'paid') {
      return (
        <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'>
          <CheckCircle className='h-3 w-3' />
          Paid
        </span>
      );
    } else if (statusLower === 'pending') {
      return (
        <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700'>
          Pending
        </span>
      );
    } else if (statusLower === 'failed') {
      return (
        <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'>
          Failed
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

  const totalPaid = payments
    .filter((p) => p.status.toLowerCase() === 'succeeded' || p.status.toLowerCase() === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className='text-center py-12'>
              <CreditCard className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No payment history found</p>
              <p className='text-sm text-muted-foreground mt-2'>
                Your payment history will appear here once payments are processed.
              </p>
            </div>
          ) : (
            <>
              <div className='mb-6 p-4 bg-muted rounded-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Total Paid</p>
                    <p className='text-2xl font-bold'>${(totalPaid / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Total Payments</p>
                    <p className='text-2xl font-bold'>{payments.length}</p>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                {payments.map((payment) => (
                  <Card key={payment.id} className='border-l-4 border-l-primary'>
                    <CardContent className='pt-6'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-2 flex-1'>
                          <div className='flex items-center gap-3'>
                            <h3 className='text-lg font-semibold'>{payment.description}</h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          {payment.contractId && (
                            <p className='text-sm text-muted-foreground'>
                              Contract: {payment.contractId}
                            </p>
                          )}
                          <div className='flex items-center gap-4 mt-4'>
                            <div className='flex items-center gap-2'>
                              <DollarSign className='h-4 w-4 text-muted-foreground' />
                              <span className='font-semibold text-lg'>
                                ${((payment.amount || 0) / 100).toFixed(2)}
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4 text-muted-foreground' />
                              <span className='text-sm text-muted-foreground'>
                                {payment.createdAt
                                  ? format(new Date(payment.createdAt), 'MMM dd, yyyy')
                                  : 'N/A'}
                              </span>
                            </div>
                            {payment.paymentMethod && (
                              <div className='flex items-center gap-2'>
                                <CreditCard className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm text-muted-foreground'>
                                  {payment.paymentMethod}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

