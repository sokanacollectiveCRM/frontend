import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
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
  applyMultiServiceDiscount,
  generateContract,
} from '@/common/utils/createContract';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle,
  Info,
  Loader2,
  Search,
  Send,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Multi-service selection types
interface ServiceSelection {
  id: string;
  name: string;
  type: 'flat' | 'hourly';
  amount?: number;
  hourlyRate?: number;
  totalHours?: number;
}

const availableServices: ServiceSelection[] = [
  { id: 'labor', name: 'Labor Support', type: 'flat' },
  { id: 'postpartum', name: 'Postpartum Support', type: 'hourly' },
  { id: 'firstNight', name: '1st Night Care', type: 'flat' },
  { id: 'lactation', name: 'Lactation Support', type: 'flat' },
  { id: 'perinatalEd', name: 'Perinatal Education', type: 'flat' },
  { id: 'abortion', name: 'Abortion Support', type: 'flat' },
  { id: 'other', name: 'Other', type: 'flat' },
];

// Form schema (relaxed for multi-service flow; UI enforces correctness)
const contractInputSchema = z.object({
  serviceType: z.string().optional(),
  labor_support_amount: z.number().optional(),
  total_hours: z.number().optional(),
  hourly_rate: z.number().optional(),
  deposit_type: z.enum(['percent', 'flat']).optional(),
  deposit_value: z.number().optional(),
  installments_count: z.number().optional(),
  cadence: z.enum(['monthly', 'biweekly']).optional(),
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
  const [calculatedAmounts, setCalculatedAmounts] =
    useState<CalculatedAmounts | null>(null);
  const [signNowFields, setSignNowFields] = useState<any>(null);
  const [contractData, setContractData] = useState<ContractInput | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>(
    []
  );
  const [applyAdminFee, setApplyAdminFee] = useState(false);
  const [adminFeeInstallments] = useState(2); // installments are configured in step 2
  const [discountState, setDiscountState] = useState({
    totalBeforeDiscount: 0,
    discount: 0,
    discountRate: 0,
    totalAfterDiscount: 0,
    discountApplied: false,
  });

  // Load clients when dialog opens
  useEffect(() => {
    if (open) {
      console.log('🔍 Loading clients for contract dialog...');
      getClients();
      // Remove focus from any input field when dialog opens
      setTimeout(() => {
        if (
          document.activeElement &&
          document.activeElement instanceof HTMLElement
        ) {
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
      firstClient: clients?.[0],
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

  // Helpers for multi-service selection and totals
  const computeServiceAmount = (svc: ServiceSelection) => {
    if (svc.type === 'flat') return Number(svc.amount || 0);
    const rate = Number(svc.hourlyRate || 0);
    const hours = Number(svc.totalHours || 0);
    return rate * hours;
  };

  const hasFlatServices = selectedServices.some((s) => s.type === 'flat');
  const hasHourlyOnly =
    selectedServices.length > 0 &&
    selectedServices.every((s) => s.type === 'hourly');
  const shouldUseDepositPlan = hasFlatServices || applyAdminFee; // treat admin fee like a flat charge for deposit/installments

  const isServicesValid = () => {
    if (selectedServices.length === 0) return false;
    return selectedServices.every((s) => {
      if (s.type === 'flat') return !!s.amount && s.amount > 0;
      return (
        !!s.hourlyRate && s.hourlyRate > 0 && !!s.totalHours && s.totalHours > 0
      );
    });
  };

  const toggleService = (svc: ServiceSelection) => {
    setSelectedServices((prev) => {
      const exists = prev.find((p) => p.id === svc.id);
      if (exists) return prev.filter((p) => p.id !== svc.id);
      if (svc.type === 'flat') return [...prev, { ...svc, amount: 0 }];
      return [...prev, { ...svc, hourlyRate: 0, totalHours: 0 }];
    });
  };

  const updateServiceField = (
    id: string,
    field: keyof ServiceSelection,
    value: number
  ) => {
    setSelectedServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Calculate total contract amount based on selected services (with multi-service discount)
  useEffect(() => {
    const info = applyMultiServiceDiscount(selectedServices);
    setDiscountState(info);
    const hasAnyService = selectedServices.length > 0;
    const totalWithAdmin =
      (hasAnyService ? info.totalAfterDiscount : 0) + (applyAdminFee ? 150 : 0);
    setCalculatedTotal(totalWithAdmin);
  }, [selectedServices, applyAdminFee]);

  const calculateAmounts = async (data: ContractFormData) => {
    setLoading(true);
    try {
      console.log(
        'Calculating contract amounts with services:',
        selectedServices,
        'form:',
        data
      );

      // Recompute totals to ensure discount and admin fee are reflected
      const discountInfo = applyMultiServiceDiscount(selectedServices);
      const totalAmount =
        discountInfo.totalAfterDiscount + (applyAdminFee ? 150 : 0);

      if (shouldUseDepositPlan) {
        const depositValue = data.deposit_value || 0;
        const installmentsCount = data.installments_count || 3;
        const depositAmount =
          (data.deposit_type || 'percent') === 'percent'
            ? (totalAmount * depositValue) / 100
            : depositValue;
        const balanceAmount = Math.max(totalAmount - depositAmount, 0);
        const installmentAmount =
          installmentsCount > 0 ? balanceAmount / installmentsCount : 0;

        const localAmounts: CalculatedAmounts = {
          total_amount: totalAmount,
          deposit_amount: depositAmount,
          balance_amount: balanceAmount,
          installments_amounts:
            Array(installmentsCount).fill(installmentAmount),
        };

        const totalHoursSum = selectedServices
          .filter((s) => s.type === 'hourly')
          .reduce((sum, s) => sum + Number(s.totalHours || 0), 0);

        const localSignNowFields = {
          total_hours: totalHoursSum.toString(),
          hourly_rate_fee: '0.00',
          deposit: depositAmount.toFixed(2),
          overnight_fee_amount: '0.00',
          total_amount: totalAmount.toFixed(2),
        };

        setCalculatedAmounts(localAmounts);
        setSignNowFields(localSignNowFields);
        setContractData({
          total_hours: data.total_hours,
          hourly_rate: data.hourly_rate,
          deposit_type: data.deposit_type,
          deposit_value: data.deposit_value,
          installments_count: data.installments_count,
          cadence: data.cadence,
          total_amount: totalAmount,
        });
        setStep('calculation');
        toast.success('Contract calculated successfully!');
      } else {
        const localAmounts: CalculatedAmounts = {
          total_amount: totalAmount,
          deposit_amount: 0,
          balance_amount: totalAmount,
          installments_amounts: [totalAmount],
        };

        const totalHoursSum = selectedServices
          .filter((s) => s.type === 'hourly')
          .reduce((sum, s) => sum + Number(s.totalHours || 0), 0);

        const localSignNowFields = {
          total_hours: totalHoursSum.toString(),
          hourly_rate_fee: '0.00',
          deposit: '0.00',
          overnight_fee_amount: '0.00',
          total_amount: totalAmount.toFixed(2),
        };

        setCalculatedAmounts(localAmounts);
        setSignNowFields(localSignNowFields);
        setContractData({
          total_hours: data.total_hours,
          hourly_rate: data.hourly_rate,
          total_amount: totalAmount,
        });
        setStep('calculation');
        toast.success('Contract calculated successfully!');
      }
    } catch (error) {
      console.error('Calculation failed:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to calculate contract amounts'
      );
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
        name: `${selectedClient.firstname} ${selectedClient.lastname}`,
      };

      // Prepare contract data for new API
      const contractDataForAPI: ContractData = {
        clientName: clientData.name,
        clientEmail: clientData.email,
        totalInvestment: `$${calculatedAmounts?.total_amount?.toFixed(2) || '0.00'}`,
        depositAmount: `$${calculatedAmounts?.deposit_amount?.toFixed(2) || '0.00'}`,
        serviceType: 'Labor Support Services',
        // Multi-service payload
        selectedServices: selectedServices.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          amount: s.amount,
          hourlyRate: s.hourlyRate,
          totalHours: s.totalHours,
        })),
        totalAmount: calculatedTotal,
        adminFee: applyAdminFee ? 150 : 0,
        adminFeeInstallments: applyAdminFee ? adminFeeInstallments : undefined,
        remainingBalance: calculatedAmounts?.balance_amount
          ? `$${calculatedAmounts.balance_amount.toFixed(2)}`
          : undefined,
        contractDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 30 days from now
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 90 days from now
      };

      // Add Postpartum-specific fields only for Postpartum contracts
      console.log('🔍 Conditional Logic Debug:');
      console.log('- selectedServices:', selectedServices);

      const anyHourly = selectedServices.some((s) => s.type === 'hourly');
      if (anyHourly) {
        console.log('✅ Adding Postpartum fields to API data');
        contractDataForAPI.totalHours =
          contractForm.watch('total_hours')?.toString() || '0';
        contractDataForAPI.hourlyRate =
          contractForm.watch('hourly_rate')?.toString() || '0';
        contractDataForAPI.overnightFee = '0.00'; // Default overnight fee
        console.log('- Added totalHours:', contractDataForAPI.totalHours);
        console.log('- Added hourlyRate:', contractDataForAPI.hourlyRate);
        console.log('- Added overnightFee:', contractDataForAPI.overnightFee);
      } else {
        console.log(
          '❌ Not adding hourly fields - no hourly services selected'
        );
      }

      console.log('🔍 Frontend Contract Fields Debug:');
      console.log('- totalAmount:', calculatedTotal);
      console.log(
        '- total_hours from form:',
        contractForm.watch('total_hours')
      );
      console.log(
        '- hourly_rate from form:',
        contractForm.watch('hourly_rate')
      );
      console.log('- Form values:', contractForm.getValues());
      console.log('- anyHourly (has hourly services):', anyHourly);
      console.log('- Will add hourly fields:', anyHourly);
      console.log('- Sending contract data to new API:', contractDataForAPI);
      console.log('- API data keys:', Object.keys(contractDataForAPI));
      console.log('- Hourly fields included:', anyHourly);

      // Verify Postpartum fields are actually in the data
      console.log('🔍 Postpartum Fields Verification:');
      console.log('- totalHours in data:', 'totalHours' in contractDataForAPI);
      console.log('- hourlyRate in data:', 'hourlyRate' in contractDataForAPI);
      console.log(
        '- overnightFee in data:',
        'overnightFee' in contractDataForAPI
      );
      console.log('- totalHours value:', contractDataForAPI.totalHours);
      console.log('- hourlyRate value:', contractDataForAPI.hourlyRate);
      console.log('- overnightFee value:', contractDataForAPI.overnightFee);

      const response = await generateContract(contractDataForAPI);
      if (response.success) {
        // Store contract ID and calculated amounts for payment integration
        setContractId(response.data.contractId);
        setStep('sent');
        toast.success(
          `Contract generated successfully! Document ID: ${response.data.contractId}. Client will receive an email to sign the contract.`
        );

        // Log the response for debugging
        console.log('Contract generated successfully:', {
          contractId: response.data.contractId,
          signNow: response.data.signNow,
          emailDelivery: response.data.emailDelivery,
        });

        // Store contract verification data in localStorage for future payment integration
        const contractVerificationData = {
          contractId: response.data.contractId,
          clientEmail: clientData.email,
          clientName: clientData.name,
          timestamp: Date.now(),
          amounts: calculatedAmounts,
        };
        localStorage.setItem(
          'contractVerification',
          JSON.stringify(contractVerificationData)
        );

        console.log(
          'Stored contract verification data:',
          contractVerificationData
        );
      } else {
        toast.error('Failed to generate contract');
      }
    } catch (error) {
      console.error('Failed to generate contract:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate contract'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('services');
    setCalculatedTotal(0);
    setSearchTerm('');
    setSelectedClient(null);
    setSelectedServices([]);
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
        day: 'numeric',
      }),
      amount: 0, // Will be calculated separately
    });

    // Calculate subsequent payment dates
    for (let i = 1; i <= installmentsCount; i++) {
      const paymentDate = new Date(today);

      if (cadence === 'monthly') {
        paymentDate.setMonth(paymentDate.getMonth() + i);
      } else if (cadence === 'biweekly') {
        paymentDate.setDate(paymentDate.getDate() + i * 14);
      }

      dates.push({
        label: `Payment ${i}`,
        date: paymentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        amount: 0, // Will be calculated separately
      });
    }

    return dates;
  };

  // Get deposit charging information
  const getDepositInfo = (
    depositType: string,
    depositValue: number | string,
    laborSupportAmount: number
  ) => {
    // Ensure depositValue is a valid number
    const numericDepositValue =
      typeof depositValue === 'string'
        ? parseFloat(depositValue) || 0
        : depositValue;

    if (depositType === 'percent') {
      return `Deposit of ${numericDepositValue}% ($${((laborSupportAmount * numericDepositValue) / 100).toFixed(2)}) will be charged immediately upon contract signing`;
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
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Calculator className='h-5 w-5' />
            Create Contract
          </DialogTitle>
          <DialogDescription>
            {step === 'services' && 'Select services and configure details'}
            {step === 'input' && 'Enter contract details to calculate amounts'}
            {step === 'calculation' &&
              'Review calculated amounts and payment schedule'}
            {step === 'client' &&
              'Enter client information to send the contract'}
            {step === 'sent' && 'Contract has been sent successfully!'}
          </DialogDescription>

          {/* Progress indicator */}
          <div className='flex items-center justify-center space-x-2 mt-4'>
            <div
              className={`w-3 h-3 rounded-full ${step === 'services' ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
            <div
              className={`w-3 h-3 rounded-full ${step === 'input' ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
            <div
              className={`w-3 h-3 rounded-full ${step === 'calculation' ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
            <div
              className={`w-3 h-3 rounded-full ${step === 'client' ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
            <div
              className={`w-3 h-3 rounded-full ${step === 'sent' ? 'bg-green-500' : 'bg-gray-300'}`}
            />
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Step 1: Services Selection (Multi-select) */}
          {step === 'services' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Select Services</h3>
                <div className='grid grid-cols-1 gap-3'>
                  {availableServices.map((svc) => {
                    const checked = !!selectedServices.find(
                      (s) => s.id === svc.id
                    );
                    const current = selectedServices.find(
                      (s) => s.id === svc.id
                    );
                    return (
                      <Card
                        key={svc.id}
                        className={`transition-all ${checked ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                      >
                        <CardContent className='p-4 space-y-3'>
                          <div className='flex items-center space-x-3'>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleService(svc)}
                            />
                            <div className='flex-1'>
                              <h4 className='font-medium'>{svc.name}</h4>
                              <p className='text-sm text-gray-600'>
                                {svc.type === 'flat'
                                  ? 'Flat amount service'
                                  : 'Hourly-based service'}
                              </p>
                            </div>
                          </div>
                          {checked && (
                            <div className='pl-8'>
                              {svc.type === 'flat' ? (
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm text-gray-500'>
                                    $
                                  </span>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    placeholder='0.00'
                                    value={
                                      current?.amount && current?.amount !== 0
                                        ? current?.amount
                                        : ''
                                    }
                                    onChange={(e) =>
                                      updateServiceField(
                                        svc.id,
                                        'amount',
                                        e.target.value === ''
                                          ? 0
                                          : Number(e.target.value)
                                      )
                                    }
                                    className='w-32 h-8 text-sm'
                                  />
                                  <span className='text-sm text-gray-500'>
                                    amount
                                  </span>
                                </div>
                              ) : (
                                <div className='grid grid-cols-2 gap-3'>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm text-gray-500'>
                                      $
                                    </span>
                                    <Input
                                      type='number'
                                      step='0.01'
                                      placeholder='0.00'
                                      value={
                                        current?.hourlyRate &&
                                          current?.hourlyRate !== 0
                                          ? current?.hourlyRate
                                          : ''
                                      }
                                      onChange={(e) =>
                                        updateServiceField(
                                          svc.id,
                                          'hourlyRate',
                                          e.target.value === ''
                                            ? 0
                                            : Number(e.target.value)
                                        )
                                      }
                                      className='w-24 h-8 text-sm'
                                    />
                                    <span className='text-sm text-gray-500'>
                                      /hour
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <Input
                                      type='number'
                                      placeholder='0'
                                      value={
                                        current?.totalHours &&
                                          current?.totalHours !== 0
                                          ? current?.totalHours
                                          : ''
                                      }
                                      onChange={(e) =>
                                        updateServiceField(
                                          svc.id,
                                          'totalHours',
                                          e.target.value === ''
                                            ? 0
                                            : Number(e.target.value)
                                        )
                                      }
                                      className='w-20 h-8 text-sm'
                                    />
                                    <span className='text-sm text-gray-500'>
                                      hours
                                    </span>
                                  </div>
                                </div>
                              )}
                              <div className='mt-2 text-xs text-gray-600'>
                                Service total: $
                                {computeServiceAmount(
                                  (current || svc) as ServiceSelection
                                ).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Administrative Fee (moved into Services step) */}
                <div className='mt-4 p-4 bg-blue-50/40 border border-blue-200 rounded-lg space-y-3'>
                  <label className='flex items-center gap-2 text-sm font-medium text-blue-900'>
                    <input
                      type='checkbox'
                      checked={applyAdminFee}
                      onChange={(e) => setApplyAdminFee(e.target.checked)}
                    />
                    Apply $150 Administrative Fee
                  </label>

                  {/* Installment details handled in the next step */}
                </div>

                {/* Total Calculation Display */}
                <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium text-blue-800'>
                      Total Contract Amount:
                    </span>
                    <span className='text-lg font-bold text-blue-900'>
                      ${calculatedTotal.toFixed(2)}
                    </span>
                  </div>
                  {discountState.discountApplied && (
                    <div className='mt-2 text-sm text-blue-700'>
                      Multi-Service Discount (10%): -$
                      {discountState.discount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              <div className='flex gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                  className='flex-1 h-11'
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('input')}
                  disabled={!(isServicesValid() || applyAdminFee)}
                  className='flex-1 h-11'
                >
                  Continue to Contract Details
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Service Details Input */}
          {step === 'input' && (
            <Form {...contractForm}>
              <form
                onSubmit={contractForm.handleSubmit(calculateAmounts)}
                className='space-y-6'
              >
                {/* Contract Summary */}
                <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                  <h4 className='text-sm font-medium text-gray-700 mb-3'>
                    Contract Summary
                  </h4>
                  <div className='space-y-2'>
                    {selectedServices.map((svc) => (
                      <div
                        key={svc.id}
                        className='flex justify-between text-sm'
                      >
                        <span className='text-gray-600'>
                          {svc.name}
                          {svc.type === 'hourly' &&
                            ` (${svc.hourlyRate || 0}/hr x ${svc.totalHours || 0}h)`}
                        </span>
                        <span className='font-medium'>
                          ${computeServiceAmount(svc).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {applyAdminFee && (
                      <div className='flex justify-between text-sm text-blue-800'>
                        <span>Administrative Fee</span>
                        <span className='font-medium'>$150.00</span>
                      </div>
                    )}
                    {discountState.discountApplied && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>
                          Multi-Service Discount (10%):
                        </span>
                        <span className='text-sm font-medium text-red-600'>
                          -{`$${discountState.discount.toFixed(2)}`}
                        </span>
                      </div>
                    )}
                    <div className='flex justify-between border-t pt-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        Total Contract Amount:
                      </span>
                      <span className='text-lg font-bold text-gray-900'>
                        ${calculatedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Plan Fields */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={contractForm.control}
                    name='deposit_type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deposit Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value as
                                | 'percent'
                                | 'flat';
                              console.log('Deposit type changed to:', value);
                              field.onChange(value);
                              // Reset deposit value when type changes
                              contractForm.setValue('deposit_value', 0);
                            }}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            <option value='percent'>Percentage</option>
                            <option value='flat'>Flat Amount</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contractForm.control}
                    name='deposit_value'
                    render={({ field }) => {
                      const depositType = contractForm.watch('deposit_type');
                      console.log('Current deposit type:', depositType);
                      return (
                        <FormItem>
                          <FormLabel>
                            Deposit Value (
                            {depositType === 'percent' ? '%' : '$'})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step={depositType === 'percent' ? '1' : '0.01'}
                              placeholder={
                                depositType === 'percent'
                                  ? 'Enter percentage value'
                                  : 'Enter deposit amount'
                              }
                              value={field.value === 0 ? '' : field.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty field and remove leading zeros
                                if (value === '') {
                                  field.onChange(0); // Set to 0 instead of empty string
                                } else {
                                  const cleanValue = value.replace(/^0+/, '');
                                  field.onChange(
                                    cleanValue === '' ? 0 : Number(cleanValue)
                                  );
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
                    name='installments_count'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Installments (2-5)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min='2'
                            max='5'
                            placeholder='3'
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty field and remove leading zeros
                              if (value === '') {
                                field.onChange('');
                              } else {
                                const cleanValue = value.replace(/^0+/, '');
                                field.onChange(
                                  cleanValue === '' ? 0 : Number(cleanValue)
                                );
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
                    name='cadence'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Cadence</FormLabel>
                        <FormControl>
                          <select
                            value={field.value || 'monthly'}
                            onChange={(e) => {
                              console.log(
                                'Cadence changed to:',
                                e.target.value
                              );
                              field.onChange(e.target.value);
                            }}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            <option value='monthly'>Monthly</option>
                            <option value='biweekly'>Bi-weekly</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Administrative Fee - moved to services step */}

                {/* For hourly-only selections, show simplified billing info */}
                {hasHourlyOnly && (
                  <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <div className='flex items-start gap-2'>
                      <Info className='h-4 w-4 text-green-600 mt-0.5' />
                      <div className='space-y-2'>
                        <h4 className='text-sm font-medium text-green-800'>
                          Hourly Billing Information
                        </h4>
                        <div className='text-sm text-green-700 space-y-1'>
                          <p>
                            • No deposit required - billing based on actual
                            hours worked
                          </p>
                          <p>
                            • Invoices will be sent after hours are completed
                          </p>
                          <p>• Payment due upon receipt of invoice</p>
                          <p>
                            • Hourly rate: $
                            {(contractForm.watch('hourly_rate') || 0).toFixed(
                              2
                            )}
                            /hour
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                {
                  <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <div className='flex items-start gap-2'>
                      <Info className='h-4 w-4 text-blue-600 mt-0.5' />
                      <div className='space-y-2'>
                        <h4 className='text-sm font-medium text-blue-800'>
                          Payment Information
                        </h4>
                        <div className='text-sm text-blue-700 space-y-1'>
                          <p>
                            •{' '}
                            {getDepositInfo(
                              contractForm.watch('deposit_type') || 'percent',
                              contractForm.watch('deposit_value') || 0,
                              calculatedTotal + (applyAdminFee ? 150 : 0)
                            )}
                          </p>
                          <p>
                            • First payment (deposit) will be charged
                            immediately upon contract signing
                          </p>
                          <p>
                            •{' '}
                            {getPaymentTiming(
                              contractForm.watch('cadence') || 'monthly'
                            )}
                          </p>
                          <p>
                            • Payments are scheduled as per your selected
                            cadence
                          </p>
                          <p>
                            • All payments are processed securely through Stripe
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <DialogFooter className='pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setStep('services')}
                    className='flex-1 h-12'
                  >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back to Services
                  </Button>
                  <Button
                    type='submit'
                    disabled={loading}
                    className='flex-1 h-12 text-lg'
                    onClick={(e) => {
                      e.preventDefault();
                      const formData = contractForm.getValues();
                      console.log(
                        'Manual calculate button clicked with data:',
                        formData
                      );
                      calculateAmounts(formData);
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className='mr-2 h-5 w-5' />
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
            <div className='space-y-4'>
              <Card className='border-green-200 bg-green-50'>
                <CardHeader>
                  <CardTitle className='text-green-800 flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5' />
                    Contract Calculation Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex justify-between items-center p-3 bg-white rounded-lg border'>
                      <span className='font-medium'>
                        Total Contract Amount:
                      </span>
                      <Badge variant='outline' className='text-lg font-bold'>
                        ${calculatedAmounts.total_amount.toFixed(2)}
                      </Badge>
                    </div>

                    <div className='flex justify-between items-center p-3 bg-white rounded-lg border'>
                      <span className='font-medium'>Deposit Amount:</span>
                      <Badge
                        variant='destructive'
                        className='text-lg font-bold'
                      >
                        ${calculatedAmounts.deposit_amount.toFixed(2)}
                      </Badge>
                    </div>

                    <div className='flex justify-between items-center p-3 bg-white rounded-lg border'>
                      <span className='font-medium'>Balance Amount:</span>
                      <Badge variant='outline' className='text-lg font-bold'>
                        ${calculatedAmounts.balance_amount.toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  {/* Payment Schedule - Show when using deposit/installments (flat services or admin fee) */}
                  {shouldUseDepositPlan && (
                    <div className='mt-4'>
                      <h4 className='font-semibold mb-3'>
                        Labor Support Payment Schedule:
                      </h4>
                      <div className='space-y-2'>
                        {calculatedAmounts &&
                          getPaymentDates(
                            contractForm.watch('cadence') || 'monthly',
                            contractForm.watch('installments_count') || 3
                          ).map((payment, index) => (
                            <div
                              key={index}
                              className='flex justify-between items-center p-2 bg-white rounded border'
                            >
                              <div className='flex flex-col'>
                                <span className='font-medium'>
                                  {payment.label}
                                </span>
                                <span className='text-sm text-gray-500'>
                                  {payment.date}
                                </span>
                              </div>
                              <Badge variant='secondary'>
                                {index === 0
                                  ? `$${calculatedAmounts?.deposit_amount?.toFixed(2) || '0.00'}`
                                  : `$${calculatedAmounts?.installments_amounts?.[index - 1]?.toFixed(2) || '0.00'}`}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* For hourly-only selections, show billing information instead */}
                  {hasHourlyOnly && (
                    <div className='mt-4'>
                      <h4 className='font-semibold mb-3'>
                        Billing Information:
                      </h4>
                      <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                        <div className='space-y-2 text-sm text-green-800'>
                          <p>
                            • Total estimated amount:{' '}
                            <strong>
                              $
                              {calculatedAmounts?.total_amount?.toFixed(2) ||
                                '0.00'}
                            </strong>
                          </p>
                          <p>
                            • Hourly rate:{' '}
                            <strong>
                              $
                              {contractForm.watch('hourly_rate')?.toFixed(2) ||
                                '0.00'}
                              /hour
                            </strong>
                          </p>
                          <p>
                            • Estimated hours:{' '}
                            <strong>
                              {contractForm.watch('total_hours') || 0} hours
                            </strong>
                          </p>
                          <p>
                            • <strong>No payment schedule</strong> - billed as
                            services are completed
                          </p>
                          <p>• Invoices will be sent after hours are worked</p>
                          <p>• Payment due upon receipt of invoice</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Timing Information - Show when deposit is used */}
                  {shouldUseDepositPlan && (
                    <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                      <h4 className='text-sm font-semibold text-blue-800 mb-2'>
                        Labor Support Payment Schedule:
                      </h4>
                      <div className='space-y-1 text-sm text-blue-700'>
                        <p>
                          •{' '}
                          {getDepositInfo(
                            contractForm.watch('deposit_type') || 'percent',
                            contractForm.watch('deposit_value') || 0,
                            calculatedAmounts.total_amount
                          )}
                        </p>
                        <p>
                          • First payment (deposit) will be charged immediately
                          upon contract signing
                        </p>
                        <p>
                          •{' '}
                          {getPaymentTiming(
                            contractForm.watch('cadence') || 'monthly'
                          )}
                        </p>
                        {discountState.discountApplied && (
                          <p>
                            • Multi‑Service Discount (10%) applied to services
                            total
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SignNow Fields Preview */}
                  <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                    <h4 className='text-sm font-semibold text-blue-800 mb-2'>
                      Contract Details:
                    </h4>
                    <div className='space-y-1 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-blue-700'>Total Hours:</span>
                        <span className='font-medium'>
                          {signNowFields.total_hours}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-blue-700'>Hourly Rate:</span>
                        <span className='font-medium'>
                          ${signNowFields.hourly_rate_fee}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-blue-700'>Deposit:</span>
                        <span className='font-medium'>
                          ${signNowFields.deposit}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-blue-700'>Total Amount:</span>
                        <span className='font-medium'>
                          ${signNowFields.total_amount}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className='flex gap-3 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setStep('input')}
                  className='flex-1 h-11'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Edit Details
                </Button>
                <Button
                  onClick={() => setStep('client')}
                  className='flex-1 h-11'
                >
                  Continue to Client Info
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Client Information */}
          {step === 'client' && (
            <div className='space-y-4'>
              <div className='space-y-4'>
                <div>
                  <Label className='text-sm font-medium'>Search Clients</Label>
                  <div className='relative mt-2'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                    <Input
                      type='text'
                      placeholder='Search by name or email...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>

                {/* Client List */}
                <div className='max-h-60 overflow-y-auto border rounded-lg'>
                  {clientsLoading ? (
                    <div className='p-4 text-center text-gray-500'>
                      Loading clients...
                    </div>
                  ) : (
                    (clients as any[])
                      .filter((c: any) => {
                        const st = (c.status || c.user?.status || '')
                          .toString()
                          .toLowerCase();
                        return st === 'contract';
                      })
                      .filter(
                        (client) =>
                          !searchTerm ||
                          `${client.user.firstname} ${client.user.lastname}`
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          client.user.email
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((client) => (
                        <div
                          key={client.id}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedClient?.id === client.id
                              ? 'bg-blue-50 border-blue-200'
                              : ''
                            }`}
                          onClick={() => {
                            setSelectedClient(client);
                            clientForm.setValue(
                              'email',
                              client.user.email || ''
                            );
                            clientForm.setValue(
                              'name',
                              `${client.user.firstname} ${client.user.lastname}`
                            );
                          }}
                        >
                          <div className='flex justify-between items-center'>
                            <div>
                              <p className='font-medium text-gray-900'>
                                {client.user.firstname} {client.user.lastname}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {client.user.email}
                              </p>
                            </div>
                            {selectedClient?.id === client.id && (
                              <CheckCircle className='h-5 w-5 text-blue-600' />
                            )}
                          </div>
                        </div>
                      ))
                  )}

                  {!clientsLoading && clients.length === 0 && (
                    <div className='p-4 text-center text-gray-500'>
                      No clients found. Please add clients first.
                    </div>
                  )}

                  {!clientsLoading &&
                    clients.length > 0 &&
                    (clients as any[])
                      .filter((c: any) => {
                        const st = (c.status || c.user?.status || '')
                          .toString()
                          .toLowerCase();
                        return st === 'contract';
                      })
                      .filter(
                        (client) =>
                          !searchTerm ||
                          `${client.user.firstname} ${client.user.lastname}`
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          client.user.email
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                      <div className='p-4 text-center text-gray-500'>
                        No clients found matching your search.
                      </div>
                    )}
                </div>

                {/* Selected Client Info */}
                {selectedClient && (
                  <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                    <p className='text-sm font-medium text-green-800'>
                      Selected Client:
                    </p>
                    <p className='text-green-700'>
                      {selectedClient.firstname} {selectedClient.lastname} (
                      {selectedClient.email})
                    </p>
                  </div>
                )}
              </div>

              <div className='flex gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setStep('calculation')}
                  className='flex-1 h-11'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Calculation
                </Button>
                <Button
                  type='button'
                  onClick={sendContract}
                  disabled={loading || !selectedClient}
                  className='flex-1 h-11'
                >
                  {loading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending Contract...
                    </>
                  ) : (
                    <>
                      <Send className='mr-2 h-4 w-4' />
                      Send Contract for Signature
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'sent' && (
            <div className='text-center space-y-4'>
              <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                <CheckCircle className='h-8 w-8 text-green-600' />
              </div>

              <div className='space-y-2'>
                <h3 className='text-lg font-semibold text-green-800'>
                  Contract Sent Successfully via SignNow!
                </h3>
                <p className='text-gray-600'>
                  The contract has been generated with all calculated amounts
                  and sent to the client for signature via SignNow.
                </p>
                <p className='text-sm text-gray-500'>
                  The client will receive an email with instructions to sign the
                  contract through SignNow. After signing, they will be directed
                  to make the deposit payment.
                </p>
                {contractId && (
                  <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                    <p className='text-sm text-blue-800'>
                      <strong>Contract ID:</strong> {contractId}
                    </p>
                    <p className='text-xs text-blue-600 mt-1'>
                      This ID can be used to create payment intents after the
                      contract is signed.
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={resetForm} className='w-full h-12 text-lg'>
                Create Another Contract
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
