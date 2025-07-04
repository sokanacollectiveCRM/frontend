// src/features/invoices/InvoicesPage.tsx
import { useCallback, useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getInvoiceableCustomers,
  InvoiceableCustomer,
} from "../../api/quickbooks/auth/customer";
import {
  CreateInvoiceParams,
  createQuickBooksInvoice,
  getQuickBooksInvoices,
  InvoiceLineItem,
} from "../../api/quickbooks/auth/invoice";
import SubmitButton from "../../common/components/form/SubmitButton";
import { UserContext } from "../../common/contexts/UserContext";

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
  const [filteredInvoices, setFilteredInvoices] = useState<SavedInvoice[]>([]);
  const [customers, setCustomers] = useState<Record<string, InvoiceableCustomer>>({});
  const [loadingInv, setLoadingInv] = useState(false);
  const [loadingCust, setLoadingCust] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoadingCust(true);
    try {
      const data = await getInvoiceableCustomers();
      const customerMap = data.reduce((acc, customer) => {
        acc[customer.id] = customer;
        return acc;
      }, {} as Record<string, InvoiceableCustomer>);
      setCustomers(customerMap);
    } catch (err: any) {
      toast.error(`Could not load customers: ${err.message}`);
    } finally {
      setLoadingCust(false);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoadingInv(true);
    try {
      const data = await getQuickBooksInvoices();
      setInvoices(data);
    } catch (err: any) {
      toast.error(`Could not load invoices: ${err.message}`);
    } finally {
      setLoadingInv(false);
    }
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((inv) => {
        const customer = customers[inv.customer_id];
        const invoiceNumber = inv.doc_number || inv.id.split('-')[0];
        
        return (
          invoiceNumber.toLowerCase().includes(term) ||
          customer?.name.toLowerCase().includes(term) ||
          customer?.email.toLowerCase().includes(term) ||
          inv.memo.toLowerCase().includes(term)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => {
        if (statusFilter === "pending") {
          return inv.status === "pending" || inv.status === "open" || inv.status === "sent";
        }
        if (statusFilter === "paid") {
          return inv.status === "paid" || inv.status === "closed";
        }
        return inv.status === statusFilter;
      });
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter((inv) => 
        new Date(inv.created_at) >= new Date(dateFromFilter)
      );
    }
    if (dateToFilter) {
      filtered = filtered.filter((inv) => 
        new Date(inv.created_at) <= new Date(dateToFilter)
      );
    }

    setFilteredInvoices(filtered);
  }, [invoices, customers, searchTerm, statusFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      fetchInvoices();
      fetchCustomers();
    }
  }, [authLoading, user, fetchInvoices, fetchCustomers]);

  if (!authLoading && user?.role !== "admin") {
    toast.error("You do not have permission.");
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "paid" || statusLower === "closed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Paid
        </span>
      );
    }
    if (statusLower === "pending" || statusLower === "open" || statusLower === "sent") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <SubmitButton onClick={() => setShowModal(true)}>
          New Invoice
        </SubmitButton>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        {/* Search - Full Width */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by invoice #, customer name, email, or memo..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters - Horizontal Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>

          {/* Results Summary */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredInvoices.length} of {invoices.length}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl shadow border bg-white overflow-x-auto mb-6">
        {loadingInv || loadingCust ? (
          <div className="p-8 text-center">Loading…</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {invoices.length === 0 ? "No invoices found." : "No invoices match your search criteria."}
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-5 py-3 bg-gray-50 font-semibold text-left">Invoice #</th>
                <th className="px-5 py-3 bg-gray-50 font-semibold text-left">Customer</th>
                <th className="px-5 py-3 bg-gray-50 font-semibold text-center">Status</th>
                <th className="px-5 py-3 bg-gray-50 font-semibold text-center">Date</th>
                <th className="px-5 py-3 bg-gray-50 font-semibold text-center">Due Date</th>
                <th className="px-5 py-3 bg-gray-50 font-semibold text-right">Total</th>
                <th className="px-5 py-3 bg-gray-50 font-semibold text-left">Line Items</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv, idx) => {
                const customer = customers[inv.customer_id];
                const invoiceNumber = inv.doc_number || inv.id.split('-')[0];
                
                return (
                  <tr
                    key={inv.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-5 py-3 text-left font-medium">{invoiceNumber}</td>
                    <td className="px-5 py-3 text-left">
                      {customer ? (
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Unknown Customer</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-center">{inv.due_date}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      ${inv.total_amount?.toFixed(2) || 
                        inv.line_items
                          .filter(item => item.DetailType !== 'SubTotalLineDetail')
                          .reduce((sum, item) => sum + (item.Amount || 0), 0)
                          .toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-left">
                      <ul className="space-y-1">
                        {inv.line_items
                          .filter(item => item.DetailType === 'SalesItemLineDetail')
                          .map((li, i) => (
                            <li key={i}>
                              {li.Description ?? "Item"} × {li.SalesItemLineDetail?.Qty ?? 1} @ $
                              {li.SalesItemLineDetail?.UnitPrice?.toFixed(2) ?? '0.00'}
                            </li>
                          ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <CreateInvoiceModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          fetchInvoices();
        }}
      />

      <ToastContainer position="top-right" newestOnTop closeOnClick />
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
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<InvoiceableCustomer[]>([]);
  const [loadingCust, setLoadingCust] = useState(false);
  const [selected, setSelected] = useState<InvoiceableCustomer | null>(null);
  const [lineItems, setLineItems] = useState<LocalLineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [memo, setMemo] = useState("");

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
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  const removeLine = (idx: number) =>
    setLineItems((cur) => cur.filter((_, i) => i !== idx));

  const total = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPrice,
    0
  );

  const onSubmit = async () => {
    if (!selected) return toast.error("Please select a customer.");
    if (!dueDate) return toast.error("Please pick a due date.");
    if (
      lineItems.some(
        (li) => !li.description || li.quantity < 1 || li.unitPrice < 0
      )
    )
      return toast.error("Please complete all line items.");

    const apiLines: InvoiceLineItem[] = lineItems.map((li) => ({
      DetailType: "SalesItemLineDetail",
      Amount: li.quantity * li.unitPrice,
      Description: li.description,
      SalesItemLineDetail: {
        // replace '19' with your real service/item Id or let user choose
        ItemRef: { value: "19" },
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
      toast.success(`Invoice #${response.DocNumber} created for ${response.CustomerRef.name}`);
      onClose();
    } catch (err: any) {
      console.error('Invoice creation error:', err);
      toast.error(err.message || "Failed to create invoice");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Create Invoice</h2>

        {/* Customer */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customer</label>
          {loadingCust ? (
            <div>Loading…</div>
          ) : selected ? (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div>
                <div className="font-semibold">{selected.name}</div>
                <div className="text-xs text-gray-500">{selected.email}</div>
              </div>
              <button className="text-red-500" onClick={() => setSelected(null)}>
                ×
              </button>
            </div>
          ) : (
            <>
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <div className="border rounded bg-white mt-1 max-h-36 overflow-y-auto shadow">
                  {filtered.length ? (
                    filtered.map((c) => (
                      <div
                        key={c.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelected(c);
                          setSearch("");
                        }}
                      >
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">No matches</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Line Items */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Line Items</label>
          <div className="space-y-2">
            {lineItems.map((li, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Description"
                  value={li.description}
                  onChange={(e) => changeLine(idx, "description", e.target.value)}
                />
                <input
                  className="border rounded px-2 py-1 w-16"
                  type="number"
                  min={1}
                  value={li.quantity}
                  onChange={(e) => changeLine(idx, "quantity", Number(e.target.value))}
                />
                <input
                  className="border rounded px-2 py-1 w-24"
                  type="number"
                  min={0}
                  value={li.unitPrice}
                  onChange={(e) => changeLine(idx, "unitPrice", Number(e.target.value))}
                />
                <span className="w-20 text-right">${(li.quantity * li.unitPrice).toFixed(2)}</span>
                {lineItems.length > 1 && (
                  <button className="text-red-500 text-xs" onClick={() => removeLine(idx)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              className="mt-2 px-2 py-1 bg-blue-50 rounded text-xs hover:bg-blue-100"
              onClick={addLine}
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Memo */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Memo / Notes</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={2}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Optional notes"
          />
        </div>

        {/* Total & Actions */}
        <div className="flex justify-between items-center font-semibold mb-4">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>
            Cancel
          </button>
          <SubmitButton onClick={onSubmit}>Create Invoice</SubmitButton>
        </div>
      </div>
    </div>
  );
}
