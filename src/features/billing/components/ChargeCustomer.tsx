import { chargeCard, getCustomersWithStripeId } from '@/api/payments/stripe';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { UserContext } from '@/common/contexts/UserContext';
import { AlertCircle, CheckCircle, CreditCard, DollarSign, User } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Customer {
  id: string; // UUID from database
  name: string; // Full name from API
  email: string;
  stripeCustomerId: string; // Stripe customer ID
  createdAt: string;
  updatedAt: string;
  // Computed fields for compatibility
  firstname?: string;
  lastname?: string;
}

export default function ChargeCustomer() {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Debug: Log when selectedCustomerId changes
  React.useEffect(() => {
    console.log('selectedCustomerId changed to:', selectedCustomerId);
  }, [selectedCustomerId]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.custom-dropdown')) {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await getCustomersWithStripeId();
      console.log('Raw API response:', response);

      // Handle different response formats
      let rawData: any[];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        rawData = (response as any).data;
      } else if (response && typeof response === 'object' && 'customers' in response && Array.isArray((response as any).customers)) {
        rawData = (response as any).customers;
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from customers API');
      }

      // Transform and filter the data
      const customerList = rawData
        .filter((customer: any) =>
          customer.id &&
          customer.name &&
          customer.email &&
          customer.stripeCustomerId &&
          customer.stripeCustomerId !== 'NULL' &&
          customer.stripeCustomerId !== null
        )
        .map((customer: any) => {
          // Split name into first and last name for backward compatibility
          const nameParts = customer.name.split(' ');
          const firstname = nameParts[0] || '';
          const lastname = nameParts.slice(1).join(' ') || '';

          return {
            ...customer,
            firstname,
            lastname
          } as Customer;
        });

      console.log('Loaded customers with Stripe IDs:', customerList.map((c: Customer) => ({
        id: c.id,
        name: c.name,
        stripeCustomerId: c.stripeCustomerId,
        email: c.email
      })));
      console.log('Filtered out customers without Stripe IDs:', rawData.filter((customer: any) =>
        !customer.id || !customer.name || !customer.stripeCustomerId || customer.stripeCustomerId === 'NULL' || customer.stripeCustomerId === null
      ).map((c: any) => ({ id: c.id, name: c.name, stripeCustomerId: c.stripeCustomerId, email: c.email })));
      setCustomers(customerList);

      // Ensure no customer is auto-selected
      if (selectedCustomerId && !customerList.find((c: Customer) => c.id === selectedCustomerId)) {
        console.log('Clearing selectedCustomerId because selected customer not found in new list');
        setSelectedCustomerId('');
      }
    } catch (error: any) {
      console.error('Error loading customers:', error);
      toast.error(error.message || 'Failed to load customers');
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId || selectedCustomerId === 'loading' || selectedCustomerId === 'no-customers') {
      setError('Please select a customer');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsCharging(true);

    try {
      // Convert dollars to cents
      const amountInCents = Math.round(parseFloat(amount) * 100);

      // Use the database customer ID for the API endpoint
      const selectedCustomerData = customers.find(c => c.id === selectedCustomerId);
      if (!selectedCustomerData?.stripeCustomerId) {
        throw new Error('Selected customer does not have a valid Stripe customer ID');
      }

      // Pass the database customer ID to the API endpoint
      const result = await chargeCard(selectedCustomerData.id, amountInCents, description);

      toast.success(`Successfully charged $${amount} to customer's default payment method`);

      // Reset form
      setSelectedCustomerId('');
      setAmount('');
      setDescription('');

    } catch (error: any) {
      console.error('Error charging customer:', error);
      setError(error.message || 'Failed to charge customer');
      toast.error(error.message || 'Failed to charge customer');
    } finally {
      setIsCharging(false);
    }
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    `${customer.firstname} ${customer.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if the currently selected customer is still in the filtered list
  const isSelectedCustomerInFilteredList = filteredCustomers.some(customer => customer.id === selectedCustomerId);

  // If the selected customer is not in the filtered list when searching, clear the selection
  React.useEffect(() => {
    if (searchQuery && selectedCustomerId && selectedCustomerId !== 'loading' && selectedCustomerId !== 'no-customers' && !isSelectedCustomerInFilteredList) {
      console.log('Clearing selection because selected customer not in filtered list');
      setSelectedCustomerId('');
    }
  }, [selectedCustomerId, isSelectedCustomerInFilteredList, searchQuery]);

  const selectedCustomer = selectedCustomerId && selectedCustomerId !== 'loading' && selectedCustomerId !== 'no-customers'
    ? customers.find(customer => customer.id === selectedCustomerId)
    : undefined;

  // Debug logging
  React.useEffect(() => {
    console.log('=== Customer Selection Debug ===');
    console.log('Selected Customer ID:', selectedCustomerId);
    console.log('All Customers:', customers.map((c: Customer) => ({ id: c.id, name: `${c.firstname} ${c.lastname}` })));
    console.log('Filtered Customers:', filteredCustomers.map((c: Customer) => ({ id: c.id, name: `${c.firstname} ${c.lastname}` })));
    console.log('Selected Customer Object:', selectedCustomer);
    console.log('Is selected in filtered list:', isSelectedCustomerInFilteredList);
    console.log('Search Query:', searchQuery);
    console.log('===============================');
  }, [selectedCustomerId, filteredCustomers, selectedCustomer, customers, searchQuery]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You do not have permission to access this feature. Admin access required.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Charge Customer Payment Method
          </CardTitle>
          <CardDescription>
            Select a customer and charge their default payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCharge} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="customer">Select Customer</Label>
                {selectedCustomerId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Manual clear selection clicked');
                      setSelectedCustomerId('');
                    }}
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
              <div className="space-y-2 relative custom-dropdown">
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="mb-2"
                />

                {/* Custom searchable dropdown */}
                <div className="relative">
                  <div
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer min-h-[40px] flex items-center"
                    onClick={() => {
                      setShowDropdown(!showDropdown);
                      if (!showDropdown) setSearchQuery('');
                    }}
                  >
                    {selectedCustomer ? (
                      <span>{selectedCustomer.firstname} {selectedCustomer.lastname}</span>
                    ) : (
                      <span className="text-gray-500">Select a customer</span>
                    )}
                  </div>

                  {/* Show dropdown when user is searching or dropdown is open */}
                  {(showDropdown || searchQuery) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {isLoadingCustomers ? (
                        <div className="px-3 py-2 text-gray-500">Loading customers...</div>
                      ) : filteredCustomers.length === 0 ? (
                        <div className="px-3 py-2 text-gray-500">No customers found</div>
                      ) : (
                        <>
                          {selectedCustomerId && (
                            <div
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
                              onClick={() => {
                                setSelectedCustomerId('');
                                setSearchQuery('');
                                setShowDropdown(false);
                              }}
                            >
                              <span className="text-red-600">Clear selection</span>
                            </div>
                          )}
                          {filteredCustomers.map((customer) => (
                            <div
                              key={customer.id || `${customer.firstname}-${customer.lastname}`}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                console.log('Customer clicked:', customer.id, customer.firstname, customer.lastname);
                                if (customer.id && customer.id !== 'undefined') {
                                  setSelectedCustomerId(customer.id);
                                  setSearchQuery(''); // Clear search after selection
                                  setShowDropdown(false); // Close dropdown after selection
                                } else {
                                  console.error('Cannot select customer with invalid ID:', customer);
                                }
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{customer.firstname} {customer.lastname}</span>
                                <span className="text-sm text-gray-500">{customer.email}</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Customer Info */}
            {selectedCustomer && (
              <div className="p-4 border rounded-lg bg-blue-50/30 border-blue-200">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{selectedCustomer.firstname} {selectedCustomer.lastname}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                    <Badge variant="outline" className="mt-1">
                      Customer
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
              {amount && (
                <p className="text-sm text-gray-600">
                  Amount: ${parseFloat(amount || '0').toFixed(2)}
                </p>
              )}
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Service fee, Consultation, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isCharging || !selectedCustomerId || selectedCustomerId === 'loading' || selectedCustomerId === 'no-customers' || !amount || !description}
              className="w-full"
            >
              {isCharging ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing Charge...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Charge ${amount || '0.00'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success/Info Message */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          This will charge the customer's default payment method. Make sure the customer has a saved payment method before proceeding.
        </AlertDescription>
      </Alert>
    </div>
  );
} 