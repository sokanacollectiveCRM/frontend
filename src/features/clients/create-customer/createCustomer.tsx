// src/features/clients/CreateCustomerPage.tsx
'use client';

import { UserContext } from '@/common/contexts/UserContext';
import {
  getQuickBooksCustomers,
  type QuickBooksCustomer,
} from '@/api/quickbooks/auth/customer';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateCustomerPage() {
  const { user, isLoading: authLoading } = useContext(UserContext);
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<QuickBooksCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };


  return (
    <div className='min-h-screen flex items-start justify-center bg-white px-4 pt-8'>
      <section className='max-w-4xl w-full text-gray-900'>
        <h1 className='text-3xl font-bold text-center mb-4'>Customers</h1>

        <div className='overflow-x-auto'>
          {loading && (
            <div className='flex justify-center items-center p-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
              <span className='ml-2 text-gray-600'>
                Loading customers...
              </span>
            </div>
          )}

          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
              <p className='text-red-600 mb-2'>{error}</p>
              {error.includes('not connected') && (
                <button
                  onClick={() => navigate('/integrations/quickbooks')}
                  className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2'
                >
                  Connect QuickBooks
                </button>
              )}
              <button
                onClick={fetchCustomers}
                className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && customers.length === 0 && (
            <div className='text-center p-8 bg-white rounded-lg border border-gray-200'>
              <div className='max-w-md mx-auto'>
                <div className='mb-4'>
                  <svg
                    className='mx-auto h-12 w-12 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No customers found
                </h3>
                <p className='text-sm text-gray-500 mb-4'>
                  There are no customers in your QuickBooks account yet, or the
                  endpoint is not available.
                </p>
                <button
                  onClick={fetchCustomers}
                  className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          {!loading && !error && customers.length > 0 && (
            <>
              <table className='min-w-full table-auto border-collapse'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='px-4 py-2 text-left'>Name</th>
                    <th className='px-4 py-2 text-left'>Email</th>
                    <th className='px-4 py-2 text-left'>Phone</th>
                    <th className='px-4 py-2 text-left'>Balance</th>
                    <th className='px-4 py-2 text-left'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.Id} className='border-t hover:bg-gray-50'>
                      <td className='px-4 py-3 text-gray-900'>
                        {customer.DisplayName}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-600'>
                        {customer.PrimaryEmailAddr?.Address || '—'}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-600'>
                        {customer.PrimaryPhone?.FreeFormNumber || '—'}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-900'>
                        {formatCurrency(customer.Balance)}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            customer.Active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {customer.Active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='mt-4 flex justify-end'>
                <button
                  onClick={fetchCustomers}
                  className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                >
                  Refresh
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      <ToastContainer position='top-right' newestOnTop closeOnClick />
    </div>
  );
}
