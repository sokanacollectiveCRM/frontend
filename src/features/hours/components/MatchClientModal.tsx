import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { getMatchingClients, matchDoulaWithClient, type MatchingClient } from '@/api/admin/adminService';
import { toast } from 'sonner';
import { Search, User, Mail, Phone, Calendar, Building2, ChevronDown, X } from 'lucide-react';
import { format } from 'date-fns';

interface MatchClientModalProps {
  doula: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MatchClientModal({
  doula,
  isOpen,
  onClose,
  onSuccess,
}: MatchClientModalProps) {
  const [clients, setClients] = useState<MatchingClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMatchingClients();
      // Reset form when modal opens
      setSelectedClientId('');
      setNotes('');
      setSearchTerm('');
      setError(null);
      setShowDropdown(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const fetchMatchingClients = async () => {
    try {
      setFetchingClients(true);
      const data = await getMatchingClients();
      setClients(data.data || []);
    } catch (err: any) {
      setError('Failed to load clients in matching phase');
      console.error('Error fetching matching clients:', err);
      toast.error(err.message || 'Failed to load clients');
    } finally {
      setFetchingClients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await matchDoulaWithClient(selectedClientId, doula.id, notes.trim() || undefined);
      
      toast.success(
        `Successfully matched ${doula.first_name} ${doula.last_name} with client`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.message || 'Failed to match doula with client';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    if (!searchTerm) return true;
    const name = client.name.toLowerCase();
    const email = client.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleClientSelect = (client: MatchingClient) => {
    setSelectedClientId(client.id);
    setSearchTerm(client.name);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedClientId('');
    setSearchTerm('');
    setShowDropdown(true);
    inputRef.current?.focus();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Match Client to Doula</DialogTitle>
          <DialogDescription>
            Assign a client in the matching phase to this doula. Only clients
            with status 'matching' can be assigned.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Doula Info */}
          <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>
              Doula Information
            </h3>
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm'>
                <User className='h-4 w-4 text-gray-400' />
                <span className='font-medium text-gray-900'>
                  {doula.first_name} {doula.last_name}
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Mail className='h-4 w-4 text-gray-400' />
                <span className='text-gray-600'>{doula.email}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Client Selection */}
            <div className='space-y-2'>
              <Label htmlFor='client-select'>
                Select Client (Matching Phase Only) <span className='text-red-500'>*</span>
              </Label>

              {fetchingClients ? (
                <div className='flex items-center justify-center py-8'>
                  <LoadingOverlay isLoading={true} />
                </div>
              ) : clients.length === 0 ? (
                <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 text-center'>
                  <p className='text-sm font-medium text-amber-800 mb-1'>
                    No clients in matching phase
                  </p>
                  <p className='text-xs text-amber-600'>
                    Clients must have status 'matching' to be assigned to doulas.
                  </p>
                </div>
              ) : (
                <>
                  {/* Searchable Dropdown */}
                  <div className='relative'>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10' />
                      <Input
                        ref={inputRef}
                        type='text'
                        placeholder={selectedClient ? selectedClient.name : 'Search clients by name or email...'}
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowDropdown(true);
                          if (selectedClientId) {
                            setSelectedClientId('');
                          }
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className='pl-10 pr-10'
                        disabled={loading}
                      />
                      {selectedClientId && (
                        <button
                          type='button'
                          onClick={handleClearSelection}
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                        >
                          <X className='h-4 w-4' />
                        </button>
                      )}
                    </div>

                    {/* Dropdown List */}
                    {showDropdown && (
                      <div
                        ref={dropdownRef}
                        className='absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto'
                      >
                        {filteredClients.length === 0 ? (
                          <div className='p-4 text-center text-sm text-gray-500'>
                            {searchTerm ? 'No clients match your search' : 'No clients available'}
                          </div>
                        ) : (
                          filteredClients.map((client) => (
                            <div
                              key={client.id}
                              onClick={() => handleClientSelect(client)}
                              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                selectedClientId === client.id ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                  <div className='font-medium text-gray-900'>{client.name}</div>
                                  <div className='text-sm text-gray-500 mt-1'>{client.email}</div>
                                  <div className='flex flex-wrap gap-2 mt-2 text-xs text-gray-400'>
                                    {client.serviceNeeded && (
                                      <span>Service: {client.serviceNeeded}</span>
                                    )}
                                    {client.dueDate && (
                                      <span>
                                        Due: {format(new Date(client.dueDate), 'MMM dd, yyyy')}
                                      </span>
                                    )}
                                    {client.phoneNumber && <span>Phone: {client.phoneNumber}</span>}
                                  </div>
                                </div>
                                {selectedClientId === client.id && (
                                  <div className='ml-2 text-blue-600'>
                                    <ChevronDown className='h-4 w-4 rotate-180' />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Client Info */}
                  {selectedClient && (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2'>
                      <h4 className='text-sm font-semibold text-blue-900 mb-3'>
                        Selected Client Details
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-blue-600' />
                          <div>
                            <span className='text-gray-600'>Name:</span>{' '}
                            <span className='font-medium text-gray-900'>
                              {selectedClient.name}
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Mail className='h-4 w-4 text-blue-600' />
                          <div>
                            <span className='text-gray-600'>Email:</span>{' '}
                            <span className='font-medium text-gray-900'>
                              {selectedClient.email}
                            </span>
                          </div>
                        </div>
                        {selectedClient.phoneNumber && (
                          <div className='flex items-center gap-2'>
                            <Phone className='h-4 w-4 text-blue-600' />
                            <div>
                              <span className='text-gray-600'>Phone:</span>{' '}
                              <span className='font-medium text-gray-900'>
                                {selectedClient.phoneNumber}
                              </span>
                            </div>
                          </div>
                        )}
                        {selectedClient.serviceNeeded && (
                          <div className='flex items-center gap-2'>
                            <span className='text-gray-600'>Service:</span>{' '}
                            <span className='font-medium text-gray-900'>
                              {selectedClient.serviceNeeded}
                            </span>
                          </div>
                        )}
                        {selectedClient.dueDate && (
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4 text-blue-600' />
                            <div>
                              <span className='text-gray-600'>Due Date:</span>{' '}
                              <span className='font-medium text-gray-900'>
                                {format(new Date(selectedClient.dueDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </div>
                        )}
                        {selectedClient.hospital && (
                          <div className='flex items-center gap-2'>
                            <Building2 className='h-4 w-4 text-blue-600' />
                            <div>
                              <span className='text-gray-600'>Hospital:</span>{' '}
                              <span className='font-medium text-gray-900'>
                                {selectedClient.hospital}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Notes */}
            <div className='space-y-2'>
              <Label htmlFor='notes'>Assignment Notes (Optional)</Label>
              <Textarea
                id='notes'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Add any notes about this assignment...'
                rows={4}
                disabled={loading}
                className='resize-none'
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <DialogFooter className='gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={loading || !selectedClientId || clients.length === 0}
              >
                {loading ? 'Matching...' : 'Match Client'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

