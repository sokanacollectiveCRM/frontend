import {
  getReconciliation,
  downloadReconciliationCsv,
  type ReconciliationRow,
  type ReconciliationSummary,
  type ReconciliationParams,
} from '@/api/financial/reconciliationApi';
import { UserContext } from '@/common/contexts/UserContext';
import { Button } from '@/common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Input } from '@/common/components/ui/input';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, Filter, Loader2 } from 'lucide-react';

const LIMIT_OPTIONS = [100, 500, 1000];
const PAGE_SIZES = [10, 25, 50, 100];
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
];

function formatDate(value: string | null | undefined): string {
  if (value == null || value === '') return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function MatchTypeBadge({ matchType }: { matchType: ReconciliationRow['match_type'] }) {
  const label = matchType === 'amount_and_customer' ? 'Amount + customer' : 'Amount only';
  const variant = matchType === 'amount_and_customer' ? 'default' : 'secondary';
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        variant === 'default' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}
    >
      {label}
    </span>
  );
}

function SummaryBlock({ summary }: { summary: ReconciliationSummary }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-muted-foreground mb-2">Invoice totals</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Pending amount</p>
          <p className="text-xl font-semibold mt-1">
            {summary.total_pending_amount != null ? formatAmount(summary.total_pending_amount) : '—'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Paid amount</p>
          <p className="text-xl font-semibold mt-1">
            {summary.total_paid_amount != null ? formatAmount(summary.total_paid_amount) : '—'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Pending count</p>
          <p className="text-xl font-semibold mt-1">
            {summary.total_pending_count != null ? summary.total_pending_count : '—'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Paid count</p>
          <p className="text-xl font-semibold mt-1">
            {summary.total_paid_count != null ? summary.total_paid_count : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

function MatchedPaymentsCell({ row }: { row: ReconciliationRow }) {
  const [expanded, setExpanded] = useState(false);
  const count = row.payment_ids.length;
  if (count === 0) return <span className="text-muted-foreground">—</span>;
  const lines = row.payment_ids.map((id, i) => ({
    id,
    customer: row.payment_customers[i] ?? '—',
    amount: row.payment_amounts[i],
    date: formatDate(row.payment_created_dates[i]),
  }));
  return (
    <div className="min-w-[140px]">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 text-left text-sm font-medium text-primary hover:underline"
      >
        {count} payment{count !== 1 ? 's' : ''}
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expanded && (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground border-l-2 pl-2">
          {lines.map((l) => (
            <li key={l.id}>
              <span className="font-mono">{l.id}</span> · {l.customer} · {formatAmount(l.amount)} · {l.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ReconciliationPage() {
  const { user, isLoading: authLoading } = useContext(UserContext);
  const [data, setData] = useState<ReconciliationRow[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  const [limit, setLimit] = useState(500);
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params: ReconciliationParams = {
    limit,
    ...(invoiceStatus && { invoice_status: invoiceStatus.trim().toLowerCase() }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReconciliation(params);
      setData(res.data);
      setSummary(res.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reconciliation');
      setData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [limit, invoiceStatus, dateFrom, dateTo]);

  useEffect(() => {
    if (!authLoading && (user?.role === 'admin' || user?.role === 'doula')) {
      fetchData();
    }
  }, [authLoading, user?.role, fetchData]);

  // Client-side filter: use invoice_status_raw for display values (PAID, PENDING, PARTIAL)
  const filtered = useMemo(() => {
    let list = [...data];
    if (invoiceStatus) {
      const statusNorm = invoiceStatus.trim().toUpperCase();
      list = list.filter((row) => {
        const raw = (row.invoice_status_raw ?? '').toString().trim().toUpperCase();
        const normalized = (row.invoice_status ?? '').toString().trim().toUpperCase();
        if (raw) return raw === statusNorm;
        return normalized === statusNorm;
      });
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter((row) => {
        const d = row.invoice_created_at || row.invoice_due_date;
        if (!d) return false;
        const rowDate = new Date(d);
        rowDate.setHours(0, 0, 0, 0);
        return rowDate >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((row) => {
        const d = row.invoice_created_at || row.invoice_due_date;
        if (!d) return false;
        const rowDate = new Date(d);
        rowDate.setHours(0, 0, 0, 0);
        return rowDate <= to;
      });
    }
    return list;
  }, [data, invoiceStatus, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startItem = (currentPage - 1) * pageSize;
  const paginatedItems = useMemo(
    () => filtered.slice(startItem, startItem + pageSize),
    [filtered, startItem, pageSize]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [limit, invoiceStatus, dateFrom, dateTo]);

  const hasActiveFilters = !!invoiceStatus || !!dateFrom || !!dateTo;

  const handleDownloadCsv = async () => {
    setCsvLoading(true);
    try {
      await downloadReconciliationCsv(params);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to download CSV');
    } finally {
      setCsvLoading(false);
    }
  };

  if (!authLoading && user?.role !== 'admin' && user?.role !== 'doula') {
    return (
      <div className="p-6">
        <p className="text-destructive">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reconciliation</h1>
          <p className="text-muted-foreground mt-1">
            Invoices ↔ payments by amount. Suggestions only; confirm and apply in a future step.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCsv}
          disabled={csvLoading}
        >
          {csvLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download CSV
        </Button>
      </div>

      {summary != null && <SummaryBlock summary={summary} />}

      {/* Filters bar - same layout as Financial page (Filter + left block, then dropdowns) */}
      <div className="shrink-0 mb-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 max-w-md flex items-center h-9 text-sm text-muted-foreground">
              {filtered.length === 0
                ? 'No invoice–payment matches for the current filters.'
                : `${filtered.length} match${filtered.length === 1 ? '' : 'es'} total`}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={invoiceStatus || 'all'} onValueChange={(v) => setInvoiceStatus(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Invoice status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value || 'all'} value={o.value || 'all'}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="h-9 w-[140px]"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Date from"
            />
            <Input
              type="date"
              className="h-9 w-[140px]"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Date to"
            />
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[110px] h-9 min-w-[110px]">
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
                  setInvoiceStatus('');
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchData}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0 rounded-xl border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            <p className="text-sm font-medium">Loading reconciliation…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
            No invoice–payment matches for the current filters.
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1 min-h-0">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-semibold">Invoice</th>
                    <th className="px-4 py-3 text-left font-semibold">Customer</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Invoice date</th>
                    <th className="px-4 py-3 text-left font-semibold">Due date</th>
                    <th className="px-4 py-3 text-left font-semibold">Match type</th>
                    <th className="px-4 py-3 text-left font-semibold">Matched payments</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((row) => (
                    <tr
                      key={row.invoice_id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium">{row.invoice_number}</span>
                        <span className="text-muted-foreground text-xs block">{row.invoice_id}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{row.invoice_customer || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatAmount(row.invoice_amount)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.invoice_status_raw != null && row.invoice_status_raw !== ''
                          ? row.invoice_status_raw
                          : (row.invoice_status || '—').toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(row.invoice_created_at)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(row.invoice_due_date)}
                      </td>
                      <td className="px-4 py-3">
                        <MatchTypeBadge matchType={row.match_type} />
                      </td>
                      <td className="px-4 py-3">
                        <MatchedPaymentsCell row={row} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination bar - same as Financial page */}
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

      <p className="text-xs text-muted-foreground mt-4 shrink-0">
        Data is from the backend reconciliation API (suggestions only). Confirm and apply to payments will be available in a future update.
      </p>
    </div>
  );
}
