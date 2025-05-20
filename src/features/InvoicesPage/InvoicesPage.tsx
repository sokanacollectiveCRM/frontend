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
  InvoiceLineItem,
} from "../../api/quickbooks/auth/invoice";
import SubmitButton from "../../common/components/form/SubmitButton";
import { UserContext } from "../../common/contexts/UserContext";

// local shape for editing line-items
type LocalLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export default function InvoicesPage() {
  const { user, isLoading: authLoading } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  if (!authLoading && user?.role !== "admin") {
    toast.error("You do not have permission.");
    return null;
  }

  const openModal = useCallback(() => setShowModal(true), []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <SubmitButton onClick={openModal}>New Invoice</SubmitButton>
      </div>

      {/* your existing invoice table here… */}
      <CreateInvoiceModal
        open={showModal}
        onClose={() => setShowModal(false)}
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
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<InvoiceableCustomer | null>(null);
  const [lineItems, setLineItems] = useState<LocalLineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [memo, setMemo] = useState("");

  // fetch as soon as modal opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getInvoiceableCustomers()
      .then(setCustomers)
      .catch((err) => toast.error(`Could not load customers: ${err.message}`))
      .finally(() => setLoading(false));
  }, [open]);

  // filter by name/email
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
    setLineItems((cur) => [...cur, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeLine = (idx: number) =>
    setLineItems((cur) => cur.filter((_, i) => i !== idx));

  const total = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPrice,
    0
  );

  const onSubmit = async () => {
    if (!selected) {
      toast.error("Please select a customer.");
      return;
    }
    if (!dueDate) {
      toast.error("Please pick a due date.");
      return;
    }
    if (
      lineItems.some(
        (li) => !li.description || li.quantity < 1 || li.unitPrice < 0
      )
    ) {
      toast.error("Please complete all line items.");
      return;
    }

    const apiLines: InvoiceLineItem[] = lineItems.map((li) => ({
      DetailType: "SalesItemLineDetail",
      Amount: li.quantity * li.unitPrice,
      Description: li.description,
      SalesItemLineDetail: {
        // QuickBooks customer ID for the invoice
        ItemRef: { value:'19' },
        UnitPrice: li.unitPrice,
        Qty: li.quantity,
      },
    }));

    const params: CreateInvoiceParams = {
      internalCustomerId: selected.id, // your internal ID
      lineItems: apiLines,
      dueDate,
      memo,
    };

    try {
      const { invoiceId, status } = await createQuickBooksInvoice(params);
      toast.success(`Invoice ${invoiceId} created (${status}).`);
      onClose();
    } catch (err: any) {
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
          {loading ? (
            <div>Loading…</div>
          ) : selected ? (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div>
                <div className="font-semibold">{selected.name}</div>
                <div className="text-xs text-gray-500">{selected.email}</div>
              </div>
              <button
                className="text-red-500"
                onClick={() => setSelected(null)}
              >
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
                    <div className="px-3 py-2 text-gray-500">
                      No matches
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Line Items */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Line Items
          </label>
          <div className="space-y-2">
            {lineItems.map((li, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Description"
                  value={li.description}
                  onChange={(e) =>
                    changeLine(idx, "description", e.target.value)
                  }
                />
                <input
                  className="border rounded px-2 py-1 w-16"
                  type="number"
                  min={1}
                  value={li.quantity}
                  onChange={(e) =>
                    changeLine(idx, "quantity", Number(e.target.value))
                  }
                />
                <input
                  className="border rounded px-2 py-1 w-24"
                  type="number"
                  min={0}
                  value={li.unitPrice}
                  onChange={(e) =>
                    changeLine(idx, "unitPrice", Number(e.target.value))
                  }
                />
                <span className="w-20 text-right">
                  ${(li.quantity * li.unitPrice).toFixed(2)}
                </span>
                {lineItems.length > 1 && (
                  <button
                    className="text-red-500 text-xs"
                    onClick={() => removeLine(idx)}
                  >
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

        {/* Due & Memo */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Memo / Notes
          </label>
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
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <SubmitButton onClick={onSubmit}>Create Invoice</SubmitButton>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
