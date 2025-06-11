import { getQuickBooksInvoices } from "@/api/quickbooks/auth/invoice";
import { UserContext } from "@/common/contexts/UserContext";
import PaymentForm from "@/components/PaymentForm";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useContext, useEffect, useState } from "react";

// Define the types for the invoice and line items
interface LineItem {
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
}

interface SavedInvoice {
  id: string;
  customer_id: string;
  doc_number?: string;
  line_items: LineItem[];
  due_date: string;
  memo: string;
  status: string;
  created_at: string;
  updated_at: string;
  total_amount?: number;
  balance?: number;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<SavedInvoice | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);

  useEffect(() => {
    async function fetchInvoices() {
      if (!user) return;
      try {
        const fetchedInvoices = await getQuickBooksInvoices();
        const userInvoices = fetchedInvoices.filter(
          (invoice) => invoice.customer_id === user.id
        );
        setInvoices(userInvoices);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    }

    fetchInvoices();
  }, [user]);

  const handlePayClick = (invoice: SavedInvoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Billing</h1>
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">Invoice #{invoice.doc_number}</p>
              <p>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
              <p>Total: ${invoice.total_amount?.toFixed(2)}</p>
              <p>Status: {invoice.status}</p>
            </div>
            <Button color="primary" onClick={() => handlePayClick(invoice)}>
              Pay
            </Button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        backdrop="opaque"
        classNames={{
          backdrop: "!bg-black/60",
          base: "!bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto my-16",
        }}
        placement="center"
        hideCloseButton={false}
      >
        <ModalContent>
          <ModalHeader className="text-lg font-bold">Pay Invoice</ModalHeader>
          <ModalBody>
            {selectedInvoice && (
              <div>
                <p className="mb-2">
                  <strong>Invoice:</strong> #{selectedInvoice.doc_number}
                </p>
                <p className="mb-4">
                  <strong>Amount:</strong> $
                  {selectedInvoice.total_amount?.toFixed(2)}
                </p>
                <PaymentForm amount={selectedInvoice.total_amount || 0} docNumber={selectedInvoice.doc_number} />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 