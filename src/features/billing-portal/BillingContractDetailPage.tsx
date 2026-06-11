import { ApiError } from '@/api/errors';
import { Button } from '@/common/components/ui/button';
import { getLimitedContractPaymentSchedule } from '@/features/billing-portal/billingPortalApi';
import {
  isActionRequiredForInstallment,
  openBillingOutreachEmail,
  openContractBillingOutreachEmail,
} from '@/features/billing-portal/billingOutreach';
import { BillingState } from '@/features/billing-portal/components/BillingState';
import { BillingStatusBadge } from '@/features/billing-portal/components/BillingStatusBadge';
import type { LimitedContractPaymentSchedule } from '@/features/billing-portal/types';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

function formatAmount(value?: number | null): string {
  if (value == null) return 'Not available';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(value?: string | null): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatBillingSetup(contract: LimitedContractPaymentSchedule): string[] {
  return [
    contract.billingResponsibility,
    contract.paymentMethodSummary,
    contract.insuranceCoverageType,
    contract.deductiblePaymentMethod
      ? `Deductible via ${contract.deductiblePaymentMethod}`
      : null,
  ].filter(Boolean) as string[];
}

function BillingOverviewCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-xl border bg-card p-4 shadow-sm'>
      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>{label}</p>
      <p className='mt-2 text-lg font-semibold'>{value}</p>
    </div>
  );
}

export default function BillingContractDetailPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const [contract, setContract] = useState<LimitedContractPaymentSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<
    'not-found' | 'access-denied' | 'load-error' | null
  >(null);

  useEffect(() => {
    if (!contractId) {
      setIsLoading(false);
      setErrorState('not-found');
      return;
    }

    let active = true;

    const loadContract = async () => {
      setIsLoading(true);
      setErrorState(null);

      try {
        const result = await getLimitedContractPaymentSchedule(contractId);
        if (!active) return;
        setContract(result);
      } catch (error) {
        if (!active) return;

        if (error instanceof ApiError && error.status === 404) {
          setErrorState('not-found');
        } else if (error instanceof ApiError && error.status === 403) {
          setErrorState('access-denied');
        } else {
          setErrorState('load-error');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadContract();

    return () => {
      active = false;
    };
  }, [contractId]);

  if (isLoading) {
    return (
      <BillingState
        title='Loading payment schedule'
        description='Fetching contract and installment details.'
      />
    );
  }

  if (errorState === 'not-found') {
    return (
      <BillingState
        title='Payment schedule not found'
        description='The requested contract could not be found in the billing-safe view.'
      />
    );
  }

  if (errorState === 'access-denied') {
    return (
      <BillingState
        title='Access denied'
        description='You do not have permission to view this contract payment schedule.'
      />
    );
  }

  if (errorState === 'load-error' || !contract) {
    return (
      <BillingState
        title='Unable to load billing information'
        description='The contract payment schedule could not be loaded.'
      />
    );
  }

  return (
    <div className='p-6 space-y-6 overflow-y-auto'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='space-y-2'>
          <Button asChild variant='outline' size='sm'>
            <Link to='/billing/contracts'>Back to contracts</Link>
          </Button>
          <h1 className='text-3xl font-bold tracking-tight'>{contract.clientName}</h1>
          <div className='flex flex-wrap items-center gap-3'>
            <span className='text-muted-foreground'>{contract.contractType}</span>
            <BillingStatusBadge value={contract.contractStatus} />
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              const opened = openContractBillingOutreachEmail(contract);
              if (!opened) {
                toast.error('Client email is unavailable for billing outreach.');
              }
            }}
            disabled={!contract.clientEmail}
          >
            Email client
          </Button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <BillingOverviewCard label='Contract total' value={formatAmount(contract.totalAmount)} />
        <BillingOverviewCard label='Deposit amount' value={formatAmount(contract.depositAmount)} />
        <BillingOverviewCard
          label='Installments'
          value={String(contract.installmentCount ?? contract.installments.length)}
        />
        <BillingOverviewCard
          label='Payment schedule'
          value={contract.paymentSchedule || 'Payment schedule unavailable'}
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <div className='rounded-xl border bg-card p-5 shadow-sm space-y-4'>
          <h2 className='text-lg font-semibold'>Billing summary</h2>
          <dl className='grid gap-3 sm:grid-cols-2'>
            <div>
              <dt className='text-xs uppercase tracking-wide text-muted-foreground'>Invoice status</dt>
              <dd className='mt-1'>
                {contract.invoiceStatus ? (
                  <BillingStatusBadge value={contract.invoiceStatus} />
                ) : (
                  <span className='text-sm text-muted-foreground'>No invoice connected</span>
                )}
              </dd>
            </div>
            <div>
              <dt className='text-xs uppercase tracking-wide text-muted-foreground'>QuickBooks sync</dt>
              <dd className='mt-1'>
                {contract.quickBooksSyncStatus ? (
                  <BillingStatusBadge value={contract.quickBooksSyncStatus} />
                ) : (
                  <span className='text-sm text-muted-foreground'>QuickBooks sync unavailable</span>
                )}
              </dd>
            </div>
            <div>
              <dt className='text-xs uppercase tracking-wide text-muted-foreground'>Billing setup</dt>
              <dd className='mt-1 text-sm'>
                {formatBillingSetup(contract).length > 0
                  ? formatBillingSetup(contract).join(' • ')
                  : 'Billing setup unavailable'}
              </dd>
            </div>
            <div>
              <dt className='text-xs uppercase tracking-wide text-muted-foreground'>Created</dt>
              <dd className='mt-1 text-sm'>{formatDate(contract.createdAt)}</dd>
            </div>
            <div>
              <dt className='text-xs uppercase tracking-wide text-muted-foreground'>Sent</dt>
              <dd className='mt-1 text-sm'>{formatDate(contract.sentAt)}</dd>
            </div>
            <div>
              <dt className='text-xs uppercase tracking-wide text-muted-foreground'>Signed</dt>
              <dd className='mt-1 text-sm'>{formatDate(contract.signedAt)}</dd>
            </div>
            <div>
              <dt className='text-xs uppercase tracking-wide text-muted-foreground'>Limited view URL</dt>
              <dd className='mt-1 text-sm break-all'>{contract.limitedViewUrl || 'Generated from route'}</dd>
            </div>
          </dl>
        </div>

        <div className='rounded-xl border bg-card p-5 shadow-sm space-y-3'>
          <h2 className='text-lg font-semibold'>Visible fields</h2>
          <p className='text-sm text-muted-foreground'>
            This billing workspace intentionally excludes CRM intake, care notes, doula assignment data,
            demographics, and full client profile details.
          </p>
        </div>
      </div>

      <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
        <div className='border-b px-5 py-4'>
          <h2 className='text-lg font-semibold'>Installments</h2>
          <p className='text-sm text-muted-foreground'>
            Due dates, invoice references, and payment status only.
          </p>
        </div>

        {contract.installments.length === 0 ? (
          <div className='p-6 text-sm text-muted-foreground'>No installments available.</div>
        ) : (
          <table className='min-w-full text-sm'>
            <thead className='bg-muted/60'>
              <tr className='border-b'>
                <th className='px-4 py-3 text-left font-semibold'>Installment</th>
                <th className='px-4 py-3 text-left font-semibold'>Due date</th>
                <th className='px-4 py-3 text-right font-semibold'>Amount</th>
                <th className='px-4 py-3 text-left font-semibold'>Payment status</th>
                <th className='px-4 py-3 text-left font-semibold'>Paid date</th>
                <th className='px-4 py-3 text-left font-semibold'>Invoice</th>
                <th className='px-4 py-3 text-left font-semibold'>Action</th>
              </tr>
            </thead>
            <tbody>
              {contract.installments.map((installment) => (
                <tr key={`${installment.installmentNumber}-${installment.dueDate}`} className='border-b last:border-b-0'>
                  <td className='px-4 py-3'>#{installment.installmentNumber}</td>
                  <td className='px-4 py-3'>{formatDate(installment.dueDate)}</td>
                  <td className='px-4 py-3 text-right'>{formatAmount(installment.amount)}</td>
                  <td className='px-4 py-3'>
                    <BillingStatusBadge value={installment.status} />
                  </td>
                  <td className='px-4 py-3'>{formatDate(installment.paidDate)}</td>
                  <td className='px-4 py-3'>
                    <div className='space-y-1'>
                      <div>{installment.invoiceId || 'No invoice connected'}</div>
                      {installment.invoiceStatus ? (
                        <BillingStatusBadge value={installment.invoiceStatus} />
                      ) : null}
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <Button
                      type='button'
                      variant={isActionRequiredForInstallment(installment) ? 'default' : 'outline'}
                      size='sm'
                      disabled={!contract.clientEmail}
                      onClick={() => {
                        const opened = openBillingOutreachEmail({
                          clientName: contract.clientName,
                          clientEmail: contract.clientEmail,
                          contractType: contract.contractType,
                          contractId: contract.contractId,
                          amount: installment.amount,
                          dueDate: installment.dueDate,
                          issueType: installment.paymentIssueType ?? installment.status,
                          issueSummary: installment.paymentIssueSummary,
                          installmentNumber: installment.installmentNumber,
                        });
                        if (!opened) {
                          toast.error('Client email is unavailable for billing outreach.');
                        }
                      }}
                    >
                      Email client
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
