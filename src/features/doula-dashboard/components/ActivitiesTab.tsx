import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { Badge } from '@/common/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import {
  getAssignedClients,
  getAssignedClientDetails,
  getClientActivities,
  addClientActivity,
  type ClientActivity,
  type ActivityType,
  type AssignedClientLite,
  type AssignedClientDetailed,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import { MessageSquare, Phone, Calendar, Mail, FileText, Plus, ArrowLeft, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface ActivitiesTabProps {
  clientId: string | null;
  onBack: () => void;
}

export default function ActivitiesTab({ clientId, onBack }: ActivitiesTabProps) {
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [clients, setClients] = useState<AssignedClientLite[]>([]);
  const [selectedClient, setSelectedClient] = useState<AssignedClientLite | null>(null);
  const [clientDetails, setClientDetails] = useState<AssignedClientDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    type: 'note' as ActivityType,
    description: '',
    metadata: {} as Record<string, any>,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (clientId) {
      setIsLoading(true);
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        // Set client immediately to prevent "not found" flash
        setSelectedClient(client);
        fetchActivities(clientId);
      } else if (clients.length > 0) {
        // Only show "not found" if we've already loaded clients
        setIsLoading(false);
      }
    }
  }, [clientId, clients]);

  const fetchClients = async () => {
    try {
      const data = await getAssignedClients(false);
      // Ensure data is always an array
      const clientsArray = Array.isArray(data) ? (data as AssignedClientLite[]) : [];
      setClients(clientsArray);
      if (clientId) {
        const client = clientsArray.find((c) => c.id === clientId);
        if (client) {
          setSelectedClient(client);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
      toast.error(error.message || 'Failed to load clients');
    }
  };

  const fetchActivities = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getClientActivities(id);
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setActivities(data);
      } else {
        console.error('Invalid response format:', data);
        setActivities([]);
        toast.error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Failed to fetch activities:', error);
      setActivities([]); // Set empty array on error
      toast.error(error.message || 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSelect = async (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setSelectedClient(client);
      setIsLoadingDetails(true);
      setIsLoading(true); // Also set activities loading
      setClientModalOpen(true); // Open modal immediately
      try {
        // Fetch detailed client information and activities in parallel
        const [details, activitiesData] = await Promise.all([
          getAssignedClientDetails(id, true).catch(() => null),
          getClientActivities(id).catch(() => []),
        ]);
        
        if (details) {
          setClientDetails(details as AssignedClientDetailed);
        }
        
        // Set activities
        if (Array.isArray(activitiesData)) {
          setActivities(activitiesData);
        } else {
          console.warn('Activities data is not an array:', activitiesData);
          setActivities([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch client details:', error);
        toast.error(error.message || 'Failed to load client details');
        // Still show modal with basic info from selectedClient
        setClientDetails(null);
        setActivities([]);
      } finally {
        setIsLoadingDetails(false);
        setIsLoading(false);
      }
    }
  };

  const handleAddActivity = async () => {
    if (!selectedClient || !formData.description.trim()) {
      toast.error('Please fill in the description');
      return;
    }

    setIsAdding(true);
    try {
      await addClientActivity(selectedClient.id, {
        type: formData.type,
        description: formData.description,
        metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined,
      });
      toast.success('Activity added successfully');
      setAddDialogOpen(false);
      setFormData({ type: 'note', description: '', metadata: {} });
      // Refresh activities for the selected client
      if (selectedClient) {
        setIsLoading(true);
        try {
          const activitiesData = await getClientActivities(selectedClient.id);
          if (Array.isArray(activitiesData)) {
            setActivities(activitiesData);
          }
        } catch (error: any) {
          console.error('Failed to refresh activities:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Failed to add activity:', error);
      toast.error(error.message || 'Failed to add activity');
    } finally {
      setIsAdding(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'call':
        return <Phone className='h-4 w-4' />;
      case 'visit':
        return <Calendar className='h-4 w-4' />;
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'note':
        return <FileText className='h-4 w-4' />;
      default:
        return <MessageSquare className='h-4 w-4' />;
    }
  };

  const getActivityBadgeColor = (type: ActivityType) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-800';
      case 'visit':
        return 'bg-green-100 text-green-800';
      case 'email':
        return 'bg-purple-100 text-purple-800';
      case 'note':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const groupedActivities = activities.reduce((acc, activity) => {
    // Safely handle date parsing - use current date as fallback
    let dateStr = 'Unknown Date';
    
    try {
      if (activity.createdAt) {
        const dateObj = new Date(activity.createdAt);
        // Check if date is valid
        if (!isNaN(dateObj.getTime())) {
          dateStr = format(dateObj, 'yyyy-MM-dd');
        }
      }
      
      // Always add activity, even if date is missing (use "Unknown Date" group)
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(activity);
    } catch (error) {
      console.error('Error formatting date for activity:', activity, error);
      // Still add the activity to "Unknown Date" group
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(activity);
    }
    return acc;
  }, {} as Record<string, ClientActivity[]>);

  if (!selectedClient && !clientId) {
    return (
      <div className='space-y-6'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>Client Activities</h2>
          <p className='text-sm text-gray-600 mt-1'>
            Select a client to view and add activities
          </p>
        </div>
        <Card>
          <CardContent className='py-6'>
            <div className='space-y-2'>
              <Label>Select Client</Label>
              <select
                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                value={(selectedClient as AssignedClientLite | null)?.id || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleClientSelect(e.target.value);
                  }
                }}
                disabled={isLoadingDetails}
              >
                <option value=''>Choose a client...</option>
                {clients.length === 0 ? (
                  <option value='' disabled>
                    No assigned clients
                  </option>
                ) : (
                  clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstname || 'No'} {client.lastname || 'Name'} {client.email ? `(${client.email})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Client Info Modal */}
        <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
          <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Client Information & Activities</DialogTitle>
              <DialogDescription>
                View client details and manage activities
              </DialogDescription>
            </DialogHeader>
            
            {(isLoadingDetails || isLoading) ? (
              <div className='py-8 text-center'>
                <p className='text-gray-500'>Loading client information...</p>
              </div>
            ) : selectedClient ? (
              <div className='space-y-6 py-4'>
                {/* Client Information Section */}
                <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>Client Information</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-xs text-gray-500'>Name</p>
                        <p className='text-sm font-medium text-gray-900'>
                          {(selectedClient as AssignedClientLite).firstname || 'No'} {(selectedClient as AssignedClientLite).lastname || 'Name'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-xs text-gray-500'>Email</p>
                        <p className='text-sm font-medium text-gray-900'>
                          {(selectedClient as AssignedClientLite).email || 'No email provided'}
                        </p>
                      </div>
                    </div>
                    {(selectedClient as AssignedClientLite).phone && (
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-xs text-gray-500'>Phone</p>
                          <p className='text-sm font-medium text-gray-900'>{(selectedClient as AssignedClientLite).phone}</p>
                        </div>
                      </div>
                    )}
                    {(selectedClient as AssignedClientLite).dueDate && (
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-xs text-gray-500'>Due Date</p>
                          <p className='text-sm font-medium text-gray-900'>
                            {format(new Date((selectedClient as AssignedClientLite).dueDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}
                    {clientDetails?.address && (
                      <div className='flex items-center gap-2 md:col-span-2'>
                        <MapPin className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-xs text-gray-500'>Address</p>
                          <p className='text-sm font-medium text-gray-900'>
                            {clientDetails.address}
                            {clientDetails.city && `, ${clientDetails.city}`}
                            {clientDetails.state && `, ${clientDetails.state}`}
                            {clientDetails.zipCode && ` ${clientDetails.zipCode}`}
                          </p>
                        </div>
                      </div>
                    )}
                    {clientDetails?.healthHistory && (
                      <div className='md:col-span-2'>
                        <p className='text-xs text-gray-500'>Health History</p>
                        <p className='text-sm text-gray-900'>{clientDetails.healthHistory}</p>
                      </div>
                    )}
                    {clientDetails?.allergies && (
                      <div className='md:col-span-2'>
                        <p className='text-xs text-gray-500'>Allergies</p>
                        <p className='text-sm text-gray-900'>{clientDetails.allergies}</p>
                      </div>
                    )}
                    {clientDetails?.hospital && (
                      <div className='md:col-span-2'>
                        <p className='text-xs text-gray-500'>Hospital</p>
                        <p className='text-sm text-gray-900'>{clientDetails.hospital}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activities Section */}
                <div>
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>Activities</h3>
                    <Button onClick={() => setAddDialogOpen(true)} size='sm' disabled={isLoading || isLoadingDetails}>
                      <Plus className='h-4 w-4 mr-2' />
                      Add Activity
                    </Button>
                  </div>

                  {activities.length === 0 ? (
                    <Card>
                      <CardContent className='text-center py-8'>
                        <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-500 mb-4'>No activities recorded yet</p>
                        <Button onClick={() => setAddDialogOpen(true)}>
                          <Plus className='h-4 w-4 mr-2' />
                          Add First Activity
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className='space-y-4 max-h-96 overflow-y-auto'>
                      {Object.entries(groupedActivities)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([date, dateActivities]) => (
                          <div key={date}>
                            <h4 className='text-sm font-semibold text-gray-700 mb-2'>
                              {(() => {
                                try {
                                  const dateObj = new Date(date);
                                  if (isNaN(dateObj.getTime())) return date;
                                  return format(dateObj, 'MMMM dd, yyyy');
                                } catch {
                                  return date;
                                }
                              })()}
                            </h4>
                            <div className='space-y-2'>
                              {dateActivities.map((activity) => (
                                <Card key={activity.id}>
                                  <CardContent className='py-3'>
                                    <div className='flex items-start gap-3'>
                                      <div
                                        className={`p-2 rounded-lg ${getActivityBadgeColor(activity.type)}`}
                                      >
                                        {getActivityIcon(activity.type)}
                                      </div>
                                      <div className='flex-1 space-y-1'>
                                        <div className='flex items-center gap-2'>
                                          <Badge
                                            className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                                          >
                                            {activity.type}
                                          </Badge>
                                          <span className='text-xs text-gray-500'>
                                            {(() => {
                                              try {
                                                if (!activity.createdAt) return '';
                                                const dateObj = new Date(activity.createdAt);
                                                if (isNaN(dateObj.getTime())) return '';
                                                return format(dateObj, 'h:mm a');
                                              } catch {
                                                return '';
                                              }
                                            })()}
                                          </span>
                                        </div>
                                        <p className='text-sm text-gray-900'>{activity.description}</p>
                                        {activity.metadata &&
                                          Object.keys(activity.metadata).length > 0 && (
                                            <div className='text-xs text-gray-600 space-y-1 pt-2 border-t'>
                                              {Object.entries(activity.metadata).map(([key, value]) => (
                                                <p key={key}>
                                                  <span className='font-medium'>{key}:</span> {String(value)}
                                                </p>
                                              ))}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button variant='outline' onClick={() => setClientModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            {clientId && (
              <Button variant='ghost' size='sm' onClick={onBack}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            )}
            <h2 className='text-xl font-semibold text-gray-900'>Client Activities</h2>
          </div>
          {selectedClient && (
            <div className='space-y-1'>
              <p className='text-sm font-medium text-gray-900'>
                {selectedClient.firstname || 'No'} {selectedClient.lastname || 'Name'}
              </p>
              {selectedClient.email && (
                <p className='text-sm text-gray-600'>{selectedClient.email}</p>
              )}
            </div>
          )}
        </div>
        {selectedClient && (
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Add Activity
          </Button>
        )}
      </div>

      {!selectedClient && clientId && !isLoadingDetails && !isLoading && (
        <Card>
          <CardContent className='text-center py-12'>
            <p className='text-gray-500'>Client not found</p>
            <Button variant='outline' onClick={onBack} className='mt-4'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      )}

      {(isLoadingDetails || isLoading) && clientId && !clientModalOpen && (
        <Card>
          <CardContent className='text-center py-12'>
            <p className='text-gray-500'>Loading client information...</p>
          </CardContent>
        </Card>
      )}

      {selectedClient && !clientModalOpen && !isLoading && !isLoadingDetails && (
        <>
          {activities.length === 0 ? (
            <Card>
              <CardContent className='text-center py-12'>
                <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500 mb-4'>No activities recorded yet</p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className='h-4 w-4 mr-2' />
                  Add First Activity
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-6'>
              {Object.entries(groupedActivities)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, dateActivities]) => (
                  <div key={date}>
                    <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                      {(() => {
                        try {
                          const dateObj = new Date(date);
                          if (isNaN(dateObj.getTime())) return date;
                          return format(dateObj, 'MMMM dd, yyyy');
                        } catch {
                          return date;
                        }
                      })()}
                    </h3>
                    <div className='space-y-3'>
                      {dateActivities.map((activity) => (
                        <Card key={activity.id}>
                          <CardContent className='py-4'>
                            <div className='flex items-start gap-3'>
                              <div
                                className={`p-2 rounded-lg ${getActivityBadgeColor(activity.type)}`}
                              >
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className='flex-1 space-y-2'>
                                        <div className='flex items-center gap-2'>
                                          <Badge
                                            className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                                          >
                                            {activity.type}
                                          </Badge>
                                          <span className='text-xs text-gray-500'>
                                            {(() => {
                                              try {
                                                if (!activity.createdAt) return '';
                                                const dateObj = new Date(activity.createdAt);
                                                if (isNaN(dateObj.getTime())) return '';
                                                return format(dateObj, 'h:mm a');
                                              } catch {
                                                return '';
                                              }
                                            })()}
                                          </span>
                                        </div>
                                <p className='text-sm text-gray-900'>{activity.description}</p>
                                {activity.metadata &&
                                  Object.keys(activity.metadata).length > 0 && (
                                    <div className='text-xs text-gray-600 space-y-1 pt-2 border-t'>
                                      {Object.entries(activity.metadata).map(([key, value]) => (
                                        <p key={key}>
                                          <span className='font-medium'>{key}:</span> {String(value)}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {/* Add Activity Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>
              Record an activity for {selectedClient?.firstname || 'No'} {selectedClient?.lastname || 'Name'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='activity-type'>Activity Type</Label>
              <select
                id='activity-type'
                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as ActivityType }))
                }
              >
                <option value='note'>Note</option>
                <option value='call'>Call</option>
                <option value='visit'>Visit</option>
                <option value='email'>Email</option>
                <option value='other'>Other</option>
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Description *</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                placeholder='Describe the activity...'
                required
              />
            </div>
            {formData.type === 'call' && (
              <div className='space-y-2'>
                <Label htmlFor='duration'>Duration (Optional)</Label>
                <Input
                  id='duration'
                  placeholder='e.g., 15 minutes'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, duration: e.target.value },
                    }))
                  }
                />
              </div>
            )}
            {(formData.type === 'call' || formData.type === 'visit') && (
              <div className='space-y-2'>
                <Label htmlFor='topic'>Topic (Optional)</Label>
                <Input
                  id='topic'
                  placeholder='e.g., Birth plan discussion'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, topic: e.target.value },
                    }))
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity} disabled={isAdding || !formData.description.trim()}>
              {isAdding ? 'Adding...' : 'Add Activity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

