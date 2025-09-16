import { Button } from '@/common/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Input } from '@/common/components/ui/input';
import { Client } from '@/features/clients/data/schema';
import { signNowService, type SignNowClient } from '@/services/signNowService';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  clients: Client[];
}

export const SelectClientModal: React.FC<Props> = ({
  open,
  onOpenChange,
  onSuccess,
  clients,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Dummy contract templates for demo
  const contractTemplates = [
    { id: 'postpartum', name: 'Postpartum Support Contract', description: 'Comprehensive postpartum care services' },
    { id: 'doula', name: 'Labor Doula Contract', description: 'Full labor and birth support services' },
    { id: 'lactation', name: 'Lactation Support Contract', description: 'Breastfeeding and lactation consultation' },
    { id: 'overnight', name: 'Overnight Care Contract', description: 'Overnight newborn care services' },
    { id: 'consultation', name: 'Consultation Contract', description: 'One-time consultation services' },
  ];

  const filteredClients = clients.filter(
    (client) =>
      `${client.firstname} ${client.lastname}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendContract = async () => {
    if (!selectedClient || !selectedTemplate) return;

    try {
      setLoading(true);
      const selectedTemplateData = contractTemplates.find(t => t.id === selectedTemplate);
      const client: SignNowClient = {
        email: selectedClient.email || '',
        name: `${selectedClient.firstname} ${selectedClient.lastname}`,
      };

      const result = await signNowService.sendInvitation(client);

      if (result.success) {
        toast.success('Contract sent successfully!');
        onSuccess?.();
        onOpenChange(false);
        
        // Navigate to payment page with contract details
        const selectedTemplateData = contractTemplates.find(t => t.id === selectedTemplate);
        const queryParams = new URLSearchParams({
          contractId: `CON-${Date.now()}`,
          clientName: `${selectedClient.firstname} ${selectedClient.lastname}`,
          serviceType: selectedTemplateData?.name || 'Doula Services',
          amount: '120000', // $1,200.00 in cents to match contract terms
        });
        navigate(`/payment?${queryParams.toString()}`);
      } else {
        toast.error(result.error || 'Failed to send contract');
      }
    } catch (error) {
      console.error('Failed to send contract:', error);
      toast.error('Failed to send contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Send Contract</DialogTitle>
          <DialogDescription>
            Select a contract template and client to send a contract invitation.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Template Selection */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Contract Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
            >
              <option value=''>Select a contract template...</option>
              {contractTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Client Search */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Select Client</label>
            <Input
              placeholder='Search by name or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='max-h-60 overflow-y-auto space-y-2'>
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className={`p-3 cursor-pointer rounded-lg border transition-colors hover:bg-gray-50 ${selectedClient?.id === client.id
                  ? 'bg-teal-50 border-teal-200'
                  : 'border-gray-200'
                  }`}
                onClick={() => setSelectedClient(client)}
              >
                <div className='font-medium text-teal-700'>
                  {client.firstname} {client.lastname}
                </div>
                <div className='text-sm text-gray-600'>{client.email}</div>
                <div className='text-xs text-gray-500 mt-1'>
                  Service: {client.serviceNeeded} • Status: {client.status}
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div className='text-center py-4 text-gray-500'>
                No clients found
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendContract}
            disabled={!selectedClient || !selectedTemplate || loading}
          >
            {loading ? (
              <div className='flex items-center'>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Sending...
              </div>
            ) : (
              'Send Contract'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
