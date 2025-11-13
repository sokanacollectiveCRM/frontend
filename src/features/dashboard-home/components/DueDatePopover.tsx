// src/features/dashboard-home/components/DueDatePopover.tsx
import { useState } from 'react';
import { DueDateEvent } from '@/common/hooks/dashboard/useDueDateCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/common/components/ui/popover';
import { Button } from '@/common/components/ui/button';
import { Calendar, Eye } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { LeadProfileModal } from '@/features/clients/components/dialog/LeadProfileModal';
import { useClients } from '@/common/hooks/clients/useClients';
import { Client } from '@/features/clients/data/schema';
import { toast } from 'sonner';

interface DueDatePopoverProps {
  date: Date;
  events: DueDateEvent[];
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dummy client data for demonstration (maps fake client IDs to full client objects)
const DUMMY_CLIENTS: Record<string, Partial<Client>> = {
  'client-1': {
    id: 'client-1',
    firstname: 'Sarah',
    lastname: 'Johnson',
    email: 'sarah.johnson@example.com',
    phoneNumber: '(555) 123-4567',
    preferred_name: 'Sarah',
    pronouns: 'She/Her',
    preferred_contact_method: 'Phone',
    address: '123 Main Street, Apt 4B',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    home_type: 'Apartment',
    services_interested: ['Labor Support', 'Postpartum Support', 'Lactation Support'],
    service_needed: 'Looking for comprehensive labor and postpartum support for first pregnancy',
    annual_income: '$45,000-$64,999',
    payment_method: 'Private Insurance',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    birth_location: 'Hospital',
    birth_hospital: 'Northwestern Memorial Hospital',
    number_of_babies: 'Singleton',
    provider_type: 'OB',
    pregnancy_number: 1,
    status: 'active',
    requestedAt: new Date(),
    updatedAt: new Date(),
  },
  'client-2': {
    id: 'client-2',
    firstname: 'Maria',
    lastname: 'Garcia',
    email: 'maria.garcia@example.com',
    phoneNumber: '(555) 234-5678',
    preferred_name: 'Mari',
    pronouns: 'She/Her',
    preferred_contact_method: 'Email',
    address: '456 Oak Avenue',
    city: 'Evanston',
    state: 'IL',
    zip_code: '60201',
    home_type: 'House',
    services_interested: ['Labor Support', '1st Night Care'],
    service_needed: 'Need support during labor and first night after birth',
    annual_income: '$25,000-$44,999',
    payment_method: 'Medicaid',
    due_date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    birth_location: 'Hospital',
    birth_hospital: 'Evanston Hospital',
    number_of_babies: 'Singleton',
    provider_type: 'Midwife',
    pregnancy_number: 2,
    status: 'contract',
    requestedAt: new Date(),
    updatedAt: new Date(),
  },
  'client-3': {
    id: 'client-3',
    firstname: 'Emily',
    lastname: 'Chen',
    email: 'emily.chen@example.com',
    phoneNumber: '(555) 345-6789',
    preferred_name: 'Emily',
    pronouns: 'She/Her',
    preferred_contact_method: 'Email',
    address: '789 Elm Street',
    city: 'Naperville',
    state: 'IL',
    zip_code: '60540',
    home_type: 'House',
    services_interested: ['Labor Support', 'Postpartum Support', 'Perinatal Education'],
    service_needed: 'First-time parent seeking education and comprehensive support',
    annual_income: '$65,000-$84,999',
    payment_method: 'Self-Pay',
    due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    birth_location: 'Birth Center',
    number_of_babies: 'Singleton',
    provider_type: 'Midwife',
    pregnancy_number: 1,
    status: 'matching',
    requestedAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * Popover that displays due date events for a specific day
 */
export function DueDatePopover({ date, events, children, open, onOpenChange }: DueDatePopoverProps) {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);
  const { getClientById } = useClients();
  const USE_DUMMY_DATA = true; // Set to false when backend is ready

  if (events.length === 0) {
    return <>{children}</>;
  }

  // Extract client name from title like "EDD – Baby Due (Client Name)"
  const parseClientName = (title: string): string => {
    const match = title.match(/\(([^)]+)\)/);
    return match ? match[1] : title;
  };

  const handleViewProfile = async (clientId?: string) => {
    if (!clientId) return;

    setLoadingClient(true);
    
    // Simulate loading delay for better UX demonstration
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Use dummy data for demonstration
      if (USE_DUMMY_DATA && DUMMY_CLIENTS[clientId]) {
        setSelectedClient(DUMMY_CLIENTS[clientId] as Client);
        setClientModalOpen(true);
        onOpenChange(false); // Close the date popover
      } else if (USE_DUMMY_DATA) {
        // Fallback dummy client if ID not found
        setSelectedClient({
          id: clientId,
          firstname: parseClientName(events.find(e => e.clientId === clientId)?.title || ''),
          lastname: '',
          email: 'demo@example.com',
          phoneNumber: '(555) 000-0000',
          status: 'active',
          requestedAt: new Date(),
          updatedAt: new Date(),
        } as Client);
        setClientModalOpen(true);
        onOpenChange(false);
      } else {
        // Fetch real client data from backend
        const client = await getClientById(clientId, true); // detailed=true
        if (client) {
          setSelectedClient(client as unknown as Client);
          setClientModalOpen(true);
          onOpenChange(false); // Close the date popover
        } else {
          toast.error('Client not found');
        }
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error('Failed to load client profile');
    } finally {
      setLoadingClient(false);
    }
  };

  const handleClientModalClose = (isOpen: boolean) => {
    setClientModalOpen(isOpen);
    if (!isOpen) {
      setSelectedClient(null);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {format(date, 'MMMM d, yyyy')}
              </h3>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {events.length} {events.length === 1 ? 'due date' : 'due dates'}
            </p>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`px-4 py-3 ${
                  index < events.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: event.color || '#34A853' }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {parseClientName(event.title)}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Expected Due Date
                    </p>
                    {event.clientId && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto p-0 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => handleViewProfile(event.clientId)}
                        disabled={loadingClient}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        {loadingClient ? 'Loading...' : 'View Client Profile'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Client Profile Modal */}
      <LeadProfileModal
        open={clientModalOpen}
        onOpenChange={handleClientModalClose}
        client={selectedClient}
      />
    </>
  );
}

