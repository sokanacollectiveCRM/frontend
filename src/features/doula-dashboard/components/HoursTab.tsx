import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Edit2, FileText, Plus, User } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import {
  getAssignedClients,
  getDoulaHours,
  logHours,
  updateHours,
  type AssignedClientLite,
  type HoursEntry,
} from '@/api/doulas/doulaService';
import {
  formatDurationHours,
  getHourTypeBadgeClass,
  getHourTypeLabel,
  hourTypeOptions,
  type HourType,
} from '@/features/hours/data/hour-types';

type HourFormState = {
  clientId: string;
  startTime: string;
  endTime: string;
  note: string;
  type: '' | Exclude<HourType, 'unknown'>;
};

const EMPTY_FORM: HourFormState = {
  clientId: '',
  startTime: '',
  endTime: '',
  note: '',
  type: '',
};

function toLocalInputValue(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const tzOffsetMs = parsed.getTimezoneOffset() * 60000;
  return new Date(parsed.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

export default function HoursTab() {
  const [hours, setHours] = useState<HoursEntry[]>([]);
  const [clients, setClients] = useState<AssignedClientLite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HoursEntry | null>(null);
  const [formData, setFormData] = useState<HourFormState>(EMPTY_FORM);

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

  const summary = useMemo(() => {
    return hours.reduce(
      (acc, entry) => {
        acc.total += entry.hours || 0;
        if (entry.type === 'prenatal') {
          acc.prenatal += entry.hours || 0;
        } else if (entry.type === 'postpartum') {
          acc.postpartum += entry.hours || 0;
        } else {
          acc.unknown += entry.hours || 0;
        }
        return acc;
      },
      { total: 0, prenatal: 0, postpartum: 0, unknown: 0 }
    );
  }, [hours]);

  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
  };

  const openCreateDialog = () => {
    setEditingEntry(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (entry: HoursEntry) => {
    setEditingEntry(entry);
    setFormData({
      clientId: entry.client.id,
      startTime: toLocalInputValue(entry.startTime),
      endTime: toLocalInputValue(entry.endTime),
      note: entry.note || '',
      type:
        entry.type === 'prenatal' || entry.type === 'postpartum' ? entry.type : '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEntry(null);
    setFormData(EMPTY_FORM);
    setIsSaving(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveHours = async () => {
    if (!formData.clientId || !formData.startTime || !formData.endTime || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const calculatedHours = calculateHours(formData.startTime, formData.endTime);
    if (calculatedHours <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    const payload = {
      clientId: formData.clientId,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      note: formData.note || undefined,
      type: formData.type,
    } as const;

    setIsSaving(true);
    try {
      if (editingEntry) {
        await updateHours(editingEntry.id, payload);
        toast.success('Hours updated successfully');
      } else {
        await logHours(payload);
        toast.success('Hours logged successfully');
      }
      closeDialog();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save hours:', error);
      toast.error(error.message || 'Failed to save hours');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>Loading hours...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>Hours Log</h2>
          <p className='mt-1 text-sm text-gray-600'>
            Log and track your hours worked with clients
          </p>
        </div>
        <Button onClick={openCreateDialog} disabled={clients.length === 0}>
          <Plus className='mr-2 h-4 w-4' />
          Log Hours
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <User className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <p className='mb-4 text-gray-500'>No clients assigned yet</p>
            <p className='text-sm text-gray-400'>
              You need to have assigned clients before you can log hours
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='grid gap-3 md:grid-cols-3'>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-sm text-gray-500'>Total hours</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {formatDurationHours(summary.total)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-sm text-gray-500'>Prenatal hours</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {formatDurationHours(summary.prenatal)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-sm text-gray-500'>Postpartum hours</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {formatDurationHours(summary.postpartum)}
                </p>
              </CardContent>
            </Card>
          </div>

          {hours.length === 0 ? (
            <Card>
              <CardContent className='py-12 text-center'>
                <Clock className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                <p className='mb-4 text-gray-500'>No hours logged yet</p>
                <Button onClick={openCreateDialog}>
                  <Plus className='mr-2 h-4 w-4' />
                  Log Your First Hours
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {hours.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader className='flex flex-row items-start justify-between gap-4 space-y-0 pb-2'>
                    <CardTitle className='text-base font-semibold'>
                      {entry.client.firstname} {entry.client.lastname}
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                      <Badge
                        className={getHourTypeBadgeClass(entry.type)}
                        variant='outline'
                      >
                        {getHourTypeLabel(entry.type)}
                      </Badge>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEditDialog(entry)}
                      >
                        <Edit2 className='h-4 w-4' />
                        <span className='sr-only'>Edit entry</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Calendar className='h-4 w-4' />
                      <span>{format(new Date(entry.startTime), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                      <span>
                        {format(new Date(entry.startTime), 'h:mm a')} -{' '}
                        {format(new Date(entry.endTime), 'h:mm a')}
                      </span>
                      <span className='font-medium text-gray-900'>
                        {entry.hours} hours
                      </span>
                    </div>
                    {entry.note && (
                      <div className='flex items-start gap-2 border-t pt-2 text-sm text-gray-600'>
                        <FileText className='mt-0.5 h-4 w-4' />
                        <span>{entry.note}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Hours' : 'Log Hours'}</DialogTitle>
            <DialogDescription>
              {editingEntry
                ? 'Update the session details and hour type.'
                : 'Record the hours you worked with a client'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='clientId'>Client *</Label>
              <Select
                value={formData.clientId || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, clientId: value }))
                }
              >
                <SelectTrigger id='clientId'>
                  <SelectValue placeholder='Select a client' />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstname} {client.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='type'>Hour type *</Label>
              <Select
                value={formData.type || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as HourFormState['type'],
                  }))
                }
              >
                <SelectTrigger id='type'>
                  <SelectValue placeholder='Select hour type' />
                </SelectTrigger>
                <SelectContent>
                  {hourTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button variant='outline' onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveHours} disabled={isSaving}>
              {isSaving
                ? editingEntry
                  ? 'Saving...'
                  : 'Logging...'
                : editingEntry
                  ? 'Save Changes'
                  : 'Log Hours'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
