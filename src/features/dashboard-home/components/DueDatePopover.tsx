// src/features/dashboard-home/components/DueDatePopover.tsx
import { useState } from 'react';
import { DueDateEvent } from '@/common/hooks/dashboard/useDueDateCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/common/components/ui/popover';
import { Button } from '@/common/components/ui/button';
import { Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
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

/**
 * Popover that displays due date events for a specific day
 */
export function DueDatePopover({ date, events, children, open, onOpenChange }: DueDatePopoverProps) {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);
  const { getClientById } = useClients();

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
    try {
      const client = await getClientById(clientId);
      if (client) {
        setSelectedClient(client as unknown as Client);
        setClientModalOpen(true);
        onOpenChange(false);
      } else {
        toast.error('Client not found');
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

