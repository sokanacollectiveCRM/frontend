import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
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
  logHours,
  getDoulaHours,
  type HoursEntry,
  type AssignedClientLite,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import { Clock, Plus, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function HoursTab() {
  const [hours, setHours] = useState<HoursEntry[]>([]);
  const [clients, setClients] = useState<AssignedClientLite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    startTime: '',
    endTime: '',
    note: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [hoursData, clientsData] = await Promise.all([
        getDoulaHours(),
        getAssignedClients(false),
      ]);
      // Ensure data is always an array
      setHours(Array.isArray(hoursData) ? hoursData : []);
      setClients(Array.isArray(clientsData) ? (clientsData as AssignedClientLite[]) : []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setHours([]);
      setClients([]);
      toast.error(error.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogHours = async () => {
    if (!formData.clientId || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const calculatedHours = calculateHours(formData.startTime, formData.endTime);
    if (calculatedHours <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    setIsLogging(true);
    try {
      await logHours({
        clientId: formData.clientId,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        note: formData.note || undefined,
      });
      toast.success('Hours logged successfully');
      setLogDialogOpen(false);
      setFormData({ clientId: '', startTime: '', endTime: '', note: '' });
      fetchData();
    } catch (error: any) {
      console.error('Failed to log hours:', error);
      toast.error(error.message || 'Failed to log hours');
    } finally {
      setIsLogging(false);
    }
  };

  const totalHours = hours.reduce((sum, entry) => sum + entry.hours, 0);

  if (isLoading) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500'>Loading hours...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>Hours Log</h2>
          <p className='text-sm text-gray-600 mt-1'>
            Log and track your hours worked with clients
          </p>
        </div>
        <Button onClick={() => setLogDialogOpen(true)} disabled={clients.length === 0}>
          <Plus className='h-4 w-4 mr-2' />
          Log Hours
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className='text-center py-12'>
            <User className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500 mb-4'>No clients assigned yet</p>
            <p className='text-sm text-gray-400'>
              You need to have assigned clients before you can log hours
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className='py-4'>
              <div className='flex items-center gap-2'>
                <Clock className='h-5 w-5 text-green-600' />
                <span className='text-lg font-semibold text-gray-900'>
                  Total Hours: {totalHours.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>

          {hours.length === 0 ? (
            <Card>
              <CardContent className='text-center py-12'>
                <Clock className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500 mb-4'>No hours logged yet</p>
                <Button onClick={() => setLogDialogOpen(true)}>
                  <Plus className='h-4 w-4 mr-2' />
                  Log Your First Hours
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {hours.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className='py-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-gray-400' />
                          <span className='font-medium'>
                            {entry.client.firstname} {entry.client.lastname}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Calendar className='h-4 w-4' />
                          <span>
                            {format(new Date(entry.startTime), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className='flex items-center gap-4 text-sm text-gray-600'>
                          <span>
                            {format(new Date(entry.startTime), 'h:mm a')} -{' '}
                            {format(new Date(entry.endTime), 'h:mm a')}
                          </span>
                          <span className='font-medium text-gray-900'>
                            {entry.hours} hours
                          </span>
                        </div>
                        {entry.note && (
                          <div className='flex items-start gap-2 text-sm text-gray-600 pt-2 border-t'>
                            <FileText className='h-4 w-4 mt-0.5' />
                            <span>{entry.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Log Hours Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Log Hours</DialogTitle>
            <DialogDescription>
              Record the hours you worked with a client
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='clientId'>Client *</Label>
              <select
                id='clientId'
                name='clientId'
                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                value={formData.clientId}
                onChange={handleInputChange}
                required
              >
                <option value=''>Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstname} {client.lastname}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='startTime'>Start Time *</Label>
              <Input
                id='startTime'
                name='startTime'
                type='datetime-local'
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='endTime'>End Time *</Label>
              <Input
                id='endTime'
                name='endTime'
                type='datetime-local'
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
              {formData.startTime && formData.endTime && (
                <p className='text-sm text-gray-600'>
                  Hours: {calculateHours(formData.startTime, formData.endTime).toFixed(1)}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='note'>Notes (Optional)</Label>
              <Textarea
                id='note'
                name='note'
                value={formData.note}
                onChange={handleInputChange}
                rows={3}
                placeholder='Add any notes about this session...'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setLogDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogHours} disabled={isLogging}>
              {isLogging ? 'Logging...' : 'Log Hours'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

