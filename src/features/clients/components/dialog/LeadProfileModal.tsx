import { ClientNote, createClientNote, getClientNotes } from '@/api/clients/notes';
import { Button } from '@/common/components/ui/button';
import { Calendar } from '@/common/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/common/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { Textarea } from '@/common/components/ui/textarea';
import { useClients } from '@/common/hooks/clients/useClients';
import { UserContext } from '@/common/contexts/UserContext';
import updateClient from '@/common/utils/updateClient';
import updateClientStatus from '@/common/utils/updateClientStatus';
import { Client } from '@/features/clients/data/schema';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Baby,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  User,
  Users
} from 'lucide-react';
import React, { useContext, useState } from 'react';
import { toast } from 'sonner';
import { DoulaAssignment } from '../DoulaAssignment';

interface LeadProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  refreshClients?: () => void;
  missingClientId?: string;
}

const NOTE_CATEGORIES = ['General', 'Communication', 'Milestone', 'Follow-up', 'Health', 'Billing'];

// Dropdown options from request form (exact matches)
const PRONOUNS_OPTIONS = ['She/Her', 'He/Him', 'They/Them', 'Ze/Hir/Zir', 'None', 'Other'];
const PREFERRED_CONTACT_OPTIONS = ['Phone', 'Email'];
const HOME_TYPE_OPTIONS = ['House', 'Condo', 'Apartment', 'Shelter', 'Other'];
const RELATIONSHIP_OPTIONS = ['Spouse', 'Partner', 'Friend', 'Parent', 'Sibling', 'Other'];
const FAMILY_PRONOUNS_OPTIONS = ['She/Her', 'He/Him', 'They/Them', 'Ze/Hir/Zir', 'None'];
const REFERRAL_OPTIONS = ['Google', 'Doula Match', 'Former client', 'Sokana Member', 'Social Media', 'Email Blast'];
const SERVICES_OPTIONS = ['Labor Support', 'Postpartum Support', '1st Night Care', 'Lactation Support', 'Perinatal Education', 'Abortion Support', 'Other'];
const ANNUAL_INCOME_OPTIONS = [
  '$0-$24,999',
  '$25,000-$44,999',
  '$45,000-$64,999',
  '$65,000-$84,999',
  '$85,000-$99,999',
  '100k and above'
];
const PAYMENT_METHOD_OPTIONS = ['Self-Pay', 'Private Insurance', 'Medicaid', 'Other'];
const RACE_OPTIONS = ['African American/Black', 'Asian/Pacific Islander', 'Caucasian/White', 'Hispanic', 'Two or more races', 'Other'];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'Mandarin', 'Arabic', 'Other'];
const AGE_OPTIONS = ['Under 20', '20-25', '26-35', '36 and older'];
const INSURANCE_OPTIONS = ['Private', 'Public Aid', "Currently don't have medical insurance"];
const DEMOGRAPHICS_MULTI_OPTIONS = [
  'Annual income is less than $30,000',
  'Identify as a person of color',
  'Identify as LGBTQ+',
  'Disabled',
  'Survivor of violence',
  'Experienced pregnancy or birth trauma',
  'Experienced postpartum depression, anxiety/psychosis/mood disorder',
  'Referred from a social service agency',
  'Refugee or religious minority',
  'Active Military or Veteran Status',
  'None apply',
  'Other:'
];
const DEMOGRAPHICS_INCOME_OPTIONS = [
  '$0-$24,999',
  '$25,000-$44,999',
  '$45,000-$64,999',
  '$65,000-$84,999',
  '$85,000-$99,999',
  '$100,000 and above'
];
const CLIENT_STATUS_OPTIONS = [
  'lead',
  'contacted',
  'matching',
  'interviewing',
  'follow up',
  'contract',
  'active',
  'complete',
  'customer'
];

// Pregnancy & Health options (exact from request form)
const BIRTH_LOCATION_OPTIONS = ['Hospital', 'Home', 'Birth Center', 'Other'];
const NUMBER_OF_BABIES_OPTIONS = [
  'Singleton',
  'Twins',
  'Triplets',
  'Quadruplets',
  'Quintuplets',
  'Sextuplets',
  'Septuplets',
  'Octuplets'
];
const PROVIDER_TYPE_OPTIONS = ['Midwife', 'OB', 'Family Doctor', 'Other'];

export function LeadProfileModal({
  open,
  onOpenChange,
  client,
  refreshClients,
  missingClientId,
}: LeadProfileModalProps) {
  if (open) {
    console.warn('[LeadProfileModal] render (open=true)', { clientId: client?.id });
  }
  const { user } = useContext(UserContext);
  const { getClientById } = useClients();
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteCategory, setNoteCategory] = useState('General');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['contact', 'services']));
  const [isEditing, setIsEditing] = useState(true);
  const [editedData, setEditedData] = useState<Partial<Client>>({});
  const [isSaving, setIsSaving] = useState(false);
  // Primary source for display: full detail from GET /clients/:id (authorized users get PHI).
  const [fetchedDetail, setFetchedDetail] = useState<Record<string, unknown> | null>(null);

  // Use the client data directly when no fetched detail yet
  const detailedClient = client;

  // Primary source for modal: fetched detail from GET /clients/:id when available; otherwise client prop.
  // Detail modal is for authorized users only – backend gates PHI on GET /clients/:id.
  const detailSource: Record<string, unknown> | null = React.useMemo(() => {
    if (fetchedDetail && typeof fetchedDetail === 'object') return fetchedDetail;
    if (!client || typeof client !== 'object') return null;
    const c = client as Record<string, unknown>;
    const dataObj = c.data && typeof c.data === 'object' && !Array.isArray(c.data) ? (c.data as Record<string, unknown>) : null;
    const base = dataObj ?? c;
    const phi = (c.phi && typeof c.phi === 'object' && !Array.isArray(c.phi))
      ? (c.phi as Record<string, unknown>)
      : (dataObj?.phi && typeof dataObj.phi === 'object' && !Array.isArray(dataObj.phi))
        ? (dataObj.phi as Record<string, unknown>)
        : null;
    if (phi) return { ...base, ...phi };
    return base;
  }, [client, fetchedDetail]);

  // Log when modal is open so we can confirm component is mounted (check console for "LeadProfileModal")
  React.useEffect(() => {
    if (open) {
      console.warn('[LeadProfileModal] Modal opened', { clientId: client?.id, hasClient: !!client, hasDetailSource: !!detailSource, hasFetchedDetail: !!fetchedDetail });
    }
  }, [open, client?.id, client, detailSource, fetchedDetail]);

  // Fetch notes when client changes
  React.useEffect(() => {
    if (client?.id) {
      fetchNotes();
    }
  }, [client?.id]);

  // On modal open with client.id: always fetch GET /clients/:id and use as primary source for display.
  // Do not rely solely on list row; backend returns full PHI for authorized users on detail.
  const detailFetchRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!open) {
      detailFetchRef.current = null;
      setFetchedDetail(null);
      return;
    }
    if (!client?.id) return;
    const clientId = String(client.id);
    if (detailFetchRef.current === clientId) return;
    detailFetchRef.current = clientId;
    let cancelled = false;
    getClientById(clientId)
      .then((data) => {
        if (cancelled || !data) return;
        const raw = data as unknown as Record<string, unknown>;
        setFetchedDetail(raw);
        // Merge full detail into editedData so all fields (first_name, last_name, email, phone_number, service_needed, address, etc.) display correctly.
        const get = (key: string, alt: string) => (raw[key] ?? raw[alt]) as string | undefined;
        setEditedData((prev) => ({
          ...prev,
          firstname: (get('firstname', 'first_name') ?? get('firstName', 'first_name') ?? prev.firstname ?? '') as string,
          lastname: (get('lastname', 'last_name') ?? get('lastName', 'last_name') ?? prev.lastname ?? '') as string,
          first_name: get('first_name', 'firstname') ?? (prev as any).first_name,
          last_name: get('last_name', 'lastname') ?? (prev as any).last_name,
          email: (get('email', 'email') ?? prev.email) as string | undefined,
          phoneNumber: (get('phone_number', 'phoneNumber') ?? prev.phoneNumber ?? '') as string,
          phone_number: get('phone_number', 'phoneNumber') ?? prev.phone_number,
          serviceNeeded: (get('service_needed', 'serviceNeeded') ?? prev.serviceNeeded ?? '') as string,
          service_needed: get('service_needed', 'serviceNeeded') ?? prev.service_needed,
          due_date: raw.due_date ?? raw.dueDate ?? prev.due_date,
          address: (raw.address ?? raw.address_line1 ?? raw.addressLine1 ?? prev.address) as string | undefined,
          address_line1: (raw.address_line1 ?? raw.addressLine1 ?? prev.address_line1) as string | undefined,
          date_of_birth: (raw.date_of_birth ?? raw.dateOfBirth ?? (prev as any).date_of_birth) as string | undefined,
          health_history: (raw.health_history ?? raw.healthHistory ?? (prev as any).health_history) as string | undefined,
          health_notes: (raw.health_notes ?? raw.healthNotes ?? (prev as any).health_notes) as string | undefined,
          allergies: (raw.allergies ?? (prev as any).allergies) as string | undefined,
          ...raw,
        }));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) detailFetchRef.current = null;
      });
    return () => {
      cancelled = true;
    };
  }, [open, client?.id, getClientById]);

  const fetchNotes = async () => {
    if (!client?.id) return;

    try {
      setLoadingNotes(true);
      setNotesError(null);
      const fetchedNotes = await getClientNotes(client.id);

      // Debug: Comprehensive timezone analysis
      console.log('📝 Fetched notes:', fetchedNotes);
      if (fetchedNotes.length > 0) {
        const firstNote = fetchedNotes[0];
        const rawTimestamp = firstNote.timestamp;
        const parsedDate = new Date(rawTimestamp);
        const now = new Date();

        console.log('🕐 TIMEZONE DEBUG:');
        console.log('  Raw timestamp from backend:', rawTimestamp);
        console.log('  Type of timestamp:', typeof rawTimestamp);
        console.log('  Parsed Date object:', parsedDate);
        console.log('  Parsed Date ISO string:', parsedDate.toISOString());
        console.log('  Parsed Date local string:', parsedDate.toString());
        console.log('  Current time (now):', now);
        console.log('  Current time ISO:', now.toISOString());
        console.log('  Current time local:', now.toString());
        console.log('  Time difference (ms):', now.getTime() - parsedDate.getTime());
        console.log('  Time difference (minutes):', (now.getTime() - parsedDate.getTime()) / 1000 / 60);
        console.log('  Browser timezone offset (minutes):', now.getTimezoneOffset());
        console.log('  Is timestamp in future?', parsedDate > now);
      }

      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotesError('Failed to load notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  // Build a fingerprint from key data fields so init re-runs when detail data
  // arrives (e.g. phone_number, service_needed) — not just when the client ID changes.
  const dataFingerprint = React.useMemo(() => {
    if (!detailSource) return '';
    const d = detailSource as Record<string, unknown>;
    const clientId = (d.id ?? client?.id ?? '') as string;
    const phone = ((d.phone_number ?? d.phoneNumber) || '') as string;
    const service = ((d.service_needed ?? d.serviceNeeded) || '') as string;
    const dueDate = ((d.due_date ?? d.dueDate) || '') as string;
    return `${clientId}|${phone}|${service}|${dueDate}`;
  }, [detailSource, client?.id]);

  const lastInitFingerprintRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!client || !detailSource) {
      lastInitFingerprintRef.current = null;
      return;
    }
    if (lastInitFingerprintRef.current === dataFingerprint) {
      return;
    }
    lastInitFingerprintRef.current = dataFingerprint;
    const d = detailSource;
    const get = (key: string, alt: string) => (d[key] ?? d[alt]) as string | undefined;
    const rawPhone = get('phone_number', 'phoneNumber');
    const phoneNumber = (rawPhone ?? '') as string;
    // Use undefined (not '') when no phone data exists so ?? falls through correctly
    const phone_number = rawPhone || undefined;
    console.warn('[LeadProfileModal] phone number mapped in editedData init:', {
      'detailSource.phone_number': d.phone_number,
      'detailSource.phoneNumber': d.phoneNumber,
      rawPhone,
      phoneNumber,
      phone_number,
    });
    const initializedData: Partial<Client> = {
      ...client,
      ...detailSource,
      firstname: (get('firstname', 'first_name') ?? get('firstName', 'first_name') ?? '') as string,
      lastname: (get('lastname', 'last_name') ?? get('lastName', 'last_name') ?? '') as string,
      email: d.email as string | undefined,
      phoneNumber,
      phone_number,
      due_date: get('due_date', 'dueDate'),
      address: (get('address_line1', 'address') ?? get('addressLine1', 'address') ?? '') as string | undefined,
      address_line1: get('address_line1', 'addressLine1'),
      date_of_birth: get('date_of_birth', 'dateOfBirth'),
      serviceNeeded: (get('service_needed', 'serviceNeeded') ?? '') as string,
      service_needed: (get('service_needed', 'serviceNeeded') ?? '') as string,
    };
    setEditedData(initializedData);
  }, [client, detailSource, dataFingerprint]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) {
      setNotesError('Note description is required');
      return;
    }

    if (!client?.id) {
      setNotesError('No client selected');
      return;
    }

    try {
      setSavingNote(true);
      setNotesError(null);

      const createdNote = await createClientNote(client.id, {
        type: 'note',
        description: newNote,
        metadata: { category: noteCategory.toLowerCase() }
      });

      // Add new note to the top of the list
      setNotes(prev => [createdNote, ...prev]);
      setNewNote('');
      setNoteCategory('General');
      toast.success('Note added successfully!');
    } catch (err) {
      console.error('Error creating note:', err);
      setNotesError('Failed to create note');
      toast.error('Failed to create note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!client?.id) {
      toast.error('No client selected for update');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare update data - only send fields that have actually changed
      const updateData: any = {};
      const changedFields: string[] = [];

      // Check which fields have changed by comparing with original client data
      Object.keys(editedData).forEach(key => {
        const originalValue = client[key as keyof Client];
        const newValue = editedData[key as keyof Client];

        // Skip fields that are in editedData but not meaningful for updates
        if (key === 'id' || key === 'uuid' || key === 'text' || key === 'role' || key === 'requestedAt' || key === 'created_at' || key === 'updatedAt') {
          return;
        }

        // Handle array comparisons
        if (Array.isArray(newValue)) {
          const originalArray = Array.isArray(originalValue) ? originalValue : [];
          const originalSorted = originalArray.sort().join(',');
          const newSorted = [...newValue].sort().join(',');
          if (originalSorted !== newSorted) {
            updateData[key] = newValue;
            changedFields.push(key);
          }
        } else {
          // For non-array fields, only mark as changed if:
          // 1. Both have values and they're different, OR
          // 2. Original had a value and new is empty (clearing a field), OR
          // 3. Original was empty/undefined and new has a value
          const originalHasValue = originalValue !== undefined && originalValue !== null && originalValue !== '';
          const newHasValue = newValue !== undefined && newValue !== null && newValue !== '';

          // Special handling for date fields - don't send empty strings or null
          if (key === 'due_date' && !newHasValue) {
            // Skip empty date values to avoid backend errors
            return;
          }

          // Only update if there's an actual change
          if (originalHasValue && newHasValue && originalValue !== newValue) {
            // Both have values and they're different
            updateData[key] = newValue;
            changedFields.push(key);
          } else if (originalHasValue && !newHasValue) {
            // Clearing a field (had value, now empty)
            updateData[key] = newValue;
            changedFields.push(key);
          } else if (!originalHasValue && newHasValue) {
            // Adding a value to an empty field
            updateData[key] = newValue;
            changedFields.push(key);
          }
          // Skip if both are empty (originalValue is undefined/null/'' and newValue is '')
        }
      });

      // Only update if there are changes
      if (changedFields.length === 0) {
        toast('No changes detected');
        setIsEditing(false);
        return;
      }

      // Map demographics_annual_income to annual_income for backend
      if (updateData.demographics_annual_income !== undefined) {
        updateData.annual_income = updateData.demographics_annual_income;
        if (!changedFields.includes('annual_income')) {
          changedFields.push('annual_income');
        }
      }

      console.log('Saving changes:', updateData);
      console.log('Changed fields:', changedFields);

      // Handle status update separately using the dedicated status endpoint
      if (updateData.status !== undefined) {
        const statusResult = await updateClientStatus(client.id, updateData.status);
        if (!statusResult.success) {
          toast.error(statusResult.error || 'Failed to update client status');
          setIsSaving(false);
          return;
        }
        // Remove status from updateData since it's already handled
        delete updateData.status;
        const statusIndex = changedFields.indexOf('status');
        if (statusIndex > -1) {
          changedFields.splice(statusIndex, 1);
        }
      }

      // If there are no other changes besides status, we're done
      if (changedFields.length === 0) {
        toast.success('Client profile updated successfully!');
        setIsEditing(false);
        if (refreshClients) {
          refreshClients();
        }
        setIsSaving(false);
        return;
      }

      // Call the API to update the remaining client fields
      const result = await updateClient(client.id, updateData);

      if (result.success) {
        toast.success('Client profile updated successfully!');
        setIsEditing(false);

        // Update the local editedData with the full client response from backend
        // This ensures the modal shows ALL updated data immediately, including fields
        // that were successfully saved to the database
        if (result.client) {
          console.log('✅ Updated client data from backend:', result.client);
          setEditedData(prev => ({ ...prev, ...result.client }));
        } else {
          // Fallback: use the updateData we sent
          setEditedData(prev => ({ ...prev, ...updateData }));
        }

        // Refresh the clients list to show updated data in the table
        if (refreshClients) {
          refreshClients();
        }
      } else {
        toast.error(result.error || 'Failed to update client profile');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData(detailedClient || {});
    setIsEditing(false);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Not provided';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  // Single source for display: detailSource (from GET /clients/:id when available), then client prop, then editedData.
  // Handle both snake_case and camelCase from API. Do not display [redacted] in detail modal (authorized view only).
  const getDisplayValue = (fieldKey: string, altKey: string | null): string => {
    const c = client as Record<string, unknown> | null;
    const fromDetail = detailSource ? ((altKey ? detailSource[altKey] : undefined) ?? detailSource[fieldKey]) : undefined;
    const fromClient = c ? ((altKey ? c[altKey] : undefined) ?? c[fieldKey]) : undefined;
    const fromEdited = (altKey ? editedData[altKey] : undefined) ?? editedData[fieldKey];
    const v = fromDetail ?? fromClient ?? fromEdited;
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s === '[redacted]') return '';
    return s;
  };

  const renderEditableField = (
    label: string,
    fieldKey: string,
    icon?: React.ReactNode,
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'multiselect' | 'date' = 'text',
    options?: string[]
  ) => {
    const altKey =
      fieldKey === 'phoneNumber' ? 'phone_number'
      : fieldKey === 'service_needed' ? 'serviceNeeded'
      : fieldKey === 'firstname' ? 'first_name'
      : fieldKey === 'lastname' ? 'last_name'
      : fieldKey === 'first_name' ? 'firstname'
      : fieldKey === 'last_name' ? 'lastname'
      : null;
    let value: string | Date = altKey !== null ? getDisplayValue(fieldKey, altKey) : (editedData[fieldKey] ?? '');

    // Convert Date objects to string format for non-date fields
    if (value instanceof Date && type !== 'date') {
      value = value.toISOString().split('T')[0];
    }

    // Log phone number mapping to input (fieldKey 'phoneNumber', type 'tel')
    if (fieldKey === 'phoneNumber' && type === 'tel') {
      const inputValue = String((altKey ? (editedData[altKey] ?? editedData[fieldKey]) : editedData[fieldKey]) ?? '');
      console.warn('[LeadProfileModal] phone number → input:', {
        fieldKey,
        altKey,
        'editedData.phone_number': editedData.phone_number,
        'editedData.phoneNumber': editedData.phoneNumber,
        displayValue: String(value),
        inputValue,
      });
    }

    return (
      <div className="flex items-start gap-2 py-2">
        {icon && <div className="mt-2 text-muted-foreground">{icon}</div>}
        <div className="flex-1 min-w-0">
          <Label htmlFor={fieldKey} className="text-sm font-medium text-muted-foreground">
            {label}
          </Label>
          {type === 'textarea' ? (
            isEditing ? (
              <Textarea
                id={fieldKey}
                value={String(value)}
                onChange={(e) => {
                  const updates: Record<string, string> = { [fieldKey]: e.target.value };
                  if (altKey) updates[altKey] = e.target.value;
                  setEditedData(prev => ({ ...prev, ...updates }));
                }}
                className="mt-1"
                rows={3}
              />
            ) : (
              <div className="mt-1 px-3 py-2 border rounded-md bg-muted/50 text-sm min-h-[72px] whitespace-pre-wrap">
                {String(value || 'Not provided')}
              </div>
            )
          ) : type === 'select' && options ? (
            isEditing ? (
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={String(value || '')}
                onChange={(e) => {
                  const updates: Record<string, string> = { [fieldKey]: e.target.value };
                  if (altKey) updates[altKey] = e.target.value;
                  setEditedData(prev => ({ ...prev, ...updates }));
                }}
              >
                <option value="">Select...</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1 px-3 py-2 border rounded-md bg-muted/50 text-sm">
                {String(value || 'Not provided')}
              </div>
            )
          ) : type === 'multiselect' && options ? (
            <div className="mt-1">
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const isSelected = Array.isArray(value) && value.includes(option);
                  return (
                    <Button
                      key={option}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (!isEditing) return;
                        const currentArray = Array.isArray(value) ? value : [];
                        const newArray = isSelected
                          ? currentArray.filter(item => item !== option)
                          : [...currentArray, option];
                        console.log(`Multi-select ${fieldKey} clicked:`, {
                          option,
                          isSelected,
                          currentArray,
                          newArray
                        });
                        setEditedData(prev => ({ ...prev, [fieldKey]: newArray }));
                      }}
                      disabled={!isEditing}
                      className={`text-xs ${!isEditing ? 'cursor-default' : ''}`}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
              {!isEditing && (!value || (Array.isArray(value) && value.length === 0)) && (
                <div className="text-sm text-muted-foreground mt-2">No options selected</div>
              )}
            </div>
          ) : type === 'date' ? (
            isEditing ? (
              <div className="flex gap-2 mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {value ? format(new Date(value), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={value ? new Date(value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setEditedData(prev => ({ ...prev, [fieldKey]: date.toISOString().split('T')[0] }));
                        } else {
                          // Clear the date when user deselects
                          setEditedData(prev => ({ ...prev, [fieldKey]: null }));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {value && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditedData(prev => ({ ...prev, [fieldKey]: null }))}
                    className="px-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-1 px-3 py-2 border rounded-md bg-muted/50 text-sm">
                {value ? format(new Date(value), "PPP") : 'Not provided'}
              </div>
            )
          ) : (
            (fieldKey === 'phoneNumber' && type === 'tel') || isEditing ? (
              (() => {
                const inputValue = String((altKey ? (editedData[altKey] ?? editedData[fieldKey]) : editedData[fieldKey]) ?? '');
                if (fieldKey === 'phoneNumber') {
                  console.warn('[LeadProfileModal] Input value (phone):', inputValue);
                }
                return (
              <Input
                id={fieldKey}
                type={type}
                value={inputValue}
                onChange={(e) => {
                  const updates: Record<string, string> = { [fieldKey]: e.target.value };
                  // Keep both key variants in sync so inputValue reads the latest value
                  if (altKey) updates[altKey] = e.target.value;
                  setEditedData(prev => ({ ...prev, ...updates }));
                }}
                className="mt-1"
                placeholder="Not provided"
              />
                );
              })()
            ) : (
              <div className="mt-1 px-3 py-2 border rounded-md bg-muted/50 text-sm">
                {String(value || 'Not provided')}
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const renderCollapsibleSection = (sectionId: string, title: string, children: React.ReactNode, icon?: React.ReactNode) => {
    const isOpen = openSections.has(sectionId);

    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleSection(sectionId)} className="border rounded-lg mb-3">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/50">
            <div className="flex items-center gap-2">
              {icon}
              <span className="font-semibold">{title}</span>
            </div>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-2">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  if (!client) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Client Not Found</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 text-sm text-muted-foreground'>
            <p>
              {missingClientId
                ? `We couldn't find a client with ID ${missingClientId}.`
                : "We couldn't find a client that matches this link."}
            </p>
            <p>
              The client may have been removed, or you might not have permission
              to view the profile.
            </p>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='secondary'
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {(() => {
                const c = detailSource ?? (client as Record<string, unknown>);
                const first = (c.firstname ?? c.first_name ?? c.firstName) as string;
                const last = (c.lastname ?? c.last_name ?? c.lastName) as string;
                const title = first && last ? `${first} ${last}` : (c.email || `Client ${c.id}` || 'Client');
                return title as React.ReactNode;
              })()}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveChanges} size="sm" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {detailedClient != null ? (
          <div className="space-y-3">
            {/* Contact & Basic Info */}
            {renderCollapsibleSection(
              'contact',
              'Contact Information',
              <>
                {renderEditableField('First Name', 'firstname')}
                {renderEditableField('Last Name', 'lastname')}
                {renderEditableField('Email', 'email', <Mail className="h-4 w-4" />, 'email')}
                {renderEditableField('Phone Number', 'phoneNumber', <Phone className="h-4 w-4" />, 'tel')}
                {renderEditableField('Preferred Name', 'preferred_name')}
                {renderEditableField('Pronouns', 'pronouns', undefined, 'select', PRONOUNS_OPTIONS)}
                {renderEditableField('Preferred Contact Method', 'preferred_contact_method', undefined, 'select', PREFERRED_CONTACT_OPTIONS)}
                {renderEditableField('Children Expected', 'children_expected')}
                {renderEditableField('Address', 'address', <MapPin className="h-4 w-4" />, 'textarea')}
                {renderEditableField('City', 'city')}
                {renderEditableField('State', 'state')}
                {renderEditableField('ZIP Code', 'zip_code')}
                {renderEditableField('Home Type', 'home_type', undefined, 'select', HOME_TYPE_OPTIONS)}
                {renderEditableField('Home Access', 'home_access')}
                {renderEditableField('Pets', 'pets')}
              </>,
              <User className="h-5 w-5" />
            )}

            {/* Services Requested */}
            {renderCollapsibleSection(
              'services',
              'Services Requested',
              <>
                {renderEditableField('Services Interested', 'services_interested', undefined, 'multiselect', SERVICES_OPTIONS)}
                {renderEditableField('Service Support Details', 'service_support_details', undefined, 'textarea')}
                {renderEditableField('Service Needed', 'service_needed', undefined, 'textarea')}
                {renderEditableField('Service Specifics', 'service_specifics', undefined, 'textarea')}
                {renderEditableField('Annual Income', 'annual_income', undefined, 'select', ANNUAL_INCOME_OPTIONS)}
                {renderEditableField('Payment Method', 'payment_method', undefined, 'select', PAYMENT_METHOD_OPTIONS)}
              </>,
              <FileText className="h-5 w-5" />
            )}

            {/* Family Information */}
            {renderCollapsibleSection(
              'family',
              'Family Information',
              <>
                {renderEditableField('Relationship Status', 'relationship_status', undefined, 'select', RELATIONSHIP_OPTIONS)}
                {renderEditableField('Family First Name', 'first_name')}
                {renderEditableField('Family Last Name', 'last_name')}
                {renderEditableField('Family Middle Name', 'middle_name')}
                {renderEditableField('Family Pronouns', 'family_pronouns', undefined, 'select', FAMILY_PRONOUNS_OPTIONS)}
                {renderEditableField('Family Email', 'family_email', <Mail className="h-4 w-4" />, 'email')}
                {renderEditableField('Family Mobile Phone', 'mobile_phone', <Phone className="h-4 w-4" />, 'tel')}
                {renderEditableField('Family Work Phone', 'work_phone', <Phone className="h-4 w-4" />, 'tel')}
              </>,
              <Users className="h-5 w-5" />
            )}

            {/* Referral Information */}
            {renderCollapsibleSection(
              'referral',
              'Referral Information',
              <>
                {renderEditableField('Referral Source', 'referral_source', undefined, 'select', REFERRAL_OPTIONS)}
                {renderEditableField('Referral Name', 'referral_name')}
                {renderEditableField('Referral Email', 'referral_email', <Mail className="h-4 w-4" />, 'email')}
              </>,
              <Users className="h-5 w-5" />
            )}

            {/* Pregnancy & Health */}
            {renderCollapsibleSection(
              'health',
              'Pregnancy & Health Information',
              <>
                {renderEditableField('Due Date', 'due_date', <CalendarIcon className="h-4 w-4" />, 'date')}
                {renderEditableField('Birth Location', 'birth_location', undefined, 'select', BIRTH_LOCATION_OPTIONS)}
                {renderEditableField('Birth Hospital', 'birth_hospital')}
                {renderEditableField('Number of Babies', 'number_of_babies', undefined, 'select', NUMBER_OF_BABIES_OPTIONS)}
                {renderEditableField('Baby Name', 'baby_name')}
                {renderEditableField('Provider Type', 'provider_type', undefined, 'select', PROVIDER_TYPE_OPTIONS)}
                {renderEditableField('Pregnancy Number', 'pregnancy_number')}
                {renderEditableField('Allergies', 'allergies', undefined, 'textarea')}
                {renderEditableField('Health History', 'health_history', undefined, 'textarea')}
                {renderEditableField('Health Notes', 'health_notes', undefined, 'textarea')}
              </>,
              <Baby className="h-5 w-5" />
            )}

            {/* Past Pregnancies */}
            {renderCollapsibleSection(
              'past-pregnancies',
              'Past Pregnancies',
              <>
                <div className="py-2">
                  <Label className="text-sm font-medium text-muted-foreground">Had Previous Pregnancies</Label>
                  <div className="text-sm text-foreground mt-1">
                    {(editedData as any).had_previous_pregnancies ? 'Yes' : 'No'}
                  </div>
                </div>
                {renderEditableField('Previous Pregnancies Count', 'previous_pregnancies_count')}
                {renderEditableField('Living Children Count', 'living_children_count')}
                {renderEditableField('Past Pregnancy Experience', 'past_pregnancy_experience', undefined, 'textarea')}
              </>,
              <Baby className="h-5 w-5" />
            )}

            {/* Demographics */}
            {renderCollapsibleSection(
              'demographics',
              'Demographics (Optional)',
              <>
                {renderEditableField('Race/Ethnicity', 'race_ethnicity', undefined, 'select', RACE_OPTIONS)}
                {renderEditableField('Primary Language', 'primary_language', undefined, 'select', LANGUAGE_OPTIONS)}
                {renderEditableField('Client Age Range', 'client_age_range', undefined, 'select', AGE_OPTIONS)}
                {renderEditableField('Insurance', 'insurance', undefined, 'select', INSURANCE_OPTIONS)}
                {renderEditableField('Demographics Multi', 'demographics_multi', undefined, 'multiselect', DEMOGRAPHICS_MULTI_OPTIONS)}
                {renderEditableField('Demographics Annual Income', 'demographics_annual_income', undefined, 'select', DEMOGRAPHICS_INCOME_OPTIONS)}
              </>,
              <Users className="h-5 w-5" />
            )}

            {/* Account Information */}
            {renderCollapsibleSection(
              'account',
              'Account Information',
              <>
                {renderEditableField('Client Status', 'status', undefined, 'select', CLIENT_STATUS_OPTIONS)}
                <div className="py-2">
                  <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                  <div className="text-sm text-foreground mt-1">
                    {(detailedClient as any).created_at ? new Date((detailedClient as any).created_at).toLocaleDateString() : 'Not provided'}
                  </div>
                </div>
                <div className="py-2">
                  <Label className="text-sm font-medium text-muted-foreground">Updated At</Label>
                  <div className="text-sm text-foreground mt-1">
                    {detailedClient.updatedAt ? new Date(detailedClient.updatedAt).toLocaleDateString() : 'Not provided'}
                  </div>
                </div>
              </>,
              <Users className="h-5 w-5" />
            )}

            {/* Doula Assignment Section */}
            {renderCollapsibleSection(
              'doula-assignment',
              'Doula Assignment',
              <DoulaAssignment
                clientId={String(client.id)}
                canAssign={user?.role === 'admin'}
              />,
              <Users className="h-5 w-5" />
            )}

            {/* Notes Section */}
            <Collapsible open={openSections.has('notes')} onOpenChange={() => toggleSection('notes')} className="border rounded-lg mb-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-semibold">Admin Notes</span>
                    {notes.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {notes.length}
                      </span>
                    )}
                  </div>
                  {openSections.has('notes') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <div className="space-y-3">
                  {/* Add New Note */}
                  <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                    <label className="text-sm font-medium">Add New Note</label>
                    <Textarea
                      placeholder="Enter note description..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                      disabled={savingNote}
                      className="resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <Select value={noteCategory} onValueChange={setNoteCategory} disabled={savingNote}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleSaveNote}
                        disabled={savingNote || !newNote.trim()}
                        size="sm"
                      >
                        {savingNote ? 'Adding...' : 'Add Note'}
                      </Button>
                    </div>
                    {notesError && (
                      <div className="text-sm text-destructive">{notesError}</div>
                    )}
                  </div>

                  {/* Existing Notes */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Notes History {loadingNotes && <span className="text-xs">(Loading...)</span>}
                    </h4>
                    {loadingNotes && notes.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        Loading notes...
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        No notes yet. Add the first note above.
                      </div>
                    ) : (
                      notes.map((note) => {
                        // Parse the timestamp - JavaScript automatically converts UTC to local timezone
                        let noteDate = new Date(note.timestamp);

                        // TEMPORARY FIX: If timestamp is in the future, the backend has a timezone issue
                        // Adjust by converting to actual local time
                        const now = new Date();
                        if (noteDate > now) {
                          // Backend is sending local time as UTC, so we need to correct it
                          // Get the timestamp value and add back the timezone offset
                          const offsetMinutes = noteDate.getTimezoneOffset();
                          noteDate = new Date(noteDate.getTime() + (offsetMinutes * 60 * 1000));
                        }

                        return (
                          <div key={note.id} className="bg-background border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium capitalize bg-primary/10 text-primary px-2 py-1 rounded">
                                {note.metadata?.category || 'general'}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-medium">
                                  {formatDistanceToNow(noteDate, { addSuffix: true })}
                                </span>
                                <span className="text-muted-foreground/50">•</span>
                                <span className="text-muted-foreground/70">
                                  {format(noteDate, 'MMM dd, yyyy h:mm a')}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed">{note.description}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : null}

        <DialogFooter className="pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
