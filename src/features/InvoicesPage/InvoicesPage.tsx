// src/features/invoices/InvoicesPage.tsx
import { getInvoicesList, type InvoiceRow } from '@/api/financial/invoicesApi';
import {
  getInvoiceableCustomers,
  InvoiceableCustomer,
} from '@/api/quickbooks/auth/customer';
import {
  CreateInvoiceParams,
  createQuickBooksInvoice,
  InvoiceLineItem,
} from '@/api/quickbooks/auth/invoice';
import SubmitButton from '@/common/components/form/SubmitButton';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { UserContext } from '@/common/contexts/UserContext';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, ChevronRight, Filter, Loader2, Search } from 'lucide-react';
import { InvoiceDetailModal, type InvoiceDetailData } from './InvoiceDetailModal';

const PAGE_SIZES = [10, 25, 50, 100];

/** Shorten invoice number for table display; full value shown in detail modal. */
function shortenInvoiceNumber(value: string): string {
  if (!value) return '—';
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}…`;
}

/** Unified row for table: from Cloud SQL (phi_invoices) or QuickBooks */
type DisplayInvoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  status: string;
  created_at: string;
  due_date: string;
  total: string;
  lineItems: React.ReactNode;
};

// Updated shape for rows from your `invoices` table
type SavedInvoice = {
  id: string;
  customer_id: string;
  doc_number?: string; // QuickBooks invoice number
  line_items: {
    Id?: string;
    Amount: number;
    LineNum?: number;
    DetailType: string;
    Description?: string;
    SalesItemLineDetail?: {
      Qty: number;
      ItemRef: {
        name: string;
        value: string;
      };
      UnitPrice: number;
    };
  }[];
  due_date: string;
  memo: string;
  status: string;
  created_at: string;
  updated_at: string;
  total_amount?: number; // Calculated or stored total
  balance?: number; // Outstanding balance
};

// QuickBooks API response type
interface QuickBooksInvoiceResponse {
  Id: string;
  DocNumber: string;
  CustomerRef: {
    value: string;
    name: string;
  };
  TotalAmt: number;
  Balance: number;
  DueDate: string;
  Line: Array<{
    Id?: string;
    Amount: number;
    Description?: string;
    DetailType: string;
    SalesItemLineDetail?: {
      ItemRef: {
        value: string;
        name: string;
      };
      UnitPrice: number;
      Qty: number;
    };
  }>;
}

// local form–item
type LocalLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export default function InvoicesPage() {
  const { user, isLoading: authLoading } = useContext(UserContext);
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [cloudInvoices, setCloudInvoices] = useState<InvoiceRow[]>([]);
  const [customers, setCustomers] = useState<
    Record<string, InvoiceableCustomer>
  >({});
  const [loadingInv, setLoadingInv] = useState(false);
  const [loadingCust, setLoadingCust] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<DisplayInvoice | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoadingCust(true);
    try {
      const data = await getInvoiceableCustomers();
      const customerMap = data.reduce(
        (acc, customer) => {
          acc[customer.id] = customer;
          return acc;
        },
        {} as Record<string, InvoiceableCustomer>
      );
      setCustomers(customerMap);
    } catch {
      setCustomers({});
    } finally {
      setLoadingCust(false);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoadingInv(true);
    try {
      const data = await getInvoicesList({ limit: 500 });
      setCloudInvoices(data);
      setInvoices([]);
    } catch (err: any) {
      toast.error(`Could not load invoices: ${err.message}`);
    } finally {
      setLoadingInv(false);
    }
  }, []);

  const formatDate = (value: string | undefined | null): string => {
    if (value == null || value === '' || value === '—') return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  const getDisplayStatusFromStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid' || s === 'closed') return 'paid';
    if (s === 'pending' || s === 'open' || s === 'sent') return 'pending';
    return 'other';
  };

  const displayList = useMemo((): DisplayInvoice[] => {
    if (cloudInvoices.length > 0) {
      return cloudInvoices.map((inv) => {
        const total =
          inv.paid_total_amount != null
            ? Number(inv.paid_total_amount)
            : inv.total_amount != null
              ? Number(inv.total_amount)
              : 0;
        return {
          id: String(inv.id),
          invoiceNumber: inv.invoice_number || String(inv.id),
          customerName: inv.client_name || inv.customer_name || '—',
          status: inv.status || '—',
          created_at: inv.created_at || '',
          due_date: inv.due_date || '—',
          total: total.toFixed(2),
          lineItems: '—',
        };
      });
    }
    return invoices.map((inv) => {
      const customer = customers[inv.customer_id];
      const total =
        inv.total_amount ??
        inv.line_items
          ?.filter((item) => item.DetailType !== 'SubTotalLineDetail')
          .reduce((sum, item) => sum + (item.Amount || 0), 0) ??
        0;
      return {
        id: inv.id,
        invoiceNumber: inv.doc_number || inv.id.split('-')[0],
        customerName: customer?.name ?? 'Unknown Customer',
        customerEmail: customer?.email,
        status: inv.status,
        created_at: inv.created_at,
        due_date: inv.due_date,
        total: typeof total === 'number' ? total.toFixed(2) : '0.00',
        lineItems: (
          <ul className="space-y-1">
            {inv.line_items
              ?.filter((item) => item.DetailType === 'SalesItemLineDetail')
              .map((li, i) => (
                <li key={i}>
                  {li.Description ?? 'Item'} × {li.SalesItemLineDetail?.Qty ?? 1} @ $
                  {li.SalesItemLineDetail?.UnitPrice?.toFixed(2) ?? '0.00'}
                </li>
              )) ?? null}
          </ul>
        ),
      };
    });
  }, [cloudInvoices, invoices, customers]);

  const filteredList = useMemo(() => {
    let list = [...displayList];
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(term) ||
          inv.customerName.toLowerCase().includes(term) ||
          (inv.customerEmail && inv.customerEmail.toLowerCase().includes(term))
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter(
        (inv) => getDisplayStatusFromStatus(inv.status) === statusFilter
      );
    }
    if (dateFromFilter) {
      list = list.filter(
        (inv) => new Date(inv.created_at) >= new Date(dateFromFilter)
      );
    }
    if (dateToFilter) {
      list = list.filter(
        (inv) => new Date(inv.created_at) <= new Date(dateToFilter)
      );
    }
    return list;
  }, [
    displayList,
    searchTerm,
    statusFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const startItem = (currentPage - 1) * pageSize;
  const paginatedItems = useMemo(
    () => filteredList.slice(startItem, startItem + pageSize),
    [filteredList, startItem, pageSize]
  );

  const invoiceStats = useMemo(() => {
    let totalAmount = 0;
    filteredList.forEach((inv) => {
      totalAmount += parseFloat(inv.total) || 0;
    });
    return { totalAmount, count: filteredList.length };
  }, [filteredList]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFromFilter, dateToFilter, pageSize]);

  const hasActiveFilters =
    searchTerm.trim() ||
    statusFilter !== 'all' ||
    dateFromFilter ||
    dateToFilter;

  useEffect(() => {
    if (!authLoading && (user?.role === 'admin' || user?.role === 'doula')) {
      fetchInvoices();
    }
  }, [authLoading, user, fetchInvoices]);

  useEffect(() => {
    if (showModal && user?.role === 'admin') {
      fetchCustomers();
    }
  }, [showModal, user?.role, fetchCustomers]);

  if (!authLoading && user?.role !== 'admin' && user?.role !== 'doula') {
    toast.error('You do not have permission.');
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'paid' || statusLower === 'closed') {
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
          Paid
        </span>
      );
    }
    if (
      statusLower === 'pending' ||
      statusLower === 'open' ||
      statusLower === 'sent'
    ) {
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
          Pending
        </span>
      );
    }
    return (
      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
        {status}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div className='flex flex-col p-4 min-h-0 overflow-auto'>
      <div className='shrink-0 flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold tracking-tight'>Invoices</h1>
        <SubmitButton onClick={() => setShowModal(true)}>
          New Invoice
        </SubmitButton>
      </div>

      {/* Summary stats at top */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4'>
        <div className='rounded-lg border bg-card p-4 shadow-sm'>
          <p className='text-xs font-medium text-muted-foreground'>Total amount</p>
          <p className='text-xl font-semibold mt-1'>
            {formatAmount(invoiceStats.totalAmount)}
          </p>
        </div>
        <div className='rounded-lg border bg-card p-4 shadow-sm'>
          <p className='text-xs font-medium text-muted-foreground'>Invoice count</p>
          <p className='text-xl font-semibold mt-1'>{invoiceStats.count}</p>
        </div>
      </div>

      {/* Filters bar - same style as Financial */}
      <div className='shrink-0 mb-4 rounded-lg border bg-card p-4 shadow-sm'>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='flex items-center gap-2 min-w-[200px] flex-1'>
            <Filter className='h-4 w-4 text-muted-foreground shrink-0' />
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                type='text'
                placeholder='Search by name, invoice #, or email...'
                className='pl-9 h-9'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className='w-[160px] h-9'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='paid'>Paid</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type='date'
              className='w-[140px] h-9'
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              placeholder='From'
            />
            <Input
              type='date'
              className='w-[140px] h-9'
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              placeholder='To'
            />
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className='w-[100px] h-9'>
                <SelectValue placeholder='Per page' />
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
                type='button'
                variant='outline'
                size='sm'
                className='h-9'
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
        <p className='mt-2 text-sm text-muted-foreground'>
          {filteredList.length === 0
            ? 'No invoices match your filters.'
            : `${filteredList.length} invoice${filteredList.length === 1 ? '' : 's'} total`}
          {displayList.length !== filteredList.length && hasActiveFilters && ` (filtered from ${displayList.length})`}
        </p>
      </div>

      {/* Table + Pagination - single card, scrollable body, fixed footer */}
      <div className='flex flex-col flex-1 min-h-0 rounded-xl border bg-card shadow-sm overflow-hidden'>
        {loadingInv || loadingCust ? (
          <div className='flex-1 flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground'>
            <Loader2 className='h-8 w-8 animate-spin' aria-hidden />
            <p className='text-sm font-medium'>Loading invoice data…</p>
            <p className='text-xs'>This may take a moment.</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className='flex-1 flex items-center justify-center p-8 text-muted-foreground'>
            {displayList.length === 0
              ? 'No invoices found.'
              : 'No invoices match your search or filters.'}
          </div>
        ) : (
          <>
            <div className='overflow-auto flex-1 min-h-0'>
              <table className='min-w-full text-sm'>
                <thead className='sticky top-0 bg-muted/80 backdrop-blur z-10'>
                  <tr className='border-b'>
                    <th className='px-4 py-3 text-left font-semibold'>Invoice #</th>
                    <th className='px-4 py-3 text-left font-semibold'>Customer</th>
                    <th className='px-4 py-3 text-center font-semibold'>Status</th>
                    <th className='px-4 py-3 text-center font-semibold'>Date</th>
                    <th className='px-4 py-3 text-center font-semibold'>Due Date</th>
                    <th className='px-4 py-3 text-right font-semibold'>Total</th>
                    <th className='px-4 py-3 text-left font-semibold'>Line Items</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((inv, idx) => (
                    <tr
                      key={inv.id}
                      role="button"
                      tabIndex={0}
                      className='border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer'
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setDetailModalOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedInvoice(inv);
                          setDetailModalOpen(true);
                        }
                      }}
                    >
                      <td className='px-4 py-3 font-medium' title={inv.invoiceNumber}>
                        {shortenInvoiceNumber(inv.invoiceNumber)}
                      </td>
                      <td className='px-4 py-3'>
                        <div>
                          <div className='font-medium'>{inv.customerName}</div>
                          {inv.customerEmail && (
                            <div className='text-xs text-muted-foreground'>{inv.customerEmail}</div>
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-center'>{getStatusBadge(inv.status)}</td>
                      <td className='px-4 py-3 text-center text-muted-foreground'>
                        {formatDate(inv.created_at)}
                      </td>
                      <td className='px-4 py-3 text-center text-muted-foreground'>
                        {formatDate(inv.due_date)}
                      </td>
                      <td className='px-4 py-3 text-right font-medium'>${inv.total}</td>
                      <td className='px-4 py-3 text-muted-foreground'>{inv.lineItems}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-t bg-muted/30'>
              <p className='text-sm text-muted-foreground'>
                Showing {startItem + 1}–{Math.min(startItem + pageSize, filteredList.length)} of {filteredList.length}
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateInvoiceModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          fetchInvoices();
        }}
      />

      <InvoiceDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        invoice={
          selectedInvoice
            ? {
                id: selectedInvoice.id,
                invoiceNumber: selectedInvoice.invoiceNumber,
                customerName: selectedInvoice.customerName,
                customerEmail: selectedInvoice.customerEmail,
                status: selectedInvoice.status,
                created_at: selectedInvoice.created_at,
                due_date: selectedInvoice.due_date,
                total: selectedInvoice.total,
              }
            : null
        }
        onSave={() => {}}
      />

      <ToastContainer position='top-right' newestOnTop closeOnClick />
    </div>
  );
}

function CreateInvoiceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<InvoiceableCustomer[]>([]);
  const [loadingCust, setLoadingCust] = useState(false);
  const [selected, setSelected] = useState<InvoiceableCustomer | null>(null);
  const [lineItems, setLineItems] = useState<LocalLineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [dueDate, setDueDate] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoadingCust(true);
    getInvoiceableCustomers()
      .then(setCustomers)
      .catch((err) => toast.error(`Could not load customers: ${err.message}`))
      .finally(() => setLoadingCust(false));
  }, [open]);

  const filtered = search
    ? customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    )
    : customers;

  const changeLine = (
    idx: number,
    key: keyof LocalLineItem,
    value: string | number
  ) =>
    setLineItems((cur) =>
      cur.map((li, i) => (i === idx ? { ...li, [key]: value } : li))
    );
  const addLine = () =>
    setLineItems((cur) => [
      ...cur,
      { description: '', quantity: 1, unitPrice: 0 },
    ]);
  const removeLine = (idx: number) =>
    setLineItems((cur) => cur.filter((_, i) => i !== idx));

  const total = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPrice,
    0
  );

  const onSubmit = async () => {
    if (!selected) return toast.error('Please select a customer.');
    if (!dueDate) return toast.error('Please pick a due date.');
    if (
      lineItems.some(
        (li) => !li.description || li.quantity < 1 || li.unitPrice < 0
      )
    )
      return toast.error('Please complete all line items.');

    const apiLines: InvoiceLineItem[] = lineItems.map((li) => ({
      DetailType: 'SalesItemLineDetail',
      Amount: li.quantity * li.unitPrice,
      Description: li.description,
      SalesItemLineDetail: {
        // replace '19' with your real service/item Id or let user choose
        ItemRef: { value: '19' },
        UnitPrice: li.unitPrice,
        Qty: li.quantity,
      },
    }));

    const params: CreateInvoiceParams = {
      internalCustomerId: selected.id,
      lineItems: apiLines,
      dueDate,
      memo,
    };

    try {
      const response = await createQuickBooksInvoice(params);
      toast.success(
        `Invoice #${response.DocNumber} created for ${response.CustomerRef.name}`
      );
      onClose();
    } catch (err: any) {
      console.error('Invoice creation error:', err);
      toast.error(err.message || 'Failed to create invoice');
    }
  };

  if (!open) return null;
  return (
    <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-lg'>
        <h2 className='text-xl font-bold mb-4'>Create Invoice</h2>

        {/* Customer */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Customer</label>
          {loadingCust ? (
            <div>Loading…</div>
          ) : selected ? (
            <div className='flex items-center justify-between bg-gray-50 p-2 rounded'>
              <div>
                <div className='font-semibold'>{selected.name}</div>
                <div className='text-xs text-gray-500'>{selected.email}</div>
              </div>
              <button
                className='text-red-500'
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <input
                className='border rounded px-3 py-2 w-full'
                placeholder='Search name or email…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <div className='border rounded bg-white mt-1 max-h-36 overflow-y-auto shadow'>
                  {filtered.length ? (
                    filtered.map((c) => (
                      <div
                        key={c.id}
                        className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
                        onClick={() => {
                          setSelected(c);
                          setSearch('');
                        }}
                      >
                        <div className='font-semibold'>{c.name}</div>
                        <div className='text-xs text-gray-500'>{c.email}</div>
                      </div>
                    ))
                  ) : (
                    <div className='px-3 py-2 text-gray-500'>No matches</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Line Items */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Line Items</label>
          <div className='space-y-2'>
            {lineItems.map((li, idx) => (
              <div key={idx} className='flex gap-2 items-end'>
                <input
                  className='border rounded px-2 py-1 flex-1'
                  placeholder='Description'
                  value={li.description}
                  onChange={(e) =>
                    changeLine(idx, 'description', e.target.value)
                  }
                />
                <input
                  className='border rounded px-2 py-1 w-16'
                  type='number'
                  min={1}
                  value={li.quantity}
                  onChange={(e) =>
                    changeLine(idx, 'quantity', Number(e.target.value))
                  }
                />
                <input
                  className='border rounded px-2 py-1 w-24'
                  type='number'
                  min={0}
                  value={li.unitPrice}
                  onChange={(e) =>
                    changeLine(idx, 'unitPrice', Number(e.target.value))
                  }
                />
                <span className='w-20 text-right'>
                  ${(li.quantity * li.unitPrice).toFixed(2)}
                </span>
                {lineItems.length > 1 && (
                  <button
                    className='text-red-500 text-xs'
                    onClick={() => removeLine(idx)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              className='mt-2 px-2 py-1 bg-blue-50 rounded text-xs hover:bg-blue-100'
              onClick={addLine}
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* Due Date */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Due Date</label>
          <input
            type='date'
            className='border rounded px-3 py-2 w-full'
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Memo */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Memo / Notes</label>
          <textarea
            className='border rounded px-3 py-2 w-full'
            rows={2}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder='Optional notes'
          />
        </div>

        {/* Total & Actions */}
        <div className='flex justify-between items-center font-semibold mb-4'>
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className='flex justify-end gap-2'>
          <button
            className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
            onClick={onClose}
          >
            Cancel
          </button>
          <SubmitButton onClick={onSubmit}>Create Invoice</SubmitButton>
        </div>
      </div>
    </div>
  );
}
