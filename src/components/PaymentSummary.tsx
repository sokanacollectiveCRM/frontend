import { Badge } from '@/common/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Calendar, CreditCard, DollarSign, FileText } from 'lucide-react';
import { PaymentSummary as PaymentSummaryType } from '../types/payment';

interface PaymentSummaryProps {
  paymentDetails: PaymentSummaryType;
}

export const PaymentSummary = ({ paymentDetails }: PaymentSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // Handle ISO date strings properly to avoid timezone issues
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Find the deposit payment in payment_installments
  const depositPayment = paymentDetails.installments?.find(p => p.payment_type === 'deposit');

  // For deposit payments, always use today's date if no payment has been made yet
  // This fixes the issue where backend returns past dates for deposits
  const today = new Date().toISOString().split('T')[0];
  const isFirstPayment = paymentDetails.total_paid === 0;

  let depositDueDate = paymentDetails.next_payment_due;
  let depositAmount = paymentDetails.next_payment_amount;

  if (depositPayment) {
    // Use the deposit payment record if available
    depositDueDate = depositPayment.due_date;
    depositAmount = depositPayment.amount;
  } else if (isFirstPayment) {
    // If this is the first payment (deposit) and no payment has been made, use today's date
    depositDueDate = today;
    depositAmount = paymentDetails.next_payment_amount;
  }

  return (
    <div className="space-y-6">
      {/* Contract Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Total Contract Value:</span>
              <span className="font-semibold">{formatCurrency(paymentDetails.total_amount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Total Due:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(paymentDetails.total_due)}</span>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total Paid:</span>
              <span className="font-semibold text-green-600">{formatCurrency(paymentDetails.total_paid)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Next Payment Due
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(depositAmount)}
              </p>
              <p className="text-sm text-gray-600">
                Due: {formatDate(depositDueDate)}
              </p>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Deposit Payment
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentDetails.installments && paymentDetails.installments.length > 0 ? (
              paymentDetails.installments.map((installment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{formatCurrency(installment.amount)}</p>
                      <p className="text-sm text-gray-600">
                        Due: {formatDate(installment.due_date)}
                      </p>
                      {installment.payment_type && (
                        <p className="text-xs text-blue-600 font-medium">
                          {installment.payment_type === 'deposit' ? 'Deposit Payment' : 'Installment Payment'}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(installment.status)}>
                    {installment.status.charAt(0).toUpperCase() + installment.status.slice(1)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Payment schedule will be generated after first payment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
