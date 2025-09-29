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
  calculateContractAmounts,
  CalculatedAmounts,
  ContractInput,
  sendContractForSignature
} from '@/common/utils/createContract';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle, Info, Loader2, Search, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Available services with pricing
const AVAILABLE_SERVICES = [
  { id: 'postpartum', name: 'Postpartum Support', baseRate: 35, description: 'Comprehensive postpartum care services' },
  { id: 'labor', name: 'Labor Support', baseRate: 40, description: 'Full labor and birth support services' },
  { id: 'lactation', name: 'Lactation Support', baseRate: 30, description: 'Breastfeeding and lactation consultation' },
  { id: 'overnight', name: 'Overnight Care', baseRate: 45, description: 'Overnight newborn care services' },
  { id: 'consultation', name: 'Consultation', baseRate: 25, description: 'One-time consultation services' },
];

// Enhanced form schemas
const contractInputSchema = z.object({
  selected_services: z.array(z.string()).min(1, 'Please select at least one service'),
  total_hours: z.number().min(1, 'Total hours must be at least 1'),
  hourly_rate: z.number().min(1, 'Hourly rate must be at least $1'),
  deposit_type: z.enum(['percent', 'flat']),
  deposit_value: z.number().min(1, 'Deposit value must be at least 1'),
  installments_count: z.number().min(2, 'Minimum 2 installments').max(5, 'Maximum 5 installments'),
  cadence: z.enum(['monthly', 'biweekly']),
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
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceDiscount, setServiceDiscount] = useState(0);
  const [manualDiscount, setManualDiscount] = useState(false);
  const [discountedService, setDiscountedService] = useState<string | null>(null);
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});
  const [servicePricingType, setServicePricingType] = useState<Record<string, 'hourly' | 'fixed'>>({});
  const [serviceHours, setServiceHours] = useState<Record<string, number>>({});
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

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
      selected_services: [],
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

  // Manual discount control - no automatic discount
  useEffect(() => {
    // Reset discount when services change
    setServiceDiscount(0);
    setManualDiscount(false);
    setDiscountedService(null);

    // Initialize prices, pricing types, and hours for new services
    const newPrices = { ...servicePrices };
    const newPricingTypes = { ...servicePricingType };
    const newHours = { ...serviceHours };
    selectedServices.forEach(serviceId => {
      if (!newPrices[serviceId]) {
        newPrices[serviceId] = 0; // Start with 0, let user enter their own price
      }
      if (!newPricingTypes[serviceId]) {
        newPricingTypes[serviceId] = 'hourly'; // Default to hourly
      }
      if (!newHours[serviceId]) {
        newHours[serviceId] = 0; // Default to 0 hours
      }
    });
    setServicePrices(newPrices);
    setServicePricingType(newPricingTypes);
    setServiceHours(newHours);
  }, [selectedServices]);

  // Calculate total contract amount based on services
  useEffect(() => {
    if (selectedServices.length > 0) {
      let totalAmount = 0;
      let totalHours = 0;

      selectedServices.forEach(serviceId => {
        const servicePrice = servicePrices[serviceId] || 0;
        const pricingType = servicePricingType[serviceId] || 'hourly';
        const hours = serviceHours[serviceId] || 0;

        if (pricingType === 'fixed') {
          // Fixed pricing - use the price as-is
          let finalPrice = servicePrice;
          if (discountedService === serviceId && manualDiscount) {
            finalPrice = servicePrice * 0.9; // Apply 10% discount
          }
          totalAmount += finalPrice;
        } else {
          // Hourly pricing - multiply by hours
          let finalRate = servicePrice;
          if (discountedService === serviceId && manualDiscount) {
            finalRate = servicePrice * 0.9; // Apply 10% discount
          }
          totalAmount += finalRate * hours;
          totalHours += hours;
        }
      });

      setCalculatedTotal(totalAmount);

      // Update form with calculated values
      contractForm.setValue('total_hours', totalHours);
      contractForm.setValue('hourly_rate', totalHours > 0 ? totalAmount / totalHours : 0);
    }
  }, [selectedServices, servicePrices, servicePricingType, serviceHours, manualDiscount, discountedService, contractForm]);

  const calculateAmounts = async (data: ContractFormData) => {
    setLoading(true);
    try {
      console.log('Calculating contract amounts with data:', data);

      // Create the contract input with the calculated total
      const contractInput = {
        total_hours: data.total_hours,
        hourly_rate: data.hourly_rate,
        deposit_type: data.deposit_type,
        deposit_value: data.deposit_value,
        installments_count: data.installments_count,
        cadence: data.cadence,
      };

      console.log('Contract input:', contractInput);

      const response = await calculateContractAmounts(contractInput);
      console.log('Calculation response:', response);

      if (response.success) {
        setCalculatedAmounts(response.amounts);
        setSignNowFields(response.fields);
        setContractData(contractInput);
        setStep('calculation');
        toast.success('Contract amounts calculated successfully!');
      } else {
        toast.error('Failed to calculate contract amounts');
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

      const response = await sendContractForSignature(contractData, clientData);
      if (response.success) {
        // Store contract ID and calculated amounts for payment integration
        setContractId(response.envelopeId);
        setStep('sent');
        toast.success(`Contract sent successfully! Document ID: ${response.envelopeId}. Client will receive an email to sign the contract.`);

        // Log the response for debugging
        console.log('Contract sent successfully via SignNow:', {
          documentId: response.envelopeId,
          amounts: response.amounts,
          signnowResponse: response.signnow
        });

        // Store contract verification data in localStorage for future payment integration
        const contractVerificationData = {
          contractId: response.envelopeId,
          clientEmail: clientData.email,
          clientName: clientData.name,
          timestamp: Date.now(),
          amounts: response.amounts
        };
        localStorage.setItem('contractVerification', JSON.stringify(contractVerificationData));

        console.log('Stored contract verification data:', contractVerificationData);
      } else {
        toast.error('Failed to send contract');
      }
    } catch (error) {
      console.error('Failed to send contract:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send contract');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('services');
    setSelectedServices([]);
    setServiceDiscount(0);
    setManualDiscount(false);
    setDiscountedService(null);
    setServicePrices({});
    setServicePricingType({});
    setServiceHours({});
    setCalculatedTotal(0);
    setSearchTerm('');
    setSelectedClient(null);
    setCalculatedAmounts(null);
    setContractData(null);
    setContractId(null);
    contractForm.reset({
      selected_services: [],
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
  const getDepositInfo = (depositType: string, depositValue: number | string, totalAmount: number) => {
    // Ensure depositValue is a valid number
    const numericDepositValue = typeof depositValue === 'string' ? parseFloat(depositValue) || 0 : depositValue;

    if (depositType === 'percent') {
      return `Deposit of ${numericDepositValue}% ($${(totalAmount * numericDepositValue / 100).toFixed(2)}) will be charged immediately upon contract signing`;
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
            Create Postpartum Care Contract
          </DialogTitle>
          <DialogDescription>
            {step === 'services' && 'Select services and configure contract details'}
            {step === 'input' && 'Enter service details to calculate contract amounts'}
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
          {/* Step 1: Service Selection */}
          {step === 'services' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_SERVICES.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all ${selectedServices.includes(service.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                        }`}
                      onClick={() => {
                        if (selectedServices.includes(service.id)) {
                          setSelectedServices(prev => prev.filter(id => id !== service.id));
                        } else {
                          setSelectedServices(prev => [...prev, service.id]);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedServices.includes(service.id)}
                            onChange={() => { }} // Handled by card click
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedServices.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">Set pricing for selected services:</h4>

                      <div className="space-y-3">
                        {selectedServices.map(serviceId => {
                          const service = AVAILABLE_SERVICES.find(s => s.id === serviceId);
                          const pricingType = servicePricingType[serviceId] || 'hourly';
                          return service ? (
                            <div key={serviceId} className="p-3 bg-white border rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{service.name}</span>
                                <div className="flex items-center gap-2">
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="radio"
                                      name={`pricing-${serviceId}`}
                                      value="hourly"
                                      checked={pricingType === 'hourly'}
                                      onChange={() => setServicePricingType(prev => ({
                                        ...prev,
                                        [serviceId]: 'hourly'
                                      }))}
                                      className="text-blue-600"
                                    />
                                    <span className="text-xs text-gray-600">Hourly</span>
                                  </label>
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="radio"
                                      name={`pricing-${serviceId}`}
                                      value="fixed"
                                      checked={pricingType === 'fixed'}
                                      onChange={() => setServicePricingType(prev => ({
                                        ...prev,
                                        [serviceId]: 'fixed'
                                      }))}
                                      className="text-blue-600"
                                    />
                                    <span className="text-xs text-gray-600">Fixed</span>
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={servicePrices[serviceId] === 0 ? '' : servicePrices[serviceId] || ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setServicePrices(prev => ({
                                        ...prev,
                                        [serviceId]: value === '' ? 0 : Number(value)
                                      }));
                                    }}
                                    className="w-24 h-8 text-sm"
                                  />
                                  <span className="text-sm text-gray-500">
                                    {pricingType === 'hourly' ? '/hour' : 'total'}
                                  </span>
                                </div>

                                {pricingType === 'hourly' && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={serviceHours[serviceId] === 0 ? '' : serviceHours[serviceId] || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setServiceHours(prev => ({
                                          ...prev,
                                          [serviceId]: value === '' ? 0 : Number(value)
                                        }));
                                      }}
                                      className="w-16 h-8 text-sm"
                                    />
                                    <span className="text-sm text-gray-500">hours</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>

                      {/* Total Calculation Display */}
                      {calculatedTotal > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-blue-800">Total Contract Amount:</span>
                            <span className="text-lg font-bold text-blue-900">${calculatedTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      {selectedServices.length > 1 && (
                        <div className="space-y-3 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                Apply 10% discount to one service?
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={manualDiscount}
                                onCheckedChange={(checked) => setManualDiscount(checked as boolean)}
                              />
                              <span className="text-sm text-gray-600">Apply 10% discount</span>
                            </div>
                          </div>

                          {manualDiscount && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Which service should receive the discount?
                              </label>
                              <div className="grid grid-cols-1 gap-2">
                                {selectedServices.map(serviceId => {
                                  const service = AVAILABLE_SERVICES.find(s => s.id === serviceId);
                                  const servicePrice = servicePrices[serviceId] || 0;
                                  return service ? (
                                    <label key={serviceId} className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="discountedService"
                                        value={serviceId}
                                        checked={discountedService === serviceId}
                                        onChange={(e) => setDiscountedService(e.target.value)}
                                        className="text-blue-600"
                                      />
                                      <span className="text-sm text-gray-700">
                                        {service.name} (${servicePrice}/hour → ${(servicePrice * 0.9).toFixed(2)}/hour)
                                      </span>
                                    </label>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}

                          {manualDiscount && discountedService && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  10% discount applied to {AVAILABLE_SERVICES.find(s => s.id === discountedService)?.name}
                                </span>
                              </div>
                            </div>
                          )}
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
                  disabled={selectedServices.length === 0}
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
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Hours:</span>
                      <span className="text-sm font-medium">{contractForm.watch('total_hours') || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Rate:</span>
                      <span className="text-sm font-medium">${(contractForm.watch('hourly_rate') || 0).toFixed(2)}/hour</span>
                    </div>
                    <div className="flex justify-between md:col-span-2">
                      <span className="text-sm font-medium text-gray-700">Total Contract Amount:</span>
                      <span className="text-lg font-bold text-gray-900">${calculatedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

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

                {/* Payment Information */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-blue-800">Payment Information</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>• {getDepositInfo(contractForm.watch('deposit_type'), contractForm.watch('deposit_value') || 0, calculatedTotal)}</p>
                        <p>• First payment (deposit) will be charged immediately upon contract signing</p>
                        <p>• {getPaymentTiming(contractForm.watch('cadence'))}</p>
                        <p>• All payments are processed securely through Stripe</p>
                      </div>
                    </div>
                  </div>
                </div>

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

                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Payment Schedule:</h4>
                    <div className="space-y-2">
                      {calculatedAmounts && getPaymentDates(contractForm.watch('cadence'), contractForm.watch('installments_count')).map((payment, index) => (
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

                  {/* Payment Timing Information */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Payment Schedule:</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p>• {getDepositInfo(contractForm.watch('deposit_type'), contractForm.watch('deposit_value'), calculatedAmounts.total_amount)}</p>
                      <p>• First payment (deposit) will be charged immediately upon contract signing</p>
                      <p>• {getPaymentTiming(contractForm.watch('cadence'))}</p>
                    </div>
                  </div>

                  {/* SignNow Fields Preview */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">SignNow Fields (Auto-generated):</h4>
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
