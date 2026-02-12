import { getPaymentsList, PaymentRow } from '@/api/financial/paymentsApi';
import { UserContext } from '@/common/contexts/UserContext';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Loader2, Search } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Input } from '@/common/components/ui/input';

const PAGE_SIZES = [10, 25, 50, 100];

function formatAmount(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function getDisplayStatus(p: PaymentRow): string {
  const s = (p.status || '').toLowerCase();
  if (s === 'succeeded' || s === 'completed' || s === 'paid') return 'succeeded';
  if (s === 'pending' || s === 'processing') return 'pending';
  if (s === 'failed' || s === 'cancelled') return 'failed';
  if (s === 'refunded') return 'refunded';
  return 'other';
}

function getDisplayType(p: PaymentRow): string {
  const t = (p.payment_type || p.type || '').toLowerCase() || 'payment';
  return t;
}

function getClientName(p: PaymentRow): string {
  return (p.client_name || p.customer_name || (p as Record<string, unknown>).client_name as string) || '—';
}

export default function FinancialPage() {
  const { user, isLoading: authLoading } = useContext(UserContext);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      setLoadingPayments(true);
      getPaymentsList()
        .then(setPayments)
        .finally(() => setLoadingPayments(false));
    }
  }, [authLoading, user?.role]);

  const filtered = useMemo(() => {
    let list = [...payments];

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(
        (p) =>
          getClientName(p).toLowerCase().includes(term) ||
          (p.description && String(p.description).toLowerCase().includes(term)) ||
          (p.contract_id && String(p.contract_id).toLowerCase().includes(term)) ||
          (p.invoice && String(p.invoice).toLowerCase().includes(term)) ||
          (p.invoice_id && String(p.invoice_id).toLowerCase().includes(term))
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter((p) => getDisplayStatus(p) === categoryFilter);
    }

    if (typeFilter !== 'all') {
      list = list.filter((p) => getDisplayType(p) === typeFilter);
    }

    return list;
  }, [payments, searchTerm, categoryFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startItem = (currentPage - 1) * pageSize;
  const paginatedItems = useMemo(
    () => filtered.slice(startItem, startItem + pageSize),
    [filtered, startItem, pageSize]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, typeFilter, pageSize]);

  const uniqueTypes = useMemo(() => {
    const set = new Set<string>();
    payments.forEach((p) => {
      const t = getDisplayType(p);
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [payments]);

  const hasActiveFilters = searchTerm.trim() || categoryFilter !== 'all' || typeFilter !== 'all';

  if (!authLoading && user?.role !== 'admin') {
    return (
      <div className="p-6">
        <p className="text-destructive">You do not have permission to view this page.</p>
      </div>
    );
  }

  const totalAmount = useMemo(() => {
    const sum = filtered.reduce(
      (acc, p) => acc + (Number(p.amount) || 0),
      0
    );
    return sum;
  }, [filtered]);

  return (
    <div className="flex flex-col p-4 min-h-0 overflow-auto">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Payments by status and category from the payments table
          </p>
        </div>
      </div>

      {/* Summary stats at top */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total amount</p>
          <p className="text-xl font-semibold mt-1">{formatAmount(totalAmount)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Payment count</p>
          <p className="text-xl font-semibold mt-1">{filtered.length}</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="shrink-0 mb-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, description, contract, or invoice..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="succeeded">Succeeded / Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {uniqueTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtered.length === 0
            ? 'No payments match your filters.'
            : `${filtered.length} payment${filtered.length === 1 ? '' : 's'} total`}
          {payments.length !== filtered.length && hasActiveFilters && ` (filtered from ${payments.length})`}
        </p>
      </div>

      {/* Table + Pagination */}
      <div className="flex flex-col flex-1 min-h-0 rounded-xl border bg-card shadow-sm overflow-hidden">
        {loadingPayments ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            <p className="text-sm font-medium">Loading financial data…</p>
            <p className="text-xs">This may take a moment.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
            {payments.length === 0
              ? 'No payment data yet. Data will appear when the payments table API is available.'
              : 'No payments match your filters.'}
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1 min-h-0">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Client / Customer</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold">Invoice</th>
                    <th className="px-4 py-3 text-left font-semibold">Contract</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((p) => (
                    <tr
                      key={String(p.id)}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium">{getClientName(p)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {getDisplayType(p).replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${Number(p.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                        {p.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.invoice ?? p.invoice_id ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.contract_id || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination bar - always visible at bottom of card */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Showing {startItem + 1}–{Math.min(startItem + pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[80px] text-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
