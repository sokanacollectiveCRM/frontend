import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Checkbox } from '@/common/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/common/components/ui/form';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { useClients } from '@/common/hooks/clients/useClients';
import {
  CalculatedAmounts,
  ContractData,
  ContractInput,
  generateContract
} from '@/common/utils/createContract';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle, Info, Loader2, Search, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Available contract types - Updated to match backend service type detection
const CONTRACT_TYPES = [
  {
    id: 'Labor Support Services',
    name: 'Labor Support Services',
    description: 'Full labor and birth support services with fixed pricing',
    pricingType: 'fixed'
  },
  {
    id: 'Postpartum Doula Services',
    name: 'Postpartum Doula Services',
    description: 'Hourly-based postpartum care services',
    pricingType: 'hourly'
  },
];


// Enhanced form schemas - Updated for new backend integration
const contractInputSchema = z.object({
  serviceType: z.enum(['Labor Support Services', 'Postpartum Doula Services']),
  // Labor Support fields
  labor_support_amount: z.number().min(1, 'Labor support amount must be at least $1').optional(),
  // Postpartum fields
  total_hours: z.number().min(1, 'Total hours must be at least 1').optional(),
  hourly_rate: z.number().min(1, 'Hourly rate must be at least $1').optional(),
  // Payment plan fields (only required for Labor Support Services)
  deposit_type: z.enum(['percent', 'flat']).optional(),
  deposit_value: z.number().min(1, 'Deposit value must be at least 1').optional(),
  installments_count: z.number().min(2, 'Minimum 2 installments').max(5, 'Maximum 5 installments').optional(),
  cadence: z.enum(['monthly', 'biweekly']).optional(),
}).refine((data) => {
  // Validate based on service type
  if (data.serviceType === 'Labor Support Services' && !data.labor_support_amount) {
    return false;
  }
  if (data.serviceType === 'Postpartum Doula Services' && (!data.total_hours || !data.hourly_rate)) {
    return false;
  }
  // For Labor Support Services, require payment plan fields
  if (data.serviceType === 'Labor Support Services' && (!data.deposit_type || !data.deposit_value || !data.installments_count || !data.cadence)) {
    return false;
  }
  return true;
}, {
  message: "Please fill in all required fields for the selected service type",
  path: ["serviceType"]
});

const clientInfoSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Client name is required'),
});

type ContractFormData = z.infer<typeof contractInputSchema>;
type ClientFormData = z.infer<typeof clientInfoSchema>;

type Step = 'services' | 'input' | 'calculation' | 'client' | 'sent';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedContractDialog({ open, onOpenChange }: Props) {
  const { clients, getClients, isLoading: clientsLoading } = useClients();
  const [step, setStep] = useState<Step>('services');
  const [loading, setLoading] = useState(false);
  const [calculatedAmounts, setCalculatedAmounts] = useState<CalculatedAmounts | null>(null);
  const [signNowFields, setSignNowFields] = useState<any>(null);
  const [contractData, setContractData] = useState<ContractInput | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedContractType, setSelectedContractType] = useState<string>('');
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [laborSupportAmount, setLaborSupportAmount] = useState<number>(0);

  // Load clients when dialog opens
  useEffect(() => {
    if (open) {
      console.log('🔍 Loading clients for contract dialog...');
      getClients();
      // Remove focus from any input field when dialog opens
      setTimeout(() => {
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 100);
    }
  }, [open, getClients]);

  // Debug clients data
  useEffect(() => {
    console.log('🔍 Clients data in dialog:', {
      clients,
      clientsLength: clients?.length,
      clientsLoading,
      firstClient: clients?.[0]
    });
  }, [clients, clientsLoading]);

  const contractForm = useForm<ContractFormData>({
    resolver: zodResolver(contractInputSchema),
    defaultValues: {
      serviceType: 'Labor Support Services',
      labor_support_amount: 0,
      total_hours: 120,
      hourly_rate: 35,
      deposit_type: 'percent',
      deposit_value: 0,
      installments_count: 3,
      cadence: 'monthly',
    },
  });

  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientInfoSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });


  // Calculate total contract amount based on service type
  useEffect(() => {
    const serviceType = contractForm.watch('serviceType');

    if (serviceType === 'Labor Support Services') {
      // For labor support, use the fixed amount
      const amount = laborSupportAmount || 0;
      setCalculatedTotal(amount);

      // Update form values for labor support
      contractForm.setValue('total_hours', 0); // No hours for labor support
      contractForm.setValue('hourly_rate', 0); // No hourly rate for labor support
      contractForm.setValue('labor_support_amount', amount);
    } else if (serviceType === 'Postpartum Doula Services') {
      // For postpartum, use hourly calculation
      const hourlyRate = contractForm.watch('hourly_rate') || 0;
      const totalHours = contractForm.watch('total_hours') || 0;
      const amount = hourlyRate * totalHours;
      setCalculatedTotal(amount);
    }
  }, [selectedContractType, laborSupportAmount, contractForm]);

  const calculateAmounts = async (data: ContractFormData) => {
    setLoading(true);
    try {
      console.log('Calculating contract amounts with data:', data);

      // Create the contract input with the calculated total
      const contractInput = {
        serviceType: data.serviceType,
        labor_support_amount: data.labor_support_amount,
        total_hours: data.total_hours,
        hourly_rate: data.hourly_rate,
        deposit_type: data.deposit_type,
        deposit_value: data.deposit_value,
        installments_count: data.installments_count,
        cadence: data.cadence,
        total_amount: calculatedTotal,
      };

      console.log('Contract input:', contractInput);

      // For Labor Support Services contracts, calculate locally without backend call
      if (data.serviceType === 'Labor Support Services') {
        const totalAmount = data.labor_support_amount || 0;
        const depositValue = data.deposit_value || 0;
        const installmentsCount = data.installments_count || 3;
        const depositAmount = data.deposit_type === 'percent'
          ? (totalAmount * depositValue) / 100
          : depositValue;
        const balanceAmount = totalAmount - depositAmount;
        const installmentAmount = balanceAmount / installmentsCount;

        const localAmounts: CalculatedAmounts = {
          total_amount: totalAmount,
          deposit_amount: depositAmount,
          balance_amount: balanceAmount,
          installments_amounts: Array(installmentsCount).fill(installmentAmount),
        };

        const localSignNowFields = {
          total_hours: '0', // Labor support doesn't use hours
          hourly_rate_fee: '0.00', // Labor support doesn't use hourly rate
          deposit: depositAmount.toFixed(2),
          overnight_fee_amount: '0.00', // Not applicable for labor support
          total_amount: totalAmount.toFixed(2),
        };

        setCalculatedAmounts(localAmounts);
        setSignNowFields(localSignNowFields);
        setContractData(contractInput);
        setStep('calculation');
        toast.success('Labor Support Services contract calculated successfully!');
      } else if (data.serviceType === 'Postpartum Doula Services') {
        // For postpartum contracts, calculate locally without deposits
        const hourlyRate = data.hourly_rate || 0;
        const totalHours = data.total_hours || 0;
        const totalAmount = hourlyRate * totalHours;

        const localAmounts: CalculatedAmounts = {
          total_amount: totalAmount,
          deposit_amount: 0, // No deposit for postpartum
          balance_amount: totalAmount, // Full amount due after work
          installments_amounts: [totalAmount], // Single payment
        };

        const localSignNowFields = {
          total_hours: totalHours.toString(),
          hourly_rate_fee: hourlyRate.toFixed(2),
          deposit: '0.00', // No deposit
          overnight_fee_amount: '0.00',
          total_amount: totalAmount.toFixed(2),
        };

        setCalculatedAmounts(localAmounts);
        setSignNowFields(localSignNowFields);
        setContractData(contractInput);
        setStep('calculation');
        toast.success('Postpartum Doula Services contract calculated successfully!');
      }
    } catch (error) {
      console.error('Calculation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to calculate contract amounts');
    } finally {
      setLoading(false);
    }
  };

  const sendContract = async () => {
    if (!contractData) {
      toast.error('Contract data is missing');
      return;
    }

    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    setLoading(true);
    try {
      const clientData = {
        email: selectedClient.email || '',
        name: `${selectedClient.firstname} ${selectedClient.lastname}`
      };

      // Prepare contract data for new API
      const contractDataForAPI: ContractData = {
        clientName: clientData.name,
        clientEmail: clientData.email,
        totalInvestment: `$${calculatedAmounts?.total_amount?.toFixed(2) || '0.00'}`,
        depositAmount: `$${calculatedAmounts?.deposit_amount?.toFixed(2) || '0.00'}`,
        serviceType: selectedContractType as 'Labor Support Services' | 'Postpartum Doula Services',
        remainingBalance: calculatedAmounts?.balance_amount ? `$${calculatedAmounts.balance_amount.toFixed(2)}` : undefined,
        contractDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      };

      // Add Postpartum-specific fields only for Postpartum contracts
      console.log('🔍 Conditional Logic Debug:');
      console.log('- selectedContractType:', selectedContractType);
      console.log('- selectedContractType === "Postpartum Doula Services":', selectedContractType === 'Postpartum Doula Services');

      if (selectedContractType === 'Postpartum Doula Services') {
        console.log('✅ Adding Postpartum fields to API data');
        contractDataForAPI.totalHours = contractForm.watch('total_hours')?.toString() || '0';
        contractDataForAPI.hourlyRate = contractForm.watch('hourly_rate')?.toString() || '0';
        contractDataForAPI.overnightFee = '0.00'; // Default overnight fee
        console.log('- Added totalHours:', contractDataForAPI.totalHours);
        console.log('- Added hourlyRate:', contractDataForAPI.hourlyRate);
        console.log('- Added overnightFee:', contractDataForAPI.overnightFee);
      } else {
        console.log('❌ Not adding Postpartum fields - service type is:', selectedContractType);
      }

      console.log('🔍 Frontend Contract Fields Debug:');
      console.log('- serviceType:', selectedContractType);
      console.log('- total_hours from form:', contractForm.watch('total_hours'));
      console.log('- hourly_rate from form:', contractForm.watch('hourly_rate'));
      console.log('- Form values:', contractForm.getValues());
      console.log('- selectedContractType === "Postpartum Doula Services":', selectedContractType === 'Postpartum Doula Services');
      console.log('- Will add Postpartum fields:', selectedContractType === 'Postpartum Doula Services');
      console.log('- Sending contract data to new API:', contractDataForAPI);
      console.log('- API data keys:', Object.keys(contractDataForAPI));
      console.log('- Postpartum fields included:', selectedContractType === 'Postpartum Doula Services');

      // Verify Postpartum fields are actually in the data
      console.log('🔍 Postpartum Fields Verification:');
      console.log('- totalHours in data:', 'totalHours' in contractDataForAPI);
      console.log('- hourlyRate in data:', 'hourlyRate' in contractDataForAPI);
      console.log('- overnightFee in data:', 'overnightFee' in contractDataForAPI);
      console.log('- totalHours value:', contractDataForAPI.totalHours);
      console.log('- hourlyRate value:', contractDataForAPI.hourlyRate);
      console.log('- overnightFee value:', contractDataForAPI.overnightFee);

      const response = await generateContract(contractDataForAPI);
      if (response.success) {
        // Store contract ID and calculated amounts for payment integration
        setContractId(response.data.contractId);
        setStep('sent');
        toast.success(`Contract generated successfully! Document ID: ${response.data.contractId}. Client will receive an email to sign the contract.`);

        // Log the response for debugging
        console.log('Contract generated successfully:', {
          contractId: response.data.contractId,
          signNow: response.data.signNow,
          emailDelivery: response.data.emailDelivery
        });

        // Store contract verification data in localStorage for future payment integration
        const contractVerificationData = {
          contractId: response.data.contractId,
          clientEmail: clientData.email,
          clientName: clientData.name,
          timestamp: Date.now(),
          amounts: calculatedAmounts
        };
        localStorage.setItem('contractVerification', JSON.stringify(contractVerificationData));

        console.log('Stored contract verification data:', contractVerificationData);
      } else {
        toast.error('Failed to generate contract');
      }
    } catch (error) {
      console.error('Failed to generate contract:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate contract');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('services');
    setSelectedContractType('');
    setCalculatedTotal(0);
    setLaborSupportAmount(0);
    setSearchTerm('');
    setSelectedClient(null);
    setCalculatedAmounts(null);
    setContractData(null);
    setContractId(null);
    contractForm.reset({
      serviceType: 'Labor Support Services',
      labor_support_amount: 0,
      total_hours: 120,
      hourly_rate: 35,
      deposit_type: 'percent',
      deposit_value: 0,
      installments_count: 3,
      cadence: 'monthly',
    });
    clientForm.reset();
  };

  // Get payment timing information
  const getPaymentTiming = (cadence: string) => {
    if (cadence === 'monthly') {
      return 'Subsequent payments will be charged monthly after the first payment';
    } else {
      return 'Subsequent payments will be charged bi-weekly after the first payment';
    }
  };

  // Calculate payment dates
  const getPaymentDates = (cadence: string, installmentsCount: number) => {
    const dates = [];
    const today = new Date();

    // First payment (deposit) is immediate
    dates.push({
      label: 'Deposit',
      date: today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      amount: 0 // Will be calculated separately
    });

    // Calculate subsequent payment dates
    for (let i = 1; i <= installmentsCount; i++) {
      const paymentDate = new Date(today);

      if (cadence === 'monthly') {
        paymentDate.setMonth(paymentDate.getMonth() + i);
      } else if (cadence === 'biweekly') {
        paymentDate.setDate(paymentDate.getDate() + (i * 14));
      }

      dates.push({
        label: `Payment ${i}`,
        date: paymentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        amount: 0 // Will be calculated separately
      });
    }

    return dates;
  };

  // Get deposit charging information
  const getDepositInfo = (depositType: string, depositValue: number | string, laborSupportAmount: number) => {
    // Ensure depositValue is a valid number
    const numericDepositValue = typeof depositValue === 'string' ? parseFloat(depositValue) || 0 : depositValue;

    if (depositType === 'percent') {
      return `Deposit of ${numericDepositValue}% ($${(laborSupportAmount * numericDepositValue / 100).toFixed(2)}) will be charged immediately upon contract signing`;
    } else {
      return `Deposit of $${numericDepositValue.toFixed(2)} will be charged immediately upon contract signing`;
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Create Contract
          </DialogTitle>
          <DialogDescription>
            {step === 'services' && 'Select contract type and configure details'}
            {step === 'input' && 'Enter contract details to calculate amounts'}
            {step === 'calculation' && 'Review calculated amounts and payment schedule'}
            {step === 'client' && 'Enter client information to send the contract'}
            {step === 'sent' && 'Contract has been sent successfully!'}
          </DialogDescription>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${step === 'services' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'input' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'calculation' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'client' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'sent' ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Contract Type Selection */}
          {step === 'services' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Contract Type</h3>
                <div className="grid grid-cols-1 gap-4">
                  {CONTRACT_TYPES.map((contractType) => (
                    <Card
                      key={contractType.id}
                      className={`cursor-pointer transition-all ${selectedContractType === contractType.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                        }`}
                      onClick={() => {
                        setSelectedContractType(contractType.id);
                        contractForm.setValue('serviceType', contractType.id as 'Labor Support Services' | 'Postpartum Doula Services');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedContractType === contractType.id}
                            onChange={() => { }} // Handled by card click
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{contractType.name}</h4>
                            <p className="text-sm text-gray-600">{contractType.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedContractType && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">Contract Configuration:</h4>

                      {selectedContractType === 'Labor Support Services' && (
                        <div className="space-y-3">
                          <div className="p-3 bg-white border rounded-lg">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Labor Support Amount
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={laborSupportAmount === 0 ? '' : laborSupportAmount}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const amount = value === '' ? 0 : Number(value);
                                  setLaborSupportAmount(amount);
                                  contractForm.setValue('labor_support_amount', amount);
                                }}
                                className="w-32 h-8 text-sm"
                              />
                              <span className="text-sm text-gray-500">total</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Fixed amount for full labor and birth support services
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedContractType === 'Postpartum Doula Services' && (
                        <div className="space-y-3">
                          <div className="p-3 bg-white border rounded-lg">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Postpartum Support Rate
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={contractForm.watch('hourly_rate') === 0 ? '' : contractForm.watch('hourly_rate') || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  contractForm.setValue('hourly_rate', value === '' ? 0 : Number(value));
                                }}
                                className="w-24 h-8 text-sm"
                              />
                              <span className="text-sm text-gray-500">/hour</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Hourly rate for postpartum care services (billed based on actual hours worked)
                            </p>
                          </div>

                          <div className="p-3 bg-white border rounded-lg">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Estimated Hours
                            </label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="0"
                                value={contractForm.watch('total_hours') === 0 ? '' : contractForm.watch('total_hours') || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  contractForm.setValue('total_hours', value === '' ? 0 : Number(value));
                                }}
                                className="w-20 h-8 text-sm"
                              />
                              <span className="text-sm text-gray-500">hours</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Estimated hours for contract display (actual billing based on logged hours)
                            </p>
                          </div>
                        </div>
                      )}


                      {/* Total Calculation Display */}
                      {calculatedTotal > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-blue-800">Total Contract Amount:</span>
                            <span className="text-lg font-bold text-blue-900">${calculatedTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('input')}
                  disabled={
                    !selectedContractType ||
                    (selectedContractType === 'Labor Support Services' && laborSupportAmount <= 0) ||
                    (selectedContractType === 'Postpartum Doula Services' && ((!contractForm.watch('hourly_rate') || (contractForm.watch('hourly_rate') ?? 0) <= 0) || (!contractForm.watch('total_hours') || (contractForm.watch('total_hours') ?? 0) <= 0)))
                  }
                  className="flex-1 h-11"
                >
                  Continue to Contract Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Service Details Input */}
          {step === 'input' && (
            <Form {...contractForm}>
              <form onSubmit={contractForm.handleSubmit(calculateAmounts)} className="space-y-6">
                {/* Contract Summary */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Contract Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedContractType === 'Labor Support Services' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Service Type:</span>
                          <span className="text-sm font-medium">Labor Support Services</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Labor Support Amount:</span>
                          <span className="text-sm font-medium">${laborSupportAmount.toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    {selectedContractType === 'Postpartum Doula Services' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Service Type:</span>
                          <span className="text-sm font-medium">Postpartum Doula Services</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hourly Rate:</span>
                          <span className="text-sm font-medium">${(contractForm.watch('hourly_rate') || 0).toFixed(2)}/hour</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Estimated Hours:</span>
                          <span className="text-sm font-medium">{contractForm.watch('total_hours') || 0} hours</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between md:col-span-2">
                      <span className="text-sm font-medium text-gray-700">Total Contract Amount:</span>
                      <span className="text-lg font-bold text-gray-900">${calculatedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Plan Fields - Only show for Labor Support Services */}
                {selectedContractType === 'Labor Support Services' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={contractForm.control}
                      name="deposit_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deposit Type</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value as 'percent' | 'flat';
                                console.log('Deposit type changed to:', value);
                                field.onChange(value);
                                // Reset deposit value when type changes
                                contractForm.setValue('deposit_value', 0);
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="percent">Percentage</option>
                              <option value="flat">Flat Amount</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contractForm.control}
                      name="deposit_value"
                      render={({ field }) => {
                        const depositType = contractForm.watch('deposit_type');
                        console.log('Current deposit type:', depositType);
                        return (
                          <FormItem>
                            <FormLabel>
                              Deposit Value ({depositType === 'percent' ? '%' : '$'})
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step={depositType === 'percent' ? '1' : '0.01'}
                                placeholder={depositType === 'percent' ? 'Enter percentage value' : 'Enter deposit amount'}
                                value={field.value === 0 ? '' : field.value}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow empty field and remove leading zeros
                                  if (value === '') {
                                    field.onChange(0); // Set to 0 instead of empty string
                                  } else {
                                    const cleanValue = value.replace(/^0+/, '');
                                    field.onChange(cleanValue === '' ? 0 : Number(cleanValue));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={contractForm.control}
                      name="installments_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Installments (2-5)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="2"
                              max="5"
                              placeholder="3"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty field and remove leading zeros
                                if (value === '') {
                                  field.onChange('');
                                } else {
                                  const cleanValue = value.replace(/^0+/, '');
                                  field.onChange(cleanValue === '' ? 0 : Number(cleanValue));
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contractForm.control}
                      name="cadence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Cadence</FormLabel>
                          <FormControl>
                            <select
                              value={field.value || 'monthly'}
                              onChange={(e) => {
                                console.log('Cadence changed to:', e.target.value);
                                field.onChange(e.target.value);
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="monthly">Monthly</option>
                              <option value="biweekly">Bi-weekly</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* For Postpartum Doula Services contracts, show simplified billing info */}
                {selectedContractType === 'Postpartum Doula Services' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-green-800">Hourly Billing Information</h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <p>• No deposit required - billing based on actual hours worked</p>
                          <p>• Invoices will be sent after hours are completed</p>
                          <p>• Payment due upon receipt of invoice</p>
                          <p>• Hourly rate: ${(contractForm.watch('hourly_rate') || 0).toFixed(2)}/hour</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Information - Only show for Labor Support Services */}
                {selectedContractType === 'Labor Support Services' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-blue-800">Payment Information</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>• {getDepositInfo(contractForm.watch('deposit_type') || 'percent', contractForm.watch('deposit_value') || 0, calculatedTotal)}</p>
                          <p>• First payment (deposit) will be charged immediately upon contract signing</p>
                          <p>• {getPaymentTiming(contractForm.watch('cadence') || 'monthly')}</p>
                          <p>• Labor support payments are due before the baby is born</p>
                          <p>• All payments are processed securely through Stripe</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('services')}
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Services
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 text-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      const formData = contractForm.getValues();
                      console.log('Manual calculate button clicked with data:', formData);
                      calculateAmounts(formData);
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-5 w-5" />
                        Calculate Contract
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {/* Step 3: Calculation Preview */}
          {step === 'calculation' && calculatedAmounts && signNowFields && (
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Contract Calculation Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">Total Contract Amount:</span>
                      <Badge variant="outline" className="text-lg font-bold">
                        ${calculatedAmounts.total_amount.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">Deposit Amount:</span>
                      <Badge variant="destructive" className="text-lg font-bold">
                        ${calculatedAmounts.deposit_amount.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">Balance Amount:</span>
                      <Badge variant="outline" className="text-lg font-bold">
                        ${calculatedAmounts.balance_amount.toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  {/* Payment Schedule - Only show for Labor Support Services */}
                  {selectedContractType === 'Labor Support Services' && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-3">Labor Support Payment Schedule:</h4>
                      <div className="space-y-2">
                        {calculatedAmounts && getPaymentDates(contractForm.watch('cadence') || 'monthly', contractForm.watch('installments_count') || 3).map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                            <div className="flex flex-col">
                              <span className="font-medium">{payment.label}</span>
                              <span className="text-sm text-gray-500">{payment.date}</span>
                            </div>
                            <Badge variant="secondary">
                              {index === 0
                                ? `$${calculatedAmounts?.deposit_amount?.toFixed(2) || '0.00'}`
                                : `$${calculatedAmounts?.installments_amounts?.[index - 1]?.toFixed(2) || '0.00'}`
                              }
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* For Postpartum Doula Services contracts, show billing information instead */}
                  {selectedContractType === 'Postpartum Doula Services' && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-3">Billing Information:</h4>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="space-y-2 text-sm text-green-800">
                          <p>• Total estimated amount: <strong>${calculatedAmounts?.total_amount?.toFixed(2) || '0.00'}</strong></p>
                          <p>• Hourly rate: <strong>${contractForm.watch('hourly_rate')?.toFixed(2) || '0.00'}/hour</strong></p>
                          <p>• Estimated hours: <strong>{contractForm.watch('total_hours') || 0} hours</strong></p>
                          <p>• <strong>No payment schedule</strong> - billed as services are completed</p>
                          <p>• Invoices will be sent after hours are worked</p>
                          <p>• Payment due upon receipt of invoice</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Timing Information - Only show for Labor Support Services */}
                  {selectedContractType === 'Labor Support Services' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">
                        Labor Support Payment Schedule:
                      </h4>
                      <div className="space-y-1 text-sm text-blue-700">
                        <p>• {getDepositInfo(contractForm.watch('deposit_type') || 'percent', contractForm.watch('deposit_value') || 0, calculatedAmounts.total_amount)}</p>
                        <p>• First payment (deposit) will be charged immediately upon contract signing</p>
                        <p>• {getPaymentTiming(contractForm.watch('cadence') || 'monthly')}</p>
                      </div>
                    </div>
                  )}

                  {/* SignNow Fields Preview */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Contract Details:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Hours:</span>
                        <span className="font-medium">{signNowFields.total_hours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Hourly Rate:</span>
                        <span className="font-medium">${signNowFields.hourly_rate_fee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Deposit:</span>
                        <span className="font-medium">${signNowFields.deposit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Amount:</span>
                        <span className="font-medium">${signNowFields.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('input')}
                  className="flex-1 h-11"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
                <Button
                  onClick={() => setStep('client')}
                  className="flex-1 h-11"
                >
                  Continue to Client Info
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Client Information */}
          {step === 'client' && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Search Clients</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Client List */}
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {clientsLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading clients...
                    </div>
                  ) : clients
                    .filter(client =>
                      !searchTerm ||
                      `${client.user.firstname} ${client.user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      client.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((client) => (
                      <div
                        key={client.id}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedClient?.id === client.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        onClick={() => {
                          setSelectedClient(client);
                          clientForm.setValue('email', client.user.email || '');
                          clientForm.setValue('name', `${client.user.firstname} ${client.user.lastname}`);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {client.user.firstname} {client.user.lastname}
                            </p>
                            <p className="text-sm text-gray-500">{client.user.email}</p>
                          </div>
                          {selectedClient?.id === client.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}

                  {!clientsLoading && clients.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No clients found. Please add clients first.
                    </div>
                  )}

                  {!clientsLoading && clients.length > 0 && clients.filter(client =>
                    !searchTerm ||
                    `${client.user.firstname} ${client.user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    client.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No clients found matching your search.
                      </div>
                    )}
                </div>

                {/* Selected Client Info */}
                {selectedClient && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Selected Client:</p>
                    <p className="text-green-700">
                      {selectedClient.firstname} {selectedClient.lastname} ({selectedClient.email})
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('calculation')}
                  className="flex-1 h-11"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Calculation
                </Button>
                <Button
                  type="button"
                  onClick={sendContract}
                  disabled={loading || !selectedClient}
                  className="flex-1 h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Contract...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Contract for Signature
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'sent' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-800">Contract Sent Successfully via SignNow!</h3>
                <p className="text-gray-600">
                  The contract has been generated with all calculated amounts and sent to the client for signature via SignNow.
                </p>
                <p className="text-sm text-gray-500">
                  The client will receive an email with instructions to sign the contract through SignNow. After signing,
                  they will be directed to make the deposit payment.
                </p>
                {contractId && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Contract ID:</strong> {contractId}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      This ID can be used to create payment intents after the contract is signed.
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={resetForm} className="w-full h-12 text-lg">
                Create Another Contract
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
