import { UserContext } from '@/common/contexts/UserContext';
import { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChargeCustomer from './components/ChargeCustomer';

export default function BillingPage() {
  const { user, isLoading: userLoading } = useContext(UserContext);

  if (userLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">
            Please log in to access billing
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">
            You do not have permission to access billing.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Billing</h1>
      <ChargeCustomer />
      <ToastContainer
        position="top-right"
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
