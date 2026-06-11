import { ApiError } from '@/api/errors';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { getLimitedBillingContracts } from '@/features/billing-portal/billingPortalApi';
import {
  isActionRequiredForContract,
  openContractBillingOutreachEmail,
} from '@/features/billing-portal/billingOutreach';
import { BillingState } from '@/features/billing-portal/components/BillingState';
import { BillingStatusBadge } from '@/features/billing-portal/components/BillingStatusBadge';
import type { LimitedContractBillingSummary } from '@/features/billing-portal/types';
import { AlertTriangle, CalendarClock, CircleDollarSign, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type DueFilter = 'all' | 'upcoming' | 'past-due' | 'no-due-date';
type StatusFilter = 'all' | string;
type ResponsibilityFilter = 'all' | 'insurance' | 'client' | 'split' | 'unknown';
type PaymentMethodFilter = 'all' | 'card' | 'insurance' | 'ach' | 'invoice' | 'unknown';
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(value?: string | null): string {
  if (!value) return 'No due date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function normalizeDateOnly(value?: string | null): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getDueBucket(value?: string | null): DueFilter {
  const dueTime = normalizeDateOnly(value);
  if (dueTime == null) return 'no-due-date';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in14Days = new Date(today);
  in14Days.setDate(in14Days.getDate() + 14);

  if (dueTime < today.getTime()) return 'past-due';
  if (dueTime <= in14Days.getTime()) return 'upcoming';
  return 'all';
}

function normalizeLabel(value?: string | null): string {
  return (value || '').trim().toLowerCase();
}

function getResponsibilityBucket(contract: LimitedContractBillingSummary): ResponsibilityFilter {
  const responsibility = normalizeLabel(contract.billingResponsibility);
  const coverage = normalizeLabel(contract.insuranceCoverageType);
  const deductibleMethod = normalizeLabel(contract.deductiblePaymentMethod);
  const paymentMethod = normalizeLabel(contract.paymentMethodSummary);

  if (responsibility.includes('split') || responsibility.includes('shared')) return 'split';
  if (coverage.includes('insurance') && (deductibleMethod || paymentMethod.includes('card'))) {
    return 'split';
  }
  if (responsibility.includes('insurance') || coverage.includes('insurance')) return 'insurance';
  if (
    responsibility.includes('client') ||
    responsibility.includes('self-pay') ||
    paymentMethod.includes('card') ||
    paymentMethod.includes('ach')
  ) {
    return 'client';
  }
  return 'unknown';
}

function getPaymentMethodBucket(contract: LimitedContractBillingSummary): PaymentMethodFilter {
  const paymentMethod = normalizeLabel(contract.paymentMethodSummary);
  const deductibleMethod = normalizeLabel(contract.deductiblePaymentMethod);
  const combined = `${paymentMethod} ${deductibleMethod}`.trim();

  if (combined.includes('card') || combined.includes('credit')) return 'card';
  if (combined.includes('insurance')) return 'insurance';
  if (combined.includes('ach') || combined.includes('bank')) return 'ach';
  if (combined.includes('invoice')) return 'invoice';
  return 'unknown';
}

function formatBillingContext(contract: LimitedContractBillingSummary): string {
  const parts = [
    contract.billingResponsibility,
    contract.paymentMethodSummary,
    contract.insuranceCoverageType,
    contract.deductiblePaymentMethod
      ? `Deductible via ${contract.deductiblePaymentMethod}`
      : null,
  ].filter(Boolean);

  if (parts.length === 0) return 'Billing setup unavailable';
  return parts.join(' • ');
}

function BillingMetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className='rounded-xl border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-2 text-muted-foreground'>
        {icon}
        <span className='text-xs font-medium uppercase tracking-wide'>{label}</span>
      </div>
      <div className='mt-3 text-2xl font-semibold tracking-tight'>{value}</div>
    </div>
  );
}

export default function BillingContractsListPage() {
  const [contracts, setContracts] = useState<LimitedContractBillingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<'access-denied' | 'load-error' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dueFilter, setDueFilter] = useState<DueFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [responsibilityFilter, setResponsibilityFilter] =
    useState<ResponsibilityFilter>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState<PaymentMethodFilter>('all');
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    let active = true;

    const loadContracts = async () => {
      setIsLoading(true);
      setErrorState(null);

      try {
        const result = await getLimitedBillingContracts();
        if (!active) return;
        setContracts(result);
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError && error.status === 403) {
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

    void loadContracts();

    return () => {
      active = false;
    };
  }, []);

  const filteredContracts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return contracts.filter((contract) => {
      if (normalizedSearch) {
        const haystack = [
          contract.clientName,
          contract.contractType,
          contract.paymentSchedule,
          contract.contractId,
          contract.billingResponsibility,
          contract.paymentMethodSummary,
          contract.insuranceCoverageType,
          contract.deductiblePaymentMethod,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }

      if (statusFilter !== 'all' && contract.contractStatus !== statusFilter) {
        return false;
      }

      if (dueFilter !== 'all' && getDueBucket(contract.nextDueDate) !== dueFilter) {
        return false;
      }

      if (
        responsibilityFilter !== 'all' &&
        getResponsibilityBucket(contract) !== responsibilityFilter
      ) {
        return false;
      }

      if (
        paymentMethodFilter !== 'all' &&
        getPaymentMethodBucket(contract) !== paymentMethodFilter
      ) {
        return false;
      }

      return true;
    });
  }, [contracts, dueFilter, paymentMethodFilter, responsibilityFilter, searchTerm, statusFilter]);

  const uniqueStatuses = useMemo(
    () => Array.from(new Set(contracts.map((contract) => contract.contractStatus))).sort(),
    [contracts]
  );

  const metrics = useMemo(
    () => ({
      pastDue: contracts.filter((contract) => getDueBucket(contract.nextDueDate) === 'past-due').length,
      upcoming: contracts.filter((contract) => getDueBucket(contract.nextDueDate) === 'upcoming').length,
      missingDueDate: contracts.filter((contract) => getDueBucket(contract.nextDueDate) === 'no-due-date').length,
    }),
    [contracts]
  );

  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm, dueFilter, statusFilter, responsibilityFilter, paymentMethodFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / pageSize));
  const paginatedContracts = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredContracts.slice(start, start + pageSize);
  }, [filteredContracts, pageIndex, pageSize]);

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages]);

  if (isLoading) {
    return (
      <BillingState
        title='Loading payment schedules'
        description='Fetching limited billing contract information.'
      />
    );
  }

  if (errorState === 'access-denied') {
    return (
      <BillingState
        title='Access denied'
        description='You do not have permission to view billing contracts.'
      />
    );
  }

  if (errorState === 'load-error') {
    return (
      <BillingState
        title='Unable to load billing information'
        description='The billing contracts list could not be loaded.'
      />
    );
  }

  return (
    <div className='p-6 space-y-6 overflow-y-auto'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Payment Schedules</h1>
        <p className='text-muted-foreground'>
          Limited billing-safe contract and installment visibility for internal payment follow-up.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <BillingMetricCard
          icon={<AlertTriangle className='h-4 w-4 text-rose-600' />}
          label='Past due'
          value={metrics.pastDue}
        />
        <BillingMetricCard
          icon={<CalendarClock className='h-4 w-4 text-amber-600' />}
          label='Due in 14 days'
          value={metrics.upcoming}
        />
        <BillingMetricCard
          icon={<CircleDollarSign className='h-4 w-4 text-slate-600' />}
          label='Missing due date'
          value={metrics.missingDueDate}
        />
      </div>

      {contracts.length === 0 ? (
        <BillingState
          title='No contracts available'
          description='Payment schedules will appear here when billing-safe contracts are available.'
        />
      ) : (
        <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
          <div className='border-b p-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <div className='relative min-w-[240px] flex-1'>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder='Search client, contract, or schedule'
                  className='pl-9'
                />
              </div>
              <Select value={dueFilter} onValueChange={(value) => setDueFilter(value as DueFilter)}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Due timing' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All due timings</SelectItem>
                  <SelectItem value='upcoming'>Due in 14 days</SelectItem>
                  <SelectItem value='past-due'>Past due</SelectItem>
                  <SelectItem value='no-due-date'>No due date</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='Contract status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={responsibilityFilter}
                onValueChange={(value) =>
                  setResponsibilityFilter(value as ResponsibilityFilter)
                }
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Who is paying' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All payers</SelectItem>
                  <SelectItem value='insurance'>Insurance</SelectItem>
                  <SelectItem value='client'>Client / self-pay</SelectItem>
                  <SelectItem value='split'>Split insurance + client</SelectItem>
                  <SelectItem value='unknown'>Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={paymentMethodFilter}
                onValueChange={(value) =>
                  setPaymentMethodFilter(value as PaymentMethodFilter)
                }
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Payment method' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All methods</SelectItem>
                  <SelectItem value='card'>Card</SelectItem>
                  <SelectItem value='insurance'>Insurance billing</SelectItem>
                  <SelectItem value='ach'>ACH / bank</SelectItem>
                  <SelectItem value='invoice'>Invoice</SelectItem>
                  <SelectItem value='unknown'>Unavailable</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm ||
                dueFilter !== 'all' ||
                statusFilter !== 'all' ||
                responsibilityFilter !== 'all' ||
                paymentMethodFilter !== 'all') && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setSearchTerm('');
                    setDueFilter('all');
                    setStatusFilter('all');
                    setResponsibilityFilter('all');
                    setPaymentMethodFilter('all');
                    setPageIndex(0);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
            <p className='mt-3 text-sm text-muted-foreground'>
              {filteredContracts.length} of {contracts.length} payment schedules shown
            </p>
          </div>
          <table className='min-w-full text-sm'>
            <thead className='bg-muted/60'>
              <tr className='border-b'>
                <th className='px-4 py-3 text-left font-semibold'>Client</th>
                <th className='px-4 py-3 text-left font-semibold'>Contract</th>
                <th className='px-4 py-3 text-left font-semibold'>Billing setup</th>
                <th className='px-4 py-3 text-left font-semibold'>Status</th>
                <th className='px-4 py-3 text-right font-semibold'>Total</th>
                <th className='px-4 py-3 text-left font-semibold'>Schedule</th>
                <th className='px-4 py-3 text-left font-semibold'>Next due</th>
                <th className='px-4 py-3 text-left font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContracts.map((contract) => (
                <tr key={contract.contractId} className='border-b last:border-b-0'>
                  <td className='px-4 py-3'>{contract.clientName}</td>
                  <td className='px-4 py-3'>
                    <div className='font-medium'>{contract.contractType}</div>
                    <div className='text-xs text-muted-foreground'>
                      {contract.installmentCount ?? 0} installments
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='max-w-[280px] text-sm'>{formatBillingContext(contract)}</div>
                  </td>
                  <td className='px-4 py-3'>
                    <BillingStatusBadge value={contract.contractStatus} />
                  </td>
                  <td className='px-4 py-3 text-right'>{formatAmount(contract.totalAmount)}</td>
                  <td className='px-4 py-3'>{contract.paymentSchedule || 'Schedule unavailable'}</td>
                  <td className='px-4 py-3'>{formatDate(contract.nextDueDate)}</td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-wrap gap-2'>
                      <Button asChild variant='outline' size='sm'>
                        <Link to={`/billing/contracts/${contract.contractId}`}>View schedule</Link>
                      </Button>
                      <Button
                        type='button'
                        variant={isActionRequiredForContract(contract) ? 'default' : 'outline'}
                        size='sm'
                        disabled={!contract.clientEmail}
                        onClick={() => {
                          const opened = openContractBillingOutreachEmail(contract);
                          if (!opened) {
                            toast.error('Client email is unavailable for billing outreach.');
                          }
                        }}
                      >
                        Email client
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredContracts.length === 0 ? (
            <div className='border-t p-6 text-sm text-muted-foreground'>
              No payment schedules match the current filters.
            </div>
          ) : (
            <div className='flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <span>Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className='w-[88px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side='top'>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='text-sm text-muted-foreground'>
                Page {pageIndex + 1} of {totalPages}
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={pageIndex === 0}
                  onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={pageIndex >= totalPages - 1}
                  onClick={() =>
                    setPageIndex((current) => Math.min(totalPages - 1, current + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
