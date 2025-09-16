import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import ContractPayment from './ContractPayment';

export default function ContractPaymentDemo() {
  const [contractDetails, setContractDetails] = useState({
    contractId: 'CON-2024-001',
    clientName: 'Sarah Johnson',
    serviceType: 'Postpartum Support',
    amount: 2500, // $25.00 in cents
  });

  const handlePaymentSuccess = () => {
    toast.success('Payment completed successfully!');
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Contract Payment Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-gray-600 mb-6">
              <p>This demo shows the ContractPayment component with configurable details.</p>
              <p className="text-sm mt-2">
                Customize the contract details below to see how the payment form adapts.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="contractId">Contract ID</Label>
                <Input
                  id="contractId"
                  value={contractDetails.contractId}
                  onChange={(e) => setContractDetails(prev => ({
                    ...prev,
                    contractId: e.target.value
                  }))}
                  placeholder="CON-2024-001"
                />
              </div>

              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={contractDetails.clientName}
                  onChange={(e) => setContractDetails(prev => ({
                    ...prev,
                    clientName: e.target.value
                  }))}
                  placeholder="Client Name"
                />
              </div>

              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Input
                  id="serviceType"
                  value={contractDetails.serviceType}
                  onChange={(e) => setContractDetails(prev => ({
                    ...prev,
                    serviceType: e.target.value
                  }))}
                  placeholder="Service Type"
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (in cents)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={contractDetails.amount}
                  onChange={(e) => setContractDetails(prev => ({
                    ...prev,
                    amount: parseInt(e.target.value) || 0
                  }))}
                  placeholder="2500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Amount in cents (e.g., 2500 = $25.00)
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Payment Form Preview:</h3>
              <p className="text-sm text-blue-800">
                The payment form below will update automatically as you change the details above.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form - Shows directly below the configuration */}
        <div className="mt-8">
          <ContractPayment
            contractId={contractDetails.contractId}
            clientName={contractDetails.clientName}
            serviceType={contractDetails.serviceType}
            amount={contractDetails.amount}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>
      </div>
    </div>
  );
}
