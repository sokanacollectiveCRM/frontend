import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { UserContext } from '@/common/contexts/UserContext';
import { createPaymentIntent } from '@/common/utils/createContract';
import { AlertTriangle, Calendar, CheckCircle, CreditCard, DollarSign, FileText, Lock } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface ContractPaymentProps {
  contractId?: string;
  clientName?: string;
  serviceType?: string;
  amount?: number; // in cents
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

interface PaymentFormData {
  amount: string;
  description: string;
  paymentType: 'deposit' | 'balance';
  cardholderName: string;
  zipCode: string;
  consentToStore: boolean;
  consentToCharge: boolean;
}

export default function ContractPayment({
  contractId,
  clientName,
  serviceType = 'Doula Services',
  amount = 120000, // Default $1,200.00 in cents
  onPaymentSuccess,
  onPaymentError,
}: ContractPaymentProps) {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'balance'>('deposit');
  const [isVerifyingUser, setIsVerifyingUser] = useState(true);
  const [userVerificationError, setUserVerificationError] = useState<string | null>(null);

  // Read URL parameters if not provided as props
  const urlContractId = searchParams.get('contractId');
  const urlClientName = searchParams.get('clientName');
  const urlServiceType = searchParams.get('serviceType');
  const urlAmount = searchParams.get('amount');

  // Use URL params if available, otherwise use props
  const finalContractId = urlContractId || contractId;
  const finalClientName = urlClientName || clientName;
  const finalServiceType = urlServiceType || serviceType;
  const finalAmount = urlAmount ? parseInt(urlAmount) : amount;

  // Verify user identity and contract access
  useEffect(() => {
    const verifyUserAndContract = async () => {
      setIsVerifyingUser(true);
      setUserVerificationError(null);

      try {
        // Wait for user to load
        if (userLoading) {
          return;
        }

        // Check if user is authenticated
        if (!user) {
          setUserVerificationError('You must be logged in to make payments');
          return;
        }

        // Verify contract ID exists
        if (!finalContractId) {
          setUserVerificationError('Contract ID is missing from the URL');
          return;
        }

        // Verify user identity using localStorage data from SignNow return
        const storedVerificationData = localStorage.getItem('contractVerification');

        if (!storedVerificationData) {
          setUserVerificationError('No contract verification data found. Please access this page through the proper contract flow.');
          return;
        }

        const verificationData = JSON.parse(storedVerificationData);

        // Verify contract ID matches
        if (verificationData.contractId !== finalContractId) {
          setUserVerificationError('Contract ID mismatch. This may not be your contract.');
          return;
        }

        // Verify user email matches the client email from the contract
        if (verificationData.clientEmail !== user.email) {
          setUserVerificationError('Email mismatch. You are not authorized to make payments for this contract.');
          return;
        }

        // Check if verification data is not too old (e.g., within 24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (Date.now() - verificationData.timestamp > maxAge) {
          setUserVerificationError('Contract verification has expired. Please request a new contract.');
          localStorage.removeItem('contractVerification');
          return;
        }

        console.log('SignNow contract verification successful:', {
          contractId: finalContractId,
          clientEmail: verificationData.clientEmail,
          userEmail: user.email,
          timestamp: verificationData.timestamp,
          amounts: verificationData.amounts
        });

        console.log('User verification successful:', {
          userId: user.id,
          userEmail: user.email,
          contractId: finalContractId
        });

        setIsVerifyingUser(false);
      } catch (error) {
        console.error('User verification failed:', error);
        setUserVerificationError('Failed to verify your access to this contract');
        setIsVerifyingUser(false);
      }
    };

    verifyUserAndContract();
  }, [user, userLoading, finalContractId, finalClientName]);

  // Calculate payment amounts - Get from URL params or use defaults
  const totalAmount = finalAmount / 100; // Convert to dollars
  const depositAmountParam = searchParams.get('depositAmount');
  const balanceAmountParam = searchParams.get('balanceAmount');

  // Use actual calculated amounts if available, otherwise fallback to 50/50 split
  const depositAmount = depositAmountParam ? parseFloat(depositAmountParam) : totalAmount * 0.5;
  const balanceAmount = balanceAmountParam ? parseFloat(balanceAmountParam) : totalAmount * 0.5;

  console.log('Payment amounts:', {
    totalAmount,
    depositAmount,
    balanceAmount,
    finalAmount,
    depositAmountParam,
    balanceAmountParam
  });

  // Calculate due date (2 weeks before a future date)
  const dueDate = new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)); // 90 days from now
  const balanceDueDate = new Date(dueDate.getTime() - (14 * 24 * 60 * 60 * 1000)); // 2 weeks before

  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    amount: paymentType === 'deposit' ? depositAmount.toString() : balanceAmount.toString(),
    description: `${finalServiceType} - ${paymentType === 'deposit' ? 'Deposit' : 'Balance'} Payment - ${finalClientName || 'Contract Payment'}`,
    paymentType: 'deposit',
    cardholderName: '',
    zipCode: '',
    consentToStore: false,
    consentToCharge: false,
  });

  const handlePaymentTypeChange = (type: 'deposit' | 'balance') => {
    setPaymentType(type);
    setPaymentData(prev => ({
      ...prev,
      amount: type === 'deposit' ? depositAmount.toString() : balanceAmount.toString(),
      description: `${finalServiceType} - ${type === 'deposit' ? 'Deposit' : 'Balance'} Payment - ${finalClientName || 'Contract Payment'}`,
      paymentType: type,
    }));
  };

  const handlePayment = async () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!paymentData.cardholderName.trim()) {
      toast.error('Please enter the cardholder name');
      return;
    }

    if (!paymentData.zipCode.trim()) {
      toast.error('Please enter the billing zip code');
      return;
    }

    if (!paymentData.consentToCharge) {
      toast.error('Please agree to the payment terms');
      return;
    }

    if (!finalContractId) {
      toast.error('Contract ID is missing');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Creating payment intent for contract:', finalContractId);
      console.log('Payment amount:', paymentData.amount);
      console.log('Payment type:', paymentType);

      // Create payment intent using the contract ID
      const paymentIntent = await createPaymentIntent(finalContractId);

      console.log('Payment intent created:', paymentIntent);

      if (paymentIntent.success) {
        const paymentTypeText = paymentType === 'deposit' ? 'Deposit' : 'Balance';
        toast.success(`${paymentTypeText} payment intent created successfully!`);

        // TODO: Integrate with Stripe Elements to process the payment
        // For now, we'll show success since the payment intent was created
        onPaymentSuccess?.();
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast.error(error instanceof Error ? error.message : 'Payment processing failed');
      onPaymentError?.(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show loading state while verifying user
  if (isVerifyingUser || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                <span className="text-gray-600">Verifying your access to this contract...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if verification failed
  if (userVerificationError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Access Denied</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{userVerificationError}</p>
              <div className="space-y-2 text-sm text-red-600">
                <p>This could happen if:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You're not logged in with the correct account</li>
                  <li>You accessed this page directly without going through the contract flow</li>
                  <li>The contract verification has expired</li>
                  <li>This is not your contract</li>
                </ul>
              </div>
              <Button
                onClick={() => window.location.href = '/clients'}
                className="mt-4"
                variant="outline"
              >
                Go to Clients Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-teal-100 rounded-full">
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Complete Your Payment
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Thank you for signing the contract! Please complete your payment to finalize your service agreement.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            {/* Contract Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Contract Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Service:</span>
                  <p className="font-medium">{finalServiceType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Client:</span>
                  <p className="font-medium">{finalClientName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Investment:</span>
                  <p className="font-medium text-lg text-teal-600">{formatCurrency(totalAmount)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <p className="font-medium">{formatDate(dueDate)}</p>
                </div>
                {finalContractId && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Contract ID:</span>
                    <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                      {finalContractId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Payment Schedule
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Deposit (50%):</span>
                  <span className="font-medium">{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance (50%):</span>
                  <span className="font-medium">{formatCurrency(balanceAmount)}</span>
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  Balance due by: {formatDate(balanceDueDate)}
                </div>
              </div>
            </div>

            {/* Payment Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Select Payment Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentType === 'deposit' ? 'default' : 'outline'}
                  onClick={() => handlePaymentTypeChange('deposit')}
                  className={paymentType === 'deposit' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  Deposit Payment
                </Button>
                <Button
                  variant={paymentType === 'balance' ? 'default' : 'outline'}
                  onClick={() => handlePaymentTypeChange('balance')}
                  className={paymentType === 'balance' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  disabled={new Date() < balanceDueDate}
                >
                  Balance Payment
                </Button>
              </div>
              {paymentType === 'balance' && new Date() < balanceDueDate && (
                <p className="text-xs text-orange-600">
                  Balance payment will be available after {formatDate(balanceDueDate)}
                </p>
              )}
            </div>

            {/* Payment Amount */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Payment Amount
                </Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({
                      ...prev,
                      amount: e.target.value
                    }))}
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {paymentType === 'deposit' ? 'Deposit amount' : 'Balance amount'}: {formatCurrency(paymentType === 'deposit' ? depositAmount : balanceAmount)}
                </p>
              </div>
            </div>

            {/* Billing Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Billing Information
              </h3>

              <div>
                <Label htmlFor="cardholderName" className="text-sm font-medium text-gray-700">
                  Cardholder Name
                </Label>
                <Input
                  id="cardholderName"
                  value={paymentData.cardholderName}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    cardholderName: e.target.value
                  }))}
                  className="mt-1"
                  placeholder="Name as it appears on card"
                />
              </div>

              <div>
                <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                  Billing Zip Code
                </Label>
                <Input
                  id="zipCode"
                  value={paymentData.zipCode}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    zipCode: e.target.value
                  }))}
                  className="mt-1"
                  placeholder="12345"
                  maxLength={10}
                />
              </div>

              {/* Stripe Card Element Placeholder */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Card Information
                </Label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Card details will be securely collected by Stripe</span>
                  </div>
                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded text-sm text-gray-500">
                    [Stripe Card Element would be embedded here]
                    <br />
                    <span className="text-xs">Card number, expiration date, and CVC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Payment Authorization</h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consentToStore"
                    checked={paymentData.consentToStore}
                    onCheckedChange={(checked) => setPaymentData(prev => ({
                      ...prev,
                      consentToStore: checked as boolean
                    }))}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consentToStore" className="text-sm font-medium text-gray-700">
                      Store my card for future payments
                    </Label>
                    <p className="text-xs text-gray-500">
                      Your card information will be securely stored by Stripe for future balance payments and services.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consentToCharge"
                    checked={paymentData.consentToCharge}
                    onCheckedChange={(checked) => setPaymentData(prev => ({
                      ...prev,
                      consentToCharge: checked as boolean
                    }))}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consentToCharge" className="text-sm font-medium text-gray-700">
                      I authorize this payment
                    </Label>
                    <p className="text-xs text-gray-500">
                      I authorize Sokana Collective to charge my card for the amount specified above.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {paymentType === 'deposit' ? 'Deposit' : 'Balance'} Amount:
                </span>
                <span className="text-lg font-bold text-teal-700">
                  {formatCurrency(parseFloat(paymentData.amount) || 0)}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={
                isProcessing ||
                !paymentData.amount ||
                parseFloat(paymentData.amount) <= 0 ||
                (paymentType === 'balance' && new Date() < balanceDueDate) ||
                !paymentData.cardholderName.trim() ||
                !paymentData.zipCode.trim() ||
                !paymentData.consentToCharge
              }
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Complete {paymentType === 'deposit' ? 'Deposit' : 'Balance'} Payment
                </div>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                🔒 Your payment is secured by Stripe. We never store your payment information.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                (Demo mode - no actual payment will be processed)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
