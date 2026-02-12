// src/features/clients/CreateCustomerPage.tsx
'use client';

import { UserContext } from '@/common/contexts/UserContext';
import {
  getQuickBooksCustomers,
  type QuickBooksCustomer,
} from '@/api/quickbooks/auth/customer';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Filter, Loader2, RefreshCw, Search } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function CreateCustomerPage() {
  const { user, isLoading: authLoading } = useContext(UserContext);
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<QuickBooksCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Admin guard
  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      toast.error('No permission.');
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  // Fetch QuickBooks customers on mount
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuickBooksCustomers();
      setCustomers(data);
    } catch (err: any) {
      const errorMessage =
        err.message || 'Failed to load customers from QuickBooks';
      setError(errorMessage);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchCustomers();
    }
  }, [authLoading, user]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return customers.filter((c) => {
      const nameMatch = !q || (c.DisplayName?.toLowerCase() ?? '').includes(q);
      const emailMatch =
        !q ||
        (c.PrimaryEmailAddr?.Address?.toLowerCase() ?? '').includes(q);
      if (!nameMatch && !emailMatch) return false;
      if (statusFilter === 'active' && !c.Active) return false;
      if (statusFilter === 'inactive' && c.Active !== false) return false;
      return true;
    });
  }, [customers, searchQuery, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const startItem = (currentPage - 1) * pageSize;
  const paginatedCustomers = useMemo(
    () => filteredCustomers.slice(startItem, startItem + pageSize),
    [filteredCustomers, startItem, pageSize]
  );

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  return (
    <div className='flex flex-col h-full min-h-0 overflow-hidden p-4'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between shrink-0'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Customers from QuickBooks
          </h1>
          <p className='text-muted-foreground mt-1'>
            QuickBooks Online customers synced to your account
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={fetchCustomers}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <RefreshCw className='h-4 w-4 mr-2' />
          )}
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className='shrink-0 mb-4 rounded-lg border bg-card p-4 shadow-sm'>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='flex items-center gap-2 min-w-[200px] flex-1'>
            <Filter className='h-4 w-4 text-muted-foreground shrink-0' />
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by name or email...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 h-9'
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[140px] h-9'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className='w-[110px] h-9 min-w-[110px]'>
                <SelectValue placeholder='Per page' />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-9'
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
        <p className='text-sm text-muted-foreground mt-2'>
          {filteredCustomers.length} of {customers.length} customer
          {customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content area - scrollable */}
      <div className='flex flex-col flex-1 min-h-0 rounded-xl border bg-card shadow-sm overflow-hidden'>
        {loading && (
          <div className='flex-1 flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground'>
            <Loader2 className='h-8 w-8 animate-spin' aria-hidden />
            <p className='text-sm font-medium'>Loading customers...</p>
          </div>
        )}

        {error && (
          <div className='flex-1 flex flex-col items-center justify-center p-8'>
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 max-w-md text-destructive'>
              <p className='font-medium'>Error</p>
              <p className='text-sm mt-1'>{error}</p>
              <div className='mt-3 flex gap-2'>
                {error.includes('not connected') && (
                  <Button
                    size='sm'
                    onClick={() => navigate('/integrations/quickbooks')}
                  >
                    Connect QuickBooks
                  </Button>
                )}
                <Button variant='outline' size='sm' onClick={fetchCustomers}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && customers.length === 0 && (
          <div className='flex-1 flex items-center justify-center p-8'>
            <div className='text-center max-w-md'>
              <div className='mx-auto mb-4 h-12 w-12 text-muted-foreground'>
                <svg
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  className='w-full h-full'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium mb-2'>No customers found</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                There are no customers in your QuickBooks account yet, or the
                endpoint is not available.
              </p>
              <Button onClick={fetchCustomers}>Refresh</Button>
            </div>
          </div>
        )}

        {!loading && !error && customers.length > 0 && filteredCustomers.length === 0 && (
          <div className='flex-1 flex items-center justify-center p-8 text-muted-foreground'>
            No customers match the current filters.
          </div>
        )}

        {!loading && !error && filteredCustomers.length > 0 && (
          <>
            <div className='overflow-auto flex-1 min-h-0'>
              <table className='min-w-full text-sm'>
                <thead className='sticky top-0 bg-muted/80 backdrop-blur z-10'>
                  <tr className='border-b'>
                    <th className='px-4 py-3 text-left font-semibold'>Name</th>
                    <th className='px-4 py-3 text-left font-semibold'>Email</th>
                    <th className='px-4 py-3 text-left font-semibold'>Phone</th>
                    <th className='px-4 py-3 text-right font-semibold'>Balance</th>
                    <th className='px-4 py-3 text-left font-semibold'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.Id}
                    className='border-b border-border/50 last:border-0 hover:bg-muted/30'
                  >
                    <td className='px-4 py-3'>{customer.DisplayName}</td>
                    <td className='px-4 py-3 text-muted-foreground'>
                      {customer.PrimaryEmailAddr?.Address || '—'}
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>
                      {customer.PrimaryPhone?.FreeFormNumber || '—'}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      {formatCurrency(customer.Balance)}
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          customer.Active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {customer.Active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className='shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-t bg-muted/30'>
            <p className='text-sm text-muted-foreground'>
              Showing {startItem + 1}–
              {Math.min(startItem + pageSize, filteredCustomers.length)} of{' '}
              {filteredCustomers.length}
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-8 w-8 p-0'
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-sm font-medium min-w-[80px] text-center'>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                className='h-8 w-8 p-0'
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </>
        )}
      </div>

      <ToastContainer position='top-right' newestOnTop closeOnClick />
    </div>
  );
}
