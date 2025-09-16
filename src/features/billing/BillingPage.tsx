import { getQuickBooksInvoices } from '@/api/quickbooks/auth/invoice';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/components/ui/tabs';
import { UserContext } from '@/common/contexts/UserContext';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { useContext, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChargeCustomer from './components/ChargeCustomer';

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
  const { user, isLoading: userLoading } = useContext(UserContext);

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
        console.error('Failed to fetch invoices:', error);
      }
    }

    fetchInvoices();
  }, [user]);

  const handlePayClick = (invoice: SavedInvoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  if (userLoading) {
    return (
      <div className='p-8'>
        <div className='flex items-center justify-center py-8'>
          <div className='text-lg'>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='p-8'>
        <div className='flex items-center justify-center py-8'>
          <div className='text-lg text-red-600'>
            Please log in to access billing
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold tracking-tight mb-6'>Billing</h1>

      <Tabs defaultValue={isAdmin ? 'charge' : 'invoices'} className='w-full'>
        <TabsList
          className={`grid w-full ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          <TabsTrigger value='invoices'>My Invoices</TabsTrigger>
          {isAdmin && <TabsTrigger value='charge'>Charge Customer</TabsTrigger>}
        </TabsList>

        <TabsContent value='invoices' className='mt-6'>
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Your Invoices</h2>
            {invoices.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                No invoices found
              </div>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className='p-4 border rounded-lg shadow-sm flex justify-between items-center'
                >
                  <div>
                    <p className='font-semibold'>
                      Invoice #{invoice.doc_number}
                    </p>
                    <p>
                      Due Date:{' '}
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                    <p>Total: ${invoice.total_amount?.toFixed(2)}</p>
                    <p>Status: {invoice.status}</p>
                  </div>
                  <Button
                    color='primary'
                    onClick={() => handlePayClick(invoice)}
                  >
                    Pay
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value='charge' className='mt-6'>
            <ChargeCustomer />
          </TabsContent>
        )}
      </Tabs>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        backdrop='opaque'
        classNames={{
          backdrop: '!bg-black/60',
          base: '!bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto my-16',
        }}
        placement='center'
        hideCloseButton={false}
      >
        <ModalContent>
          <ModalHeader className='text-lg font-bold'>Pay Invoice</ModalHeader>
          <ModalBody>
            {selectedInvoice && (
              <div>
                <p className='mb-2'>
                  <strong>Invoice:</strong> #{selectedInvoice.doc_number}
                </p>
                <p className='mb-4'>
                  <strong>Amount:</strong> $
                  {selectedInvoice.total_amount?.toFixed(2)}
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Invoice payment functionality is not yet implemented.
                    Please contact support for payment processing.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
