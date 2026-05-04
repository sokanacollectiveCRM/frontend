import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { Badge } from '@/common/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/common/components/ui/alert';
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
  patchClientActivityVisibility,
  isClientActivityUuid,
  type ClientActivity,
  type ActivityType,
  type AssignedClientLite,
  type AssignedClientDetailed,
} from '@/api/doulas/doulaService';
import { buildUrl, fetchWithAuth } from '@/api/http';
import updateClient from '@/common/utils/updateClient';
import { toast } from 'sonner';
import { MessageSquare, Phone, Calendar, Mail, FileText, Plus, ArrowLeft, User, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import React from 'react';

interface ActivitiesTabProps {
  clientId: string | null;
  onBack: () => void;
}

const BIRTH_OUTCOMES_DELIVERY_TYPE_OPTIONS = [
  'Vaginal (unmedicated)',
  'Vaginal with pain medication/epidural',
  'Assisted vaginal (vacuum/forceps)',
  'Emergency Cesarean',
  'Scheduled Cesarean',
] as const;

const BIRTH_OUTCOMES_MEDICATION_OPTIONS = [
  'Pitocin',
  'Narcotic IV',
  'Epidural',
  'Nitrous Oxide',
  'Cytotec',
] as const;

const INTERNAL_METADATA_KEYS = new Set([
  'visibleToClient',
  'visible_to_client',
  'field',
  'category',
  'createdByName',
  'created_by_name',
  'createdByRole',
  'created_by_role',
]);

function displayMetadataEntries(metadata?: Record<string, any>) {
  if (!metadata) return [];
  return Object.entries(metadata).filter(([key]) => !INTERNAL_METADATA_KEYS.has(key));
}

function isBirthOutcomesStructuredActivity(activity: ClientActivity): boolean {
  const meta = activity.metadata;
  if (!meta || typeof meta !== 'object') return false;
  const category = String((meta as any).category ?? '').toLowerCase().replace(/[_\s]+/g, '-').trim();
  const field = String((meta as any).field ?? '');
  return category === 'birth-outcomes' && field === 'birth_outcomes_structured';
}

function ActivityPortalToggle({
  clientId,
  activity,
  busy,
  onToggle,
}: {
  clientId: string;
  activity: ClientActivity;
  busy: boolean;
  onToggle: (activityId: string, nextVisible: boolean) => void | Promise<void>;
}) {
  const canPatch = isClientActivityUuid(activity.id);
  return (
    <div
      className='flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-gray-100 dark:border-gray-800'
      title={
        canPatch
          ? undefined
          : 'This note has no server id, so it cannot be updated. Refresh the page after deploying the latest API.'
      }
    >
      <span className='text-xs text-gray-600'>Client portal</span>
      <div className='flex items-center gap-2'>
        <Checkbox
          id={`portal-vis-${clientId}-${activity.id}`}
          checked={activity.visibleToClient === true}
          disabled={busy || !canPatch}
          onCheckedChange={(checked) => onToggle(activity.id, checked === true)}
        />
        <Label
          htmlFor={`portal-vis-${clientId}-${activity.id}`}
          className={`text-xs font-normal dark:text-gray-300 ${canPatch ? 'cursor-pointer text-gray-700' : 'cursor-not-allowed text-gray-400'}`}
        >
          {activity.visibleToClient ? 'Visible to client' : 'Staff only'}
        </Label>
      </div>
    </div>
  );
}

export default function ActivitiesTab({ clientId, onBack }: ActivitiesTabProps) {
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [clients, setClients] = useState<AssignedClientLite[]>([]);
  const [selectedClient, setSelectedClient] = useState<AssignedClientLite | null>(null);
  const [clientDetails, setClientDetails] = useState<AssignedClientDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityVisibilityFilter, setActivityVisibilityFilter] = useState<
    'all' | 'staff' | 'client'
  >('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<
    'all' | ActivityType
  >('all');
  const [collapsedActivityDates, setCollapsedActivityDates] = useState<Set<string>>(
    new Set()
  );
  const [visibleActivityCount, setVisibleActivityCount] = useState(30);
  const [formData, setFormData] = useState({
    type: 'note' as ActivityType,
    description: '',
    metadata: {} as Record<string, any>,
    visibleToClient: false,
  });
  const [visibilityUpdatingId, setVisibilityUpdatingId] = useState<string | null>(null);
  const [birthOutcomesInductionDraft, setBirthOutcomesInductionDraft] = useState<
    boolean | undefined
  >(undefined);
  const [birthOutcomesDeliveryTypeDraft, setBirthOutcomesDeliveryTypeDraft] =
    useState('');
  const [birthOutcomesMedicationsUsedDraft, setBirthOutcomesMedicationsUsedDraft] =
    useState<string[]>([]);
  const [isSavingBirthOutcomes, setIsSavingBirthOutcomes] = useState(false);
  const [birthOutcomesLastSavedAt, setBirthOutcomesLastSavedAt] = useState<Date | null>(null);
  const birthOutcomesSectionRef = React.useRef<HTMLDivElement | null>(null);
  const [authorNamesById, setAuthorNamesById] = useState<Record<string, string>>(
    {}
  );

  const isLikelyUuid = (value: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim()
    );

  const getDisplayNameFromUser = (raw: unknown): string => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return '';
    const user = raw as Record<string, unknown>;
    const first = String(
      user.firstname ?? user.first_name ?? user.firstName ?? ''
    ).trim();
    const last = String(
      user.lastname ?? user.last_name ?? user.lastName ?? ''
    ).trim();
    const fullName = `${first} ${last}`.trim();
    if (fullName) return fullName;
    const name = String(user.name ?? '').trim();
    if (name) return name;
    const email = String(user.email ?? '').trim();
    if (email) return email;
    return '';
  };

  const getActivityAuthorLabel = (activity: ClientActivity): string => {
    const raw = String(activity.createdBy || '').trim();
    if (!raw) return '';
    if (!isLikelyUuid(raw)) return raw;
    return authorNamesById[raw] || 'Staff member';
  };

  const toRoleLabel = (value: string): string => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return '';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const getActivityAuthorRoleLabel = (activity: ClientActivity): string => {
    const directRole = toRoleLabel(String(activity.createdByRole || ''));
    if (directRole) return directRole;
    const fromMeta = activity.metadata?.createdByRole ?? activity.metadata?.created_by_role;
    return toRoleLabel(String(fromMeta || ''));
  };

  const getActivityAuthorDisplay = (activity: ClientActivity): string => {
    const name = getActivityAuthorLabel(activity);
    const role = getActivityAuthorRoleLabel(activity);
    if (!name) return '';
    return role ? `Added by ${name} (${role})` : `Added by ${name}`;
  };

  const extractLegacyBirthOutcomes = (raw: unknown): string => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return '';
    const row = raw as Record<string, unknown>;
    return String(row.birthOutcomes ?? row.birth_outcomes ?? '').trim();
  };

  const extractBirthOutcomesInduction = (raw: unknown): boolean | undefined => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
    const row = raw as Record<string, unknown>;
    const v = row.birthOutcomesInduction ?? row.birth_outcomes_induction;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
      const n = v.trim().toLowerCase();
      if (n === 'true') return true;
      if (n === 'false') return false;
    }
    return undefined;
  };

  const extractBirthOutcomesDeliveryType = (raw: unknown): string => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return '';
    const row = raw as Record<string, unknown>;
    return String(
      row.birthOutcomesDeliveryType ?? row.birth_outcomes_delivery_type ?? ''
    ).trim();
  };

  const extractBirthOutcomesMedicationsUsed = (raw: unknown): string[] => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
    const row = raw as Record<string, unknown>;
    const v =
      row.birthOutcomesMedicationsUsed ?? row.birth_outcomes_medications_used;
    if (!Array.isArray(v)) return [];
    return v.map((item) => String(item)).filter(Boolean);
  };

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
        void fetchClientDetails(clientId);
      } else if (clients.length > 0) {
        // Only show "not found" if we've already loaded clients
        setIsLoading(false);
      }
    }
  }, [clientId, clients]);

  useEffect(() => {
    const idsToResolve = Array.from(
      new Set(
        activities
          .map((a) => String(a.createdBy || '').trim())
          .filter((id) => id && isLikelyUuid(id) && !authorNamesById[id])
      )
    );

    if (idsToResolve.length === 0) return;

    let cancelled = false;

    const resolveNames = async () => {
      const resolvedEntries = await Promise.all(
        idsToResolve.map(async (id) => {
          try {
            const response = await fetchWithAuth(buildUrl(`/users/${id}`), {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (!response.ok) return [id, ''] as const;
            const payload = await response.json();
            const userObj =
              payload?.user ?? payload?.data?.user ?? payload?.data ?? payload;
            const resolvedName = getDisplayNameFromUser(userObj);
            return [id, resolvedName] as const;
          } catch {
            return [id, ''] as const;
          }
        })
      );

      const unresolvedIds = resolvedEntries
        .filter(([, name]) => !name)
        .map(([id]) => id);

      let fallbackNames: Record<string, string> = {};
      if (unresolvedIds.length > 0) {
        try {
          const teamResponse = await fetchWithAuth(buildUrl('/clients/team/all'), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (teamResponse.ok) {
            const teamPayload = await teamResponse.json();
            const teamRows = Array.isArray(teamPayload)
              ? teamPayload
              : Array.isArray(teamPayload?.data)
                ? teamPayload.data
                : [];
            fallbackNames = teamRows.reduce(
              (acc: Record<string, string>, row: Record<string, unknown>) => {
                const id = String(row.id ?? row.user_id ?? '').trim();
                if (!id) return acc;
                const name = getDisplayNameFromUser(row);
                if (name) acc[id] = name;
                return acc;
              },
              {}
            );
          }
        } catch {
          // Keep unresolved IDs hidden as "Staff member" via UI fallback.
        }
      }

      if (cancelled) return;
      setAuthorNamesById((prev) => {
        const next = { ...prev };
        resolvedEntries.forEach(([id, name]) => {
          if (name) {
            next[id] = name;
            return;
          }
          const fallback = fallbackNames[id];
          if (fallback) {
            next[id] = fallback;
          }
        });
        return next;
      });
    };

    void resolveNames();
    return () => {
      cancelled = true;
    };
  }, [activities, authorNamesById]);

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

  const fetchClientDetails = async (id: string) => {
    setIsLoadingDetails(true);
    try {
      const details = await getAssignedClientDetails(id, true);
      const typed = details as AssignedClientDetailed;
      setClientDetails(typed);
      setBirthOutcomesInductionDraft(extractBirthOutcomesInduction(typed));
      setBirthOutcomesDeliveryTypeDraft(extractBirthOutcomesDeliveryType(typed));
      setBirthOutcomesMedicationsUsedDraft(extractBirthOutcomesMedicationsUsed(typed));
    } catch {
      // Keep activities usable even when details fetch fails.
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchActivities = async (id: string) => {
    setIsLoading(true);
    setIsActivitiesLoading(true);
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
      setIsActivitiesLoading(false);
    }
  };

  const handleClientSelect = async (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setSelectedClient(client);
      setIsLoadingDetails(true);
      setIsLoading(true); // Also set activities loading
      setIsActivitiesLoading(true);
      setClientModalOpen(false);
      try {
        // Fetch detailed client information and activities in parallel
        const [details, activitiesData] = await Promise.all([
          getAssignedClientDetails(id, true).catch(() => null),
          getClientActivities(id),
        ]);
        
        if (details) {
          const typed = details as AssignedClientDetailed;
          setClientDetails(typed);
          setBirthOutcomesInductionDraft(extractBirthOutcomesInduction(typed));
          setBirthOutcomesDeliveryTypeDraft(
            extractBirthOutcomesDeliveryType(typed)
          );
          setBirthOutcomesMedicationsUsedDraft(
            extractBirthOutcomesMedicationsUsed(typed)
          );
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
        setIsActivitiesLoading(false);
      }
    }
  };

  const handleSaveBirthOutcomes = async () => {
    if (!selectedClient?.id) return;

    const missing: string[] = [];
    if (birthOutcomesInductionDraft === undefined) missing.push('Induction (Yes/No)');
    if (!birthOutcomesDeliveryTypeDraft.trim()) missing.push('Delivery type');
    if (birthOutcomesMedicationsUsedDraft.length === 0) missing.push('Medications used');
    if (missing.length > 0) {
      toast.error(`Complete required fields: ${missing.join(', ')}`);
      return;
    }

    setIsSavingBirthOutcomes(true);
    try {
      const result = await updateClient(selectedClient.id, {
        birth_outcomes_induction: birthOutcomesInductionDraft,
        birth_outcomes_delivery_type: birthOutcomesDeliveryTypeDraft.trim(),
        birth_outcomes_medications_used: birthOutcomesMedicationsUsedDraft,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save birth outcomes');
      }

      setClientDetails((prev) =>
        prev
          ? {
              ...prev,
              birthOutcomesInduction: birthOutcomesInductionDraft,
              birthOutcomesDeliveryType: birthOutcomesDeliveryTypeDraft.trim(),
              birthOutcomesMedicationsUsed: birthOutcomesMedicationsUsedDraft,
            }
          : prev
      );

      // Add a timestamped activity entry so saves are visible in the feed (staff-only).
      try {
        const description = [
          `Induction: ${birthOutcomesInductionDraft ? 'Yes' : 'No'}`,
          `Delivery type: ${birthOutcomesDeliveryTypeDraft.trim()}`,
          `Medications used: ${birthOutcomesMedicationsUsedDraft.join(', ')}`,
        ].join('\n');
        await addClientActivity(selectedClient.id, {
          type: 'note',
          description,
          metadata: {
            category: 'birth-outcomes',
            field: 'birth_outcomes_structured',
          },
          visibleToClient: false,
        });
      } catch (e: any) {
        // Non-blocking: birth outcomes are saved even if activity creation fails.
        console.warn('Birth outcomes saved but failed to create activity entry:', e?.message || e);
      }

      // Refresh activities so the new entry shows with date/time in the feed.
      try {
        const refreshed = await getClientActivities(selectedClient.id);
        setActivities(Array.isArray(refreshed) ? refreshed : []);
      } catch {
        // Non-blocking.
      }

      setBirthOutcomesLastSavedAt(new Date());
      toast.success('Birth outcomes saved');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save birth outcomes');
    } finally {
      setIsSavingBirthOutcomes(false);
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
        visibleToClient: formData.visibleToClient,
      });
      toast.success('Activity added successfully');
      setAddDialogOpen(false);
      setFormData({ type: 'note', description: '', metadata: {}, visibleToClient: false });
      // Refresh activities for the selected client
      if (selectedClient) {
        setIsLoading(true);
        setIsActivitiesLoading(true);
        try {
          const activitiesData = await getClientActivities(selectedClient.id);
          if (Array.isArray(activitiesData)) {
            setActivities(activitiesData);
          }
        } catch (error: any) {
          console.error('Failed to refresh activities:', error);
        } finally {
          setIsLoading(false);
          setIsActivitiesLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Failed to add activity:', error);
      toast.error(error.message || 'Failed to add activity');
    } finally {
      setIsAdding(false);
    }
  };

  const handlePortalVisibilityToggle = async (activityId: string, next: boolean) => {
    if (!selectedClient) return;
    setVisibilityUpdatingId(activityId);
    try {
      const updated = await patchClientActivityVisibility(selectedClient.id, activityId, next);
      setActivities((prev) => prev.map((a) => (a.id === activityId ? updated : a)));
      toast.success(next ? 'Shown on client portal' : 'Hidden from client portal');
    } catch (e: any) {
      toast.error(e?.message || 'Could not update visibility');
    } finally {
      setVisibilityUpdatingId(null);
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

  const normalizedActivitiesSorted = activities
    .slice()
    .sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });

  const filteredActivities = normalizedActivitiesSorted.filter((a) => {
    if (activityVisibilityFilter === 'client' && a.visibleToClient !== true) {
      return false;
    }
    if (activityVisibilityFilter === 'staff' && a.visibleToClient === true) {
      return false;
    }
    if (activityTypeFilter !== 'all' && a.type !== activityTypeFilter) {
      return false;
    }
    const q = activitySearch.trim().toLowerCase();
    if (!q) return true;
    const hay = [
      a.description,
      a.type,
      a.createdBy,
      a.createdByRole,
      ...(displayMetadataEntries(a.metadata).map(([k, v]) => `${k} ${String(v)}`)),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });

  const visibleActivities = filteredActivities.slice(0, visibleActivityCount);

  const visibleActivitiesGrouped = visibleActivities.reduce((acc, activity) => {
    let dateStr = 'Unknown Date';
    try {
      if (activity.createdAt) {
        const dateObj = new Date(activity.createdAt);
        if (!Number.isNaN(dateObj.getTime())) {
          dateStr = format(dateObj, 'yyyy-MM-dd');
        }
      }
    } catch {
      // ignore
    }
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(activity);
    return acc;
  }, {} as Record<string, ClientActivity[]>);

  const visibleDateKeys = Object.keys(visibleActivitiesGrouped).sort((a, b) =>
    b.localeCompare(a)
  );

  useEffect(() => {
    // When switching clients or filters, expand the most recent date group by default.
    if (visibleDateKeys.length === 0) return;
    setCollapsedActivityDates((prev) => {
      // If already configured, keep as-is.
      if (prev.size > 0) return prev;
      const next = new Set<string>();
      visibleDateKeys.slice(1).forEach((k) => next.add(k));
      return next;
    });
    // Reset pagination when filters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient?.id]);

  const birthOutcomesRecords = activities
    .filter(isBirthOutcomesStructuredActivity)
    .slice()
    .sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });

  const birthOutcomesCompletion = React.useMemo(() => {
    const induction =
      clientDetails?.birthOutcomesInduction ?? birthOutcomesInductionDraft;
    const deliveryType =
      String(clientDetails?.birthOutcomesDeliveryType ?? birthOutcomesDeliveryTypeDraft ?? '').trim();
    const meds =
      Array.isArray(clientDetails?.birthOutcomesMedicationsUsed)
        ? clientDetails?.birthOutcomesMedicationsUsed ?? []
        : birthOutcomesMedicationsUsedDraft;

    const missing: string[] = [];
    if (induction === undefined) missing.push('Induction');
    if (!deliveryType) missing.push('Delivery type');
    if (!Array.isArray(meds) || meds.length === 0) missing.push('Medications used');

    return { isComplete: missing.length === 0, missing };
  }, [
    clientDetails?.birthOutcomesInduction,
    clientDetails?.birthOutcomesDeliveryType,
    clientDetails?.birthOutcomesMedicationsUsed,
    birthOutcomesInductionDraft,
    birthOutcomesDeliveryTypeDraft,
    birthOutcomesMedicationsUsedDraft,
  ]);

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
                    <Button onClick={() => setAddDialogOpen(true)} size='sm' disabled={isLoading || isLoadingDetails || isActivitiesLoading}>
                      <Plus className='h-4 w-4 mr-2' />
                      Add Activity
                    </Button>
                  </div>

                  {isActivitiesLoading ? (
                    <Card>
                      <CardContent className='text-center py-8'>
                        <p className='text-gray-500'>Loading activities...</p>
                      </CardContent>
                    </Card>
                  ) : activities.length === 0 ? (
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
                                        <div className='flex flex-wrap items-center gap-2'>
                                          <Badge
                                            className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                                          >
                                            {activity.type}
                                          </Badge>
                                          {activity.visibleToClient ? (
                                            <Badge variant='outline' className='text-xs border-emerald-600 text-emerald-800'>
                                              Visible to client
                                            </Badge>
                                          ) : (
                                            <Badge variant='secondary' className='text-xs text-muted-foreground'>
                                              Staff only
                                            </Badge>
                                          )}
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
                                        {getActivityAuthorDisplay(activity) && (
                                          <p className='text-xs text-muted-foreground'>
                                            {getActivityAuthorDisplay(activity)}
                                          </p>
                                        )}
                                        {displayMetadataEntries(activity.metadata).length > 0 && (
                                            <div className='text-xs text-gray-600 space-y-1 pt-2 border-t'>
                                              {displayMetadataEntries(activity.metadata).map(([key, value]) => (
                                                <p key={key}>
                                                  <span className='font-medium'>{key}:</span> {String(value)}
                                                </p>
                                              ))}
                                            </div>
                                          )}
                                        {selectedClient ? (
                                          <ActivityPortalToggle
                                            clientId={(selectedClient as AssignedClientLite).id}
                                            activity={activity}
                                            busy={visibilityUpdatingId === activity.id}
                                            onToggle={handlePortalVisibilityToggle}
                                          />
                                        ) : null}
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
              <p className='text-sm text-muted-foreground pt-1 max-w-xl'>
                Click <span className='font-medium text-foreground'>Add Activity</span> to add a note or log. In that form, use{' '}
                <span className='font-medium text-foreground'>Show to client</span> if this entry should appear on the
                client&apos;s portal; leave it off to keep it staff-only.
              </p>
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

      {!selectedClient && (isLoadingDetails || isLoading) && clientId && (
        <Card>
          <CardContent className='text-center py-12'>
            <p className='text-gray-500'>Loading client information...</p>
          </CardContent>
        </Card>
      )}

      {selectedClient && (
        <>
          {!birthOutcomesCompletion.isComplete ? (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                <div>
                  <AlertTitle>Birth Outcomes required</AlertTitle>
                  <AlertDescription>
                    This is mandatory for reporting. Please complete:{' '}
                    <span className='font-medium'>
                      {birthOutcomesCompletion.missing.join(', ')}
                    </span>
                    .
                  </AlertDescription>
                </div>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      birthOutcomesSectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }}
                  >
                    Complete now
                  </Button>
                </div>
              </div>
            </Alert>
          ) : null}

          <Card>
            <CardContent className='py-5 space-y-3'>
              <div ref={birthOutcomesSectionRef} />
              <div className='space-y-1'>
                <h3 className='text-base font-semibold text-gray-900'>Birth Outcomes</h3>
                <p className='text-sm text-muted-foreground'>
                  Structured birth outcomes for reporting. All fields are required.
                </p>
              </div>
              <div className='rounded-lg border p-3 space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Induction <span className='text-destructive'>*</span>
                  </Label>
                  <div className='flex flex-wrap items-center gap-3'>
                    <div className='flex items-center gap-2'>
                      <input
                        type='radio'
                        id='bo-induction-yes'
                        name='bo-induction'
                        checked={birthOutcomesInductionDraft === true}
                        onChange={() => setBirthOutcomesInductionDraft(true)}
                      />
                      <Label htmlFor='bo-induction-yes' className='text-sm font-normal'>
                        Yes
                      </Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <input
                        type='radio'
                        id='bo-induction-no'
                        name='bo-induction'
                        checked={birthOutcomesInductionDraft === false}
                        onChange={() => setBirthOutcomesInductionDraft(false)}
                      />
                      <Label htmlFor='bo-induction-no' className='text-sm font-normal'>
                        No
                      </Label>
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Delivery type <span className='text-destructive'>*</span>
                  </Label>
                  <select
                    className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    value={birthOutcomesDeliveryTypeDraft}
                    onChange={(e) => setBirthOutcomesDeliveryTypeDraft(e.target.value)}
                  >
                    <option value=''>Select...</option>
                    {BIRTH_OUTCOMES_DELIVERY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Medications used <span className='text-destructive'>*</span>
                  </Label>
                  <div className='grid gap-2 sm:grid-cols-2'>
                    {BIRTH_OUTCOMES_MEDICATION_OPTIONS.map((opt) => {
                      const checked = birthOutcomesMedicationsUsedDraft.includes(opt);
                      return (
                        <div key={opt} className='flex items-center gap-2'>
                          <Checkbox
                            id={`bo-med-${opt}`}
                            checked={checked}
                            onCheckedChange={() => {
                              setBirthOutcomesMedicationsUsedDraft((prev) =>
                                prev.includes(opt)
                                  ? prev.filter((v) => v !== opt)
                                  : [...prev, opt]
                              );
                            }}
                          />
                          <Label htmlFor={`bo-med-${opt}`} className='text-sm font-normal'>
                            {opt}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {extractLegacyBirthOutcomes(clientDetails).trim() ? (
                  <div className='space-y-2 pt-2 border-t'>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Legacy Birth Outcomes (read-only)
                    </Label>
                    <Textarea
                      value={extractLegacyBirthOutcomes(clientDetails)}
                      rows={4}
                      readOnly
                    />
                  </div>
                ) : null}
              </div>
              <div className='flex justify-end'>
                <div className='flex flex-col items-end gap-1'>
                  {birthOutcomesLastSavedAt ? (
                    <span className='text-xs text-muted-foreground'>
                      Saved {format(birthOutcomesLastSavedAt, 'MMM dd, yyyy h:mm a')}
                    </span>
                  ) : null}
                  <Button onClick={handleSaveBirthOutcomes} disabled={isSavingBirthOutcomes}>
                  {isSavingBirthOutcomes ? 'Saving...' : 'Save Birth Outcomes'}
                  </Button>
                </div>
              </div>

              <div className='pt-3 border-t'>
                <div className='flex items-center justify-between gap-2'>
                  <h4 className='text-sm font-semibold text-gray-900'>Birth Outcomes Records</h4>
                  <span className='text-xs text-muted-foreground'>
                    {birthOutcomesRecords.length} record{birthOutcomesRecords.length === 1 ? '' : 's'}
                  </span>
                </div>
                {birthOutcomesRecords.length === 0 ? (
                  <p className='text-sm text-muted-foreground mt-2'>No saved birth outcomes records yet.</p>
                ) : (
                  <div className='mt-3 space-y-2'>
                    {birthOutcomesRecords.slice(0, 3).map((record) => (
                      <div key={record.id} className='rounded-lg border bg-background p-3 space-y-1'>
                        <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                          <Badge variant='secondary' className='text-xs'>Staff only</Badge>
                          <span>
                            {(() => {
                              try {
                                const d = new Date(record.createdAt);
                                return Number.isNaN(d.getTime())
                                  ? ''
                                  : format(d, 'MMM dd, yyyy h:mm a');
                              } catch {
                                return '';
                              }
                            })()}
                          </span>
                        </div>
                        <p className='text-sm whitespace-pre-wrap text-gray-900'>{record.description}</p>
                        {getActivityAuthorDisplay(record) ? (
                          <p className='text-xs text-muted-foreground'>
                            {getActivityAuthorDisplay(record)}
                          </p>
                        ) : null}
                      </div>
                    ))}
                    {birthOutcomesRecords.length > 3 ? (
                      <p className='text-xs text-muted-foreground'>
                        Showing the latest 3 records. See the Activities list below for the full history.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {(isLoadingDetails || isActivitiesLoading) ? (
            <Card>
              <CardContent className='text-center py-12'>
                <p className='text-gray-500'>Loading activities...</p>
              </CardContent>
            </Card>
          ) : activities.length === 0 ? (
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
            <Card>
              <CardHeader className='pb-3'>
                <div className='flex flex-col gap-3'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <CardTitle className='text-base'>Activities</CardTitle>
                    <div className='text-xs text-muted-foreground'>
                      Showing {Math.min(visibleActivities.length, filteredActivities.length)} of{' '}
                      {filteredActivities.length}
                    </div>
                  </div>

                  <div className='grid gap-2 md:grid-cols-3'>
                    <Input
                      placeholder='Search notes, author, metadata...'
                      value={activitySearch}
                      onChange={(e) => {
                        setActivitySearch(e.target.value);
                        setVisibleActivityCount(30);
                        setCollapsedActivityDates(new Set());
                      }}
                    />
                    <select
                      className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                      value={activityVisibilityFilter}
                      onChange={(e) => {
                        setActivityVisibilityFilter(e.target.value as any);
                        setVisibleActivityCount(30);
                        setCollapsedActivityDates(new Set());
                      }}
                    >
                      <option value='all'>All visibility</option>
                      <option value='staff'>Staff only</option>
                      <option value='client'>Visible to client</option>
                    </select>
                    <select
                      className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                      value={activityTypeFilter}
                      onChange={(e) => {
                        setActivityTypeFilter(e.target.value as any);
                        setVisibleActivityCount(30);
                        setCollapsedActivityDates(new Set());
                      }}
                    >
                      <option value='all'>All types</option>
                      <option value='note'>Note</option>
                      <option value='call'>Call</option>
                      <option value='visit'>Visit</option>
                      <option value='email'>Email</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>

                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='flex flex-wrap gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          if (visibleDateKeys.length === 0) return;
                          setCollapsedActivityDates(new Set(visibleDateKeys));
                        }}
                      >
                        Collapse all
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setCollapsedActivityDates(new Set())}
                      >
                        Expand all
                      </Button>
                    </div>
                    {filteredActivities.length > visibleActivities.length ? (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setVisibleActivityCount((n) => n + 30)}
                      >
                        Load more
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                {filteredActivities.length === 0 ? (
                  <div className='py-8 text-center text-sm text-muted-foreground'>
                    No activities match your filters.
                  </div>
                ) : (
                  <div className='max-h-[70vh] overflow-y-auto pr-1 space-y-4'>
                    {visibleDateKeys.map((date) => {
                      const dateActivities = visibleActivitiesGrouped[date] ?? [];
                      const isCollapsed = collapsedActivityDates.has(date);
                      return (
                        <div key={date}>
                          <button
                            type='button'
                            className='sticky top-0 z-10 flex w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-left'
                            onClick={() => {
                              setCollapsedActivityDates((prev) => {
                                const next = new Set(prev);
                                if (next.has(date)) next.delete(date);
                                else next.add(date);
                                return next;
                              });
                            }}
                          >
                            <span className='text-sm font-semibold text-gray-700'>
                              {(() => {
                                try {
                                  const dateObj = new Date(date);
                                  if (Number.isNaN(dateObj.getTime())) return date;
                                  return format(dateObj, 'MMMM dd, yyyy');
                                } catch {
                                  return date;
                                }
                              })()}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {dateActivities.length} item{dateActivities.length === 1 ? '' : 's'}{' '}
                              • {isCollapsed ? 'Show' : 'Hide'}
                            </span>
                          </button>

                          {!isCollapsed ? (
                            <div className='mt-3 space-y-3'>
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
                                        <div className='flex flex-wrap items-center gap-2'>
                                          <Badge
                                            className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                                          >
                                            {activity.type}
                                          </Badge>
                                          {activity.visibleToClient ? (
                                            <Badge variant='outline' className='text-xs border-emerald-600 text-emerald-800'>
                                              Visible to client
                                            </Badge>
                                          ) : (
                                            <Badge variant='secondary' className='text-xs text-muted-foreground'>
                                              Staff only
                                            </Badge>
                                          )}
                                          <span className='text-xs text-gray-500'>
                                            {(() => {
                                              try {
                                                if (!activity.createdAt) return '';
                                                const dateObj = new Date(activity.createdAt);
                                                if (Number.isNaN(dateObj.getTime())) return '';
                                                return format(dateObj, 'h:mm a');
                                              } catch {
                                                return '';
                                              }
                                            })()}
                                          </span>
                                        </div>
                                        <p className='text-sm text-gray-900 whitespace-pre-wrap'>
                                          {activity.description}
                                        </p>
                                        {getActivityAuthorDisplay(activity) && (
                                          <p className='text-xs text-muted-foreground'>
                                            {getActivityAuthorDisplay(activity)}
                                          </p>
                                        )}
                                        {displayMetadataEntries(activity.metadata).length > 0 && (
                                          <div className='text-xs text-gray-600 space-y-1 pt-2 border-t'>
                                            {displayMetadataEntries(activity.metadata).map(([key, value]) => (
                                              <p key={key}>
                                                <span className='font-medium'>{key}:</span> {String(value)}
                                              </p>
                                            ))}
                                          </div>
                                        )}
                                        {selectedClient ? (
                                          <ActivityPortalToggle
                                            clientId={(selectedClient as AssignedClientLite).id}
                                            activity={activity}
                                            busy={visibilityUpdatingId === activity.id}
                                            onToggle={handlePortalVisibilityToggle}
                                          />
                                        ) : null}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add Activity Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className='max-h-[min(90vh,640px)] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>
              Record an activity for {selectedClient?.firstname || 'No'} {selectedClient?.lastname || 'Name'}. Use{' '}
              <span className='font-medium text-foreground'>Show to client</span> below only if they should see this on
              their portal.
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
            <div className='flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30 p-3'>
              <Checkbox
                id='visible-to-client'
                checked={formData.visibleToClient}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    visibleToClient: checked === true,
                  }))
                }
              />
              <div className='space-y-1'>
                <Label htmlFor='visible-to-client' className='cursor-pointer font-medium leading-snug'>
                  Show to client
                </Label>
                <p className='text-xs text-muted-foreground leading-snug'>
                  Off (default): staff only — not shown on the client portal. On: appears under &quot;Updates from your
                  care team&quot; for this client.
                </p>
              </div>
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
