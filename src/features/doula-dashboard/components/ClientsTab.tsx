import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Input } from '@/common/components/ui/input';
import {
  getAssignedClients,
  type AssignedClientLite,
  type AssignedClientDetailed,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import { Users, Mail, Phone, Calendar, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface ClientsTabProps {
  onClientSelect?: (clientId: string) => void;
}

export default function ClientsTab({ onClientSelect }: ClientsTabProps) {
  const [clients, setClients] = useState<(AssignedClientLite | AssignedClientDetailed)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailedView, setDetailedView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, [detailedView]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const data = await getAssignedClients(detailedView);
      console.log('ClientsTab - Received clients data:', data);
      console.log('ClientsTab - Is array?', Array.isArray(data));
      console.log('ClientsTab - Data length:', Array.isArray(data) ? data.length : 'N/A');
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setClients(data);
        console.log('ClientsTab - Set clients:', data);
      } else {
        console.error('Invalid response format:', data);
        setClients([]);
        toast.error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Failed to fetch clients:', error);
      setClients([]); // Set empty array on error
      toast.error(error.message || 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const firstname = (client.firstname || '').toLowerCase();
    const lastname = (client.lastname || '').toLowerCase();
    const email = (client.email || '').toLowerCase();
    const phone = (client.phone || '').toLowerCase();
    return (
      firstname.includes(query) ||
      lastname.includes(query) ||
      email.includes(query) ||
      phone.includes(query)
    );
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'postpartum':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500'>Loading clients...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>Assigned Clients</h2>
          <p className='text-sm text-gray-600 mt-1'>
            View and manage your assigned clients
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant={detailedView ? 'outline' : 'default'}
            size='sm'
            onClick={() => setDetailedView(false)}
          >
            Lite View
          </Button>
          <Button
            variant={detailedView ? 'default' : 'outline'}
            size='sm'
            onClick={() => setDetailedView(true)}
          >
            Detailed View
          </Button>
        </div>
      </div>

      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
        <Input
          placeholder='Search clients by name, email, or phone...'
          className='pl-10'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className='text-center py-12'>
            <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500 mb-4'>
              {searchQuery ? 'No clients found matching your search' : 'No clients assigned yet'}
            </p>
            {searchQuery && (
              <Button variant='outline' onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredClients.map((client) => {
            const isDetailed = detailedView && 'address' in client;
            return (
              <Card
                key={client.id}
                className={`hover:shadow-md transition-shadow ${
                  selectedClient === client.id ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-lg'>
                        {client.firstname || 'No'} {client.lastname || 'Name'}
                      </CardTitle>
                      <Badge className={`mt-2 ${getStatusBadgeColor(client.status || 'matching')}`}>
                        {client.status || 'matching'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {client.email && (
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Mail className='h-4 w-4' />
                      <span className='truncate'>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Phone className='h-4 w-4' />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.dueDate && (
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Calendar className='h-4 w-4' />
                      <span>Due: {format(new Date(client.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  {isDetailed && (
                    <div className='pt-2 border-t space-y-2'>
                      {client.address && (
                        <p className='text-sm text-gray-600'>
                          <span className='font-medium'>Address:</span> {client.address}
                        </p>
                      )}
                      {(client.city || client.state) && (
                        <p className='text-sm text-gray-600'>
                          {client.city}
                          {client.city && client.state && ', '}
                          {client.state} {client.zipCode}
                        </p>
                      )}
                      {client.hospital && (
                        <p className='text-sm text-gray-600'>
                          <span className='font-medium'>Hospital:</span> {client.hospital}
                        </p>
                      )}
                    </div>
                  )}
                  <div className='flex gap-2 pt-2'>
                    {onClientSelect && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1'
                        onClick={() => {
                          setSelectedClient(client.id);
                          onClientSelect(client.id);
                        }}
                      >
                        <Eye className='h-4 w-4 mr-1' />
                        View Activities
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

