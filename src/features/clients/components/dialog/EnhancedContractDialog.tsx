import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { useClients } from '@/common/hooks/clients/useClients';
import {
  calculateContractAmounts,
  CalculatedAmounts,
  ContractInput,
  sendContractForSignature
} from '@/common/utils/createContract';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle, Loader2, Search, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Form schemas
const contractInputSchema = z.object({
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

type Step = 'input' | 'calculation' | 'client' | 'sent';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedContractDialog({ open, onOpenChange }: Props) {
  const { clients, getClients, isLoading: clientsLoading } = useClients();
  const [step, setStep] = useState<Step>('input');
  const [loading, setLoading] = useState(false);
  const [calculatedAmounts, setCalculatedAmounts] = useState<CalculatedAmounts | null>(null);
  const [signNowFields, setSignNowFields] = useState<any>(null);
  const [contractData, setContractData] = useState<ContractInput | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);

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
      total_hours: 120,
      hourly_rate: 35,
      deposit_type: 'percent',
      deposit_value: 15,
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

  const calculateAmounts = async (data: ContractFormData) => {
    setLoading(true);
    try {
      const response = await calculateContractAmounts(data);
      if (response.success) {
        setCalculatedAmounts(response.amounts);
        setSignNowFields(response.fields);
        setContractData(data);
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
    setStep('input');
    setCalculatedAmounts(null);
    setContractData(null);
    setContractId(null);
    contractForm.reset();
    clientForm.reset();
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Create Postpartum Care Contract
          </DialogTitle>
          <DialogDescription>
            {step === 'input' && 'Enter service details to calculate contract amounts'}
            {step === 'calculation' && 'Review calculated amounts and payment schedule'}
            {step === 'client' && 'Enter client information to send the contract'}
            {step === 'sent' && 'Contract has been sent successfully!'}
          </DialogDescription>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${step === 'input' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'calculation' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'client' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'sent' ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Service Details Input */}
          {step === 'input' && (
            <Form {...contractForm}>
              <form onSubmit={contractForm.handleSubmit(calculateAmounts)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={contractForm.control}
                    name="total_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            autoFocus={false}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              const cleanValue = value.replace(/^0+/, '') || '0';
                              field.onChange(Number(cleanValue));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contractForm.control}
                    name="hourly_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="35.00"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              const cleanValue = value.replace(/^0+/, '') || '0';
                              field.onChange(Number(cleanValue));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              placeholder={depositType === 'percent' ? '15' : '500.00'}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Remove leading zeros and convert to number
                                const cleanValue = value.replace(/^0+/, '') || '0';
                                field.onChange(Number(cleanValue));
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
                              const cleanValue = value.replace(/^0+/, '') || '0';
                              field.onChange(Number(cleanValue));
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment cadence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
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

          {/* Step 2: Calculation Preview */}
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
                      {calculatedAmounts.installments_amounts.map((amount, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                          <span>Payment {index + 1}:</span>
                          <Badge variant="secondary">${amount.toFixed(2)}</Badge>
                        </div>
                      ))}
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

          {/* Step 3: Client Information */}
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
                      `${client.firstname} ${client.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((client) => (
                      <div
                        key={client.id}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedClient?.id === client.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        onClick={() => {
                          setSelectedClient(client);
                          clientForm.setValue('email', client.email || '');
                          clientForm.setValue('name', `${client.firstname} ${client.lastname}`);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {client.firstname} {client.lastname}
                            </p>
                            <p className="text-sm text-gray-500">{client.email}</p>
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
                    `${client.firstname} ${client.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
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

          {/* Step 4: Success */}
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
