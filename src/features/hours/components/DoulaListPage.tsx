import {
  fetchDoulaAssignments,
  fetchDoulas,
} from '@/api/doulas/doulaDirectoryApi';
import { assignDoula, unassignDoula } from '@/api/clients/doulaAssignments';
import { fetchClients } from '@/api/services/clients.service';
import { Search } from '@/common/components/header/Search';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { Button } from '@/common/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/common/components/ui/command';
import { ConfirmDialog } from '@/common/components/ui/confirm-dialog';
import { Input } from '@/common/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/common/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';
import { Textarea } from '@/common/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/components/ui/tabs';
import { UserContext } from '@/common/contexts/UserContext';
import { cn } from '@/lib/utils';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
} from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type ApiRecord = Record<string, unknown>;

interface DirectoryRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  assignmentCount?: number;
}

interface AssignmentRow {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  doulaId: string;
  doulaName: string;
  hospital: string;
  assignedAt: string;
  updatedAt: string;
  notes: string;
}

interface ClientOption {
  id: string;
  label: string;
  email: string;
}

interface Pager {
  limit: number;
  offset: number;
  count: number;
}

const DEFAULT_PAGER: Pager = { limit: 10, offset: 0, count: 0 };
const ALL_DOULAS_VALUE = '__all_doulas__';
const SORT_OPTIONS = [
  { value: 'updatedAt_desc', label: 'Updated (newest first)' },
  { value: 'assignedAt_desc', label: 'Assigned (newest first)' },
];

function asRecord(input: unknown): ApiRecord {
  return typeof input === 'object' && input !== null
    ? (input as ApiRecord)
    : {};
}

function getString(input: ApiRecord, keys: string[]): string {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === 'string' && value.trim().length > 0)
      return value.trim();
  }
  return '';
}

function getNumber(input: ApiRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = Number(input[key]);
    if (Number.isFinite(value)) return value;
  }
  return undefined;
}

function formatDateTime(value: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString();
}

function formatDateCompact(value: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString();
}

function toDatetimeLocal(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const tzOffsetMs = parsed.getTimezoneOffset() * 60000;
  return new Date(parsed.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}

function mapDirectoryRow(raw: ApiRecord): DirectoryRow {
  const user = asRecord(raw.user);
  const profile = asRecord(raw.profile);

  const first =
    getString(raw, ['first_name', 'firstname', 'firstName']) ||
    getString(user, ['first_name', 'firstname', 'firstName']) ||
    getString(profile, ['first_name', 'firstname', 'firstName']);
  const last =
    getString(raw, ['last_name', 'lastname', 'lastName']) ||
    getString(user, ['last_name', 'lastname', 'lastName']) ||
    getString(profile, ['last_name', 'lastname', 'lastName']);
  const explicitFullName =
    getString(raw, ['full_name', 'fullName', 'name']) ||
    getString(user, ['full_name', 'fullName', 'name']) ||
    getString(profile, ['full_name', 'fullName', 'name']);
  const email =
    getString(raw, ['email']) ||
    getString(user, ['email']) ||
    getString(profile, ['email']);
  const fullName =
    explicitFullName ||
    [first, last].filter(Boolean).join(' ').trim() ||
    (email ? 'Unknown doula' : 'Unknown doula');

  return {
    id:
      getString(raw, ['id', 'doulaId', 'doula_id', 'user_id']) ||
      getString(user, ['id', 'user_id']) ||
      `${fullName}-${email}`,
    fullName,
    email: email || '—',
    phone:
      getString(raw, ['phone', 'phone_number', 'phoneNumber', 'mobile']) ||
      getString(user, ['phone', 'phone_number', 'phoneNumber', 'mobile']) ||
      getString(profile, ['phone', 'phone_number', 'phoneNumber', 'mobile']) ||
      '—',
    assignmentCount:
      getNumber(raw, [
        'assignmentCount',
        'assignment_count',
        'activeAssignmentCount',
        'active_assignment_count',
        'assignmentsCount',
        'assignments_count',
        'totalAssignments',
        'total_assignments',
        'clientCount',
        'client_count',
      ]) ??
      getNumber(user, [
        'assignmentCount',
        'assignment_count',
        'activeAssignmentCount',
        'active_assignment_count',
        'assignmentsCount',
        'assignments_count',
        'totalAssignments',
        'total_assignments',
        'clientCount',
        'client_count',
      ]) ??
      getNumber(asRecord(raw.counts), [
        'assignments',
        'assignmentCount',
        'assignment_count',
        'activeAssignments',
        'active_assignments',
        'clients',
      ]),
  };
}

function mapAssignmentRow(raw: ApiRecord): AssignmentRow {
  const client = asRecord(raw.client);
  const clientUser = asRecord(client.user);
  const doula = asRecord(raw.doula);
  const doulaUser = asRecord(raw.doulaUser);
  const assignedDoula = asRecord(raw.assignedDoula);
  const teamMember = asRecord(raw.teamMember);

  const clientFirst =
    getString(raw, ['clientFirstName', 'client_first_name']) ||
    getString(client, ['first_name', 'firstname', 'firstName']);
  const clientLast =
    getString(raw, ['clientLastName', 'client_last_name']) ||
    getString(client, ['last_name', 'lastname', 'lastName']);
  const doulaFirst =
    getString(raw, ['doulaFirstName', 'doula_first_name']) ||
    getString(doula, ['first_name', 'firstname', 'firstName']) ||
    getString(doulaUser, ['first_name', 'firstname', 'firstName']) ||
    getString(assignedDoula, ['first_name', 'firstname', 'firstName']) ||
    getString(teamMember, ['first_name', 'firstname', 'firstName']);
  const doulaLast =
    getString(raw, ['doulaLastName', 'doula_last_name']) ||
    getString(doula, ['last_name', 'lastname', 'lastName']) ||
    getString(doulaUser, ['last_name', 'lastname', 'lastName']) ||
    getString(assignedDoula, ['last_name', 'lastname', 'lastName']) ||
    getString(teamMember, ['last_name', 'lastname', 'lastName']);
  const explicitDoulaName =
    getString(raw, ['doulaName', 'doula_name', 'doula_full_name']) ||
    getString(doula, ['full_name', 'fullName', 'name']) ||
    getString(doulaUser, ['full_name', 'fullName', 'name']) ||
    getString(assignedDoula, ['full_name', 'fullName', 'name']) ||
    getString(teamMember, ['full_name', 'fullName', 'name']);
  const doulaEmail =
    getString(raw, ['doulaEmail', 'doula_email']) ||
    getString(doula, ['email']) ||
    getString(doulaUser, ['email']) ||
    getString(assignedDoula, ['email']) ||
    getString(teamMember, ['email']);

  return {
    id:
      getString(raw, ['id']) ||
      `${getString(raw, ['clientId', 'client_id'])}-${getString(raw, ['doulaId', 'doula_id'])}`,
    clientId:
      getString(raw, ['clientId', 'client_id']) ||
      getString(raw, [
        'client_uuid',
        'clientUuid',
        'request_form_id',
        'requestFormId',
        'lead_id',
        'leadId',
        'user_id',
        'userId',
      ]) ||
      getString(client, [
        'id',
        'client_id',
        'client_uuid',
        'clientUuid',
        'request_form_id',
        'requestFormId',
        'lead_id',
        'leadId',
        'user_id',
        'userId',
      ]) ||
      getString(clientUser, ['id', 'user_id', 'userId', 'uuid']) ||
      '',
    clientName:
      [clientFirst, clientLast].filter(Boolean).join(' ').trim() ||
      getString(raw, ['clientName', 'client_name']) ||
      '—',
    clientEmail:
      getString(raw, ['clientEmail', 'client_email']) ||
      getString(client, ['email']) ||
      '—',
    clientPhone:
      getString(raw, ['clientPhone', 'client_phone']) ||
      getString(client, ['phone', 'phone_number', 'phoneNumber']) ||
      '—',
    doulaId:
      getString(raw, ['doulaId', 'doula_id']) ||
      getString(doula, ['id']) ||
      getString(doulaUser, ['id']) ||
      getString(assignedDoula, ['id']) ||
      getString(teamMember, ['id']) ||
      '',
    doulaName:
      explicitDoulaName ||
      [doulaFirst, doulaLast].filter(Boolean).join(' ').trim() ||
      (doulaEmail || '').trim() ||
      '—',
    hospital: getString(raw, ['hospital']) || '—',
    assignedAt:
      getString(raw, [
        'assignedAt',
        'assigned_at',
        'sourceTimestamp',
        'source_timestamp',
      ]) || '',
    updatedAt: getString(raw, ['updatedAt', 'updated_at']) || '',
    notes: getString(raw, ['notes', 'note']) || '',
  };
}

function PaginationControls({
  pager,
  onLimitChange,
  onOffsetChange,
}: {
  pager: Pager;
  onLimitChange: (nextLimit: number) => void;
  onOffsetChange: (nextOffset: number) => void;
}) {
  const page = Math.floor(pager.offset / Math.max(1, pager.limit)) + 1;
  const totalPages = Math.max(
    1,
    Math.ceil(pager.count / Math.max(1, pager.limit))
  );
  const start = pager.count === 0 ? 0 : pager.offset + 1;
  const end = Math.min(pager.offset + pager.limit, pager.count);

  return (
    <div className='flex items-center justify-between gap-4 border-t bg-muted/30 px-4 py-3'>
      <div className='text-sm text-muted-foreground'>
        Showing {start}-{end} of {pager.count}
      </div>
      <div className='flex items-center gap-2'>
        <Select
          value={String(pager.limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className='h-8 w-[112px]'>
            <SelectValue placeholder='Per page' />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant='outline'
          size='sm'
          className='h-8 w-8 p-0'
          disabled={pager.offset <= 0}
          onClick={() =>
            onOffsetChange(Math.max(0, pager.offset - pager.limit))
          }
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <span className='min-w-[90px] text-center text-sm font-medium'>
          Page {page} of {totalPages}
        </span>
        <Button
          variant='outline'
          size='sm'
          className='h-8 w-8 p-0'
          disabled={pager.offset + pager.limit >= pager.count}
          onClick={() => onOffsetChange(pager.offset + pager.limit)}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

export default function DoulaListPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState('directory');

  const [directoryQ, setDirectoryQ] = useState('');
  const [directoryPager, setDirectoryPager] = useState<Pager>(DEFAULT_PAGER);
  const [directoryRows, setDirectoryRows] = useState<DirectoryRow[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [directoryReloadKey, setDirectoryReloadKey] = useState(0);

  const [assignmentsQ, setAssignmentsQ] = useState('');
  const [assignmentsDoulaId, setAssignmentsDoulaId] = useState('');
  const [assignmentsHospital, setAssignmentsHospital] = useState('');
  const [assignmentsDateFrom, setAssignmentsDateFrom] = useState('');
  const [assignmentsDateTo, setAssignmentsDateTo] = useState('');
  const [assignmentsSort, setAssignmentsSort] = useState('updatedAt_desc');
  const [assignmentsPager, setAssignmentsPager] =
    useState<Pager>(DEFAULT_PAGER);
  const [assignmentRows, setAssignmentRows] = useState<AssignmentRow[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  const [assignmentsReloadKey, setAssignmentsReloadKey] = useState(0);

  const [doulaOptions, setDoulaOptions] = useState<DirectoryRow[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentRow | null>(null);
  const [removingAssignment, setRemovingAssignment] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [assignmentEditMode, setAssignmentEditMode] = useState(false);
  const [confirmDoulaSaveOpen, setConfirmDoulaSaveOpen] = useState(false);
  const [confirmAssignmentSaveOpen, setConfirmAssignmentSaveOpen] =
    useState(false);
  const [pendingDoulaUpdate, setPendingDoulaUpdate] =
    useState<DirectoryRow | null>(null);
  const [pendingAssignmentUpdate, setPendingAssignmentUpdate] =
    useState<AssignmentRow | null>(null);
  const [assignmentEditForm, setAssignmentEditForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    doulaName: '',
    hospital: '',
    assignedAt: '',
    updatedAt: '',
    notes: '',
  });

  const [selectedDoula, setSelectedDoula] = useState<DirectoryRow | null>(null);
  const [sidebarEditMode, setSidebarEditMode] = useState(false);
  const [sidebarEditForm, setSidebarEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [detailPager, setDetailPager] = useState<Pager>({
    limit: 10,
    offset: 0,
    count: 0,
  });
  const [detailRows, setDetailRows] = useState<AssignmentRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailReloadKey, setDetailReloadKey] = useState(0);
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [assigningClient, setAssigningClient] = useState(false);

  const debouncedDirectoryQ = useDebouncedValue(directoryQ);
  const debouncedAssignmentsQ = useDebouncedValue(assignmentsQ);
  const debouncedAssignmentsHospital = useDebouncedValue(assignmentsHospital);
  const doulaNameById = useMemo(
    () => new Map(doulaOptions.map((doula) => [doula.id, doula.fullName])),
    [doulaOptions]
  );

  const resolveDoulaName = useCallback(
    (row: AssignmentRow): string => {
      if (row.doulaName && row.doulaName !== '—') return row.doulaName;
      if (row.doulaId && doulaNameById.has(row.doulaId)) {
        return doulaNameById.get(row.doulaId) || '—';
      }
      return '—';
    },
    [doulaNameById]
  );
  const selectedClientOption = clientOptions.find(
    (client) => client.id === selectedClientId
  );

  const resolveClientIdForAssignment = useCallback(
    (assignment: AssignmentRow): string => {
      if (assignment.clientId) return assignment.clientId;

      const byEmail = assignment.clientEmail
        ? clientOptions.find(
            (client) =>
              client.email &&
              client.email.toLowerCase() ===
                assignment.clientEmail.toLowerCase()
          )
        : undefined;
      if (byEmail?.id) return byEmail.id;

      const byName = assignment.clientName
        ? clientOptions.find(
            (client) =>
              client.label.toLowerCase() === assignment.clientName.toLowerCase()
          )
        : undefined;
      if (byName?.id) return byName.id;

      return '';
    },
    [clientOptions]
  );

  const resolveDoulaIdForAssignment = useCallback(
    (assignment: AssignmentRow): string => {
      if (selectedDoula?.id) return selectedDoula.id;
      if (assignment.doulaId) return assignment.doulaId;

      const doulaDisplay = resolveDoulaName(assignment);
      if (!doulaDisplay || doulaDisplay === '—') return '';

      const byEmail = doulaOptions.find(
        (doula) =>
          doula.email &&
          doula.email.toLowerCase() === doulaDisplay.toLowerCase()
      );
      if (byEmail?.id) return byEmail.id;

      const byName = doulaOptions.find(
        (doula) => doula.fullName.toLowerCase() === doulaDisplay.toLowerCase()
      );
      if (byName?.id) return byName.id;

      return '';
    },
    [doulaOptions, resolveDoulaName, selectedDoula?.id]
  );

  const handleRemoveAssignment = useCallback(async () => {
    if (!selectedAssignment) return;

    const clientCandidates = Array.from(
      new Set(
        [
          resolveClientIdForAssignment(selectedAssignment),
          selectedAssignment.clientId,
          selectedAssignment.clientEmail
            ? clientOptions.find(
                (client) =>
                  client.email.toLowerCase() ===
                  selectedAssignment.clientEmail.toLowerCase()
              )?.id
            : undefined,
          selectedAssignment.clientName
            ? clientOptions.find(
                (client) =>
                  client.label.toLowerCase() ===
                  selectedAssignment.clientName.toLowerCase()
              )?.id
            : undefined,
        ].filter((value): value is string => Boolean(value))
      )
    );

    const doulaCandidates = Array.from(
      new Set(
        [
          resolveDoulaIdForAssignment(selectedAssignment),
          selectedDoula?.id,
          selectedAssignment.doulaId,
        ].filter((value): value is string => Boolean(value))
      )
    );

    if (clientCandidates.length === 0 || doulaCandidates.length === 0) {
      toast.error(
        `Missing client or doula id for this assignment. clientId=${clientCandidates[0] || 'n/a'} doulaId=${doulaCandidates[0] || 'n/a'}`
      );
      return;
    }

    setRemovingAssignment(true);
    try {
      let removed = false;
      let lastError: unknown = null;

      for (const clientId of clientCandidates) {
        for (const doulaId of doulaCandidates) {
          try {
            await unassignDoula(clientId, doulaId);
            removed = true;
            break;
          } catch (error) {
            lastError = error;
          }
        }
        if (removed) break;
      }

      if (!removed) {
        throw (
          lastError ||
          new Error(
            `Failed to remove assignment for candidates client=[${clientCandidates.join(', ')}] doula=[${doulaCandidates.join(', ')}]`
          )
        );
      }

      toast.success('Assignment removed.');

      setAssignmentRows((prev) =>
        prev.filter((row) => row.id !== selectedAssignment.id)
      );
      setDetailRows((prev) =>
        prev.filter((row) => row.id !== selectedAssignment.id)
      );
      setSelectedAssignment(null);

      setAssignmentsReloadKey((value) => value + 1);
      setDetailReloadKey((value) => value + 1);
      setDirectoryReloadKey((value) => value + 1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to remove assignment.';
      if (message.includes('Assignments feature not available')) {
        toast.error(
          'Remove assignment is temporarily unavailable because backend assignment tables are pending migration.'
        );
      } else {
        toast.error(message);
      }
    } finally {
      setRemovingAssignment(false);
    }
  }, [
    clientOptions,
    resolveClientIdForAssignment,
    resolveDoulaIdForAssignment,
    selectedAssignment,
    selectedDoula?.id,
  ]);

  const applyPendingDoulaUpdate = useCallback(() => {
    if (!pendingDoulaUpdate) return;
    const updated = pendingDoulaUpdate;

    setSelectedDoula(updated);
    setDirectoryRows((prev) =>
      prev.map((row) => (row.id === updated.id ? updated : row))
    );
    setDoulaOptions((prev) =>
      prev.map((row) => (row.id === updated.id ? updated : row))
    );
    setSidebarEditMode(false);
    setPendingDoulaUpdate(null);
    setConfirmDoulaSaveOpen(false);
    toast.success('Updated in sidebar view.');
  }, [pendingDoulaUpdate]);

  const applyPendingAssignmentUpdate = useCallback(() => {
    if (!pendingAssignmentUpdate) return;
    const updated = pendingAssignmentUpdate;

    setSelectedAssignment(updated);
    setAssignmentRows((prev) =>
      prev.map((row) => (row.id === updated.id ? updated : row))
    );
    setDetailRows((prev) =>
      prev.map((row) => (row.id === updated.id ? updated : row))
    );
    setAssignmentEditMode(false);
    setPendingAssignmentUpdate(null);
    setConfirmAssignmentSaveOpen(false);
    toast.success('Assignment updated in sidebar view.');
  }, [pendingAssignmentUpdate]);

  useEffect(() => {
    if (!selectedDoula) {
      setSidebarEditMode(false);
      setSidebarEditForm({ fullName: '', email: '', phone: '' });
      setSelectedClientId('');
      return;
    }

    setSidebarEditMode(false);
    setSidebarEditForm({
      fullName: selectedDoula.fullName,
      email: selectedDoula.email === '—' ? '' : selectedDoula.email,
      phone: selectedDoula.phone === '—' ? '' : selectedDoula.phone,
    });
  }, [selectedDoula]);

  useEffect(() => {
    if (!selectedAssignment) {
      setAssignmentEditMode(false);
      setAssignmentEditForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        doulaName: '',
        hospital: '',
        assignedAt: '',
        updatedAt: '',
        notes: '',
      });
      return;
    }

    setAssignmentEditMode(false);
    setAssignmentEditForm({
      clientName: selectedAssignment.clientName,
      clientEmail: selectedAssignment.clientEmail,
      clientPhone: selectedAssignment.clientPhone,
      doulaName: resolveDoulaName(selectedAssignment),
      hospital:
        selectedAssignment.hospital === '—' ? '' : selectedAssignment.hospital,
      assignedAt: toDatetimeLocal(selectedAssignment.assignedAt),
      updatedAt: toDatetimeLocal(selectedAssignment.updatedAt),
      notes: selectedAssignment.notes,
    });
  }, [selectedAssignment, resolveDoulaName]);

  useEffect(() => {
    let cancelled = false;

    const loadClientsForAssign = async () => {
      if (!selectedDoula?.id) return;
      setClientsLoading(true);
      try {
        const clients = await fetchClients();
        if (cancelled) return;
        setClientOptions(
          clients.map((client) => ({
            id: client.id,
            label:
              `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim() ||
              'Unnamed client',
            email: client.email || '',
          }))
        );
      } catch (error) {
        if (!cancelled) {
          setClientOptions([]);
          toast.error(
            error instanceof Error ? error.message : 'Failed to load clients.'
          );
        }
      } finally {
        if (!cancelled) setClientsLoading(false);
      }
    };

    loadClientsForAssign();

    return () => {
      cancelled = true;
    };
  }, [selectedDoula?.id]);

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    let cancelled = false;

    const loadDirectory = async () => {
      setDirectoryLoading(true);
      setDirectoryError(null);
      try {
        const result = await fetchDoulas({
          q: debouncedDirectoryQ,
          includeCounts: true,
          limit: directoryPager.limit,
          offset: directoryPager.offset,
        });
        if (cancelled) return;
        setDirectoryRows(
          result.data.map((item) => mapDirectoryRow(asRecord(item)))
        );
        setDirectoryPager((prev) => ({
          ...prev,
          limit: result.meta.limit || prev.limit,
          offset: result.meta.offset,
          count: result.meta.count,
        }));
      } catch (error) {
        if (cancelled) return;
        setDirectoryRows([]);
        setDirectoryError(
          error instanceof Error
            ? error.message
            : 'Failed to load doulas directory.'
        );
      } finally {
        if (!cancelled) setDirectoryLoading(false);
      }
    };

    loadDirectory();
    return () => {
      cancelled = true;
    };
  }, [
    debouncedDirectoryQ,
    directoryPager.limit,
    directoryPager.offset,
    directoryReloadKey,
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadAssignmentTable = async () => {
      setAssignmentsLoading(true);
      setAssignmentsError(null);
      try {
        const result = await fetchDoulaAssignments({
          q: debouncedAssignmentsQ,
          doulaId: assignmentsDoulaId || undefined,
          hospital: debouncedAssignmentsHospital,
          dateFrom: assignmentsDateFrom || undefined,
          dateTo: assignmentsDateTo || undefined,
          sort: assignmentsSort,
          limit: assignmentsPager.limit,
          offset: assignmentsPager.offset,
        });
        if (cancelled) return;
        setAssignmentRows(
          result.data.map((item) => mapAssignmentRow(asRecord(item)))
        );
        setAssignmentsPager((prev) => ({
          ...prev,
          limit: result.meta.limit || prev.limit,
          offset: result.meta.offset,
          count: result.meta.count,
        }));
      } catch (error) {
        if (cancelled) return;
        setAssignmentRows([]);
        setAssignmentsError(
          error instanceof Error
            ? error.message
            : 'Failed to load doula assignments.'
        );
      } finally {
        if (!cancelled) setAssignmentsLoading(false);
      }
    };

    loadAssignmentTable();
    return () => {
      cancelled = true;
    };
  }, [
    debouncedAssignmentsQ,
    assignmentsDoulaId,
    debouncedAssignmentsHospital,
    assignmentsDateFrom,
    assignmentsDateTo,
    assignmentsSort,
    assignmentsPager.limit,
    assignmentsPager.offset,
    assignmentsReloadKey,
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadDoulaDropdown = async () => {
      try {
        const result = await fetchDoulas({
          limit: 200,
          offset: 0,
          includeCounts: false,
        });
        if (cancelled) return;
        setDoulaOptions(
          result.data.map((item) => mapDirectoryRow(asRecord(item)))
        );
      } catch {
        if (!cancelled) setDoulaOptions([]);
      }
    };

    loadDoulaDropdown();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDoula?.id) return;
    let cancelled = false;

    const loadDetailAssignments = async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const result = await fetchDoulaAssignments({
          doulaId: selectedDoula.id,
          sort: assignmentsSort,
          limit: detailPager.limit,
          offset: detailPager.offset,
        });
        if (cancelled) return;
        setDetailRows(
          result.data.map((item) => mapAssignmentRow(asRecord(item)))
        );
        setDetailPager((prev) => ({
          ...prev,
          limit: result.meta.limit || prev.limit,
          offset: result.meta.offset,
          count: result.meta.count,
        }));
      } catch (error) {
        if (cancelled) return;
        setDetailRows([]);
        setDetailError(
          error instanceof Error
            ? error.message
            : 'Failed to load assignments for the selected doula.'
        );
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };

    loadDetailAssignments();
    return () => {
      cancelled = true;
    };
  }, [
    selectedDoula?.id,
    detailPager.limit,
    detailPager.offset,
    assignmentsSort,
    detailReloadKey,
  ]);

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex-1 overflow-auto p-4'>
          <div className='mb-6'>
            <h2 className='text-3xl font-bold tracking-tight'>Doulas</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Directory and assignment visibility for doulas (read-only).
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value='directory'>Directory</TabsTrigger>
              <TabsTrigger value='assignments'>Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value='directory' className='mt-4'>
              <div className='mb-4 flex flex-wrap items-center gap-2'>
                <Input
                  value={directoryQ}
                  onChange={(event) => {
                    setDirectoryQ(event.target.value);
                    setDirectoryPager((prev) => ({ ...prev, offset: 0 }));
                  }}
                  placeholder='Search doulas (name, email, phone)'
                  className='h-9 max-w-sm'
                />
              </div>

              <div className='overflow-hidden rounded-xl border bg-card shadow-sm'>
                {directoryError && (
                  <div className='border-b border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
                    {directoryError}
                    <Button
                      variant='outline'
                      size='sm'
                      className='ml-3 h-7'
                      onClick={() =>
                        setDirectoryReloadKey((value) => value + 1)
                      }
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {directoryLoading ? (
                  <div className='flex items-center justify-center gap-2 p-8 text-muted-foreground'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Loading doulas...
                  </div>
                ) : directoryRows.length === 0 ? (
                  <div className='p-8 text-center text-sm text-muted-foreground'>
                    No doulas found for the current search.
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Assignment Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {directoryRows.map((row) => (
                          <TableRow
                            key={row.id}
                            className='cursor-pointer'
                            onClick={() => {
                              setSelectedDoula(row);
                              setDetailPager((prev) => ({
                                ...prev,
                                offset: 0,
                              }));
                            }}
                          >
                            <TableCell className='font-medium'>
                              {row.fullName}
                            </TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.phone}</TableCell>
                            <TableCell>{row.assignmentCount ?? '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <PaginationControls
                      pager={directoryPager}
                      onLimitChange={(limit) =>
                        setDirectoryPager({
                          ...directoryPager,
                          limit,
                          offset: 0,
                        })
                      }
                      onOffsetChange={(offset) =>
                        setDirectoryPager((prev) => ({ ...prev, offset }))
                      }
                    />
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value='assignments' className='mt-4'>
              <div className='mb-4 flex flex-wrap items-end gap-2'>
                <Input
                  value={assignmentsQ}
                  onChange={(event) => {
                    setAssignmentsQ(event.target.value);
                    setAssignmentsPager((prev) => ({ ...prev, offset: 0 }));
                  }}
                  placeholder='Search assignments'
                  className='h-9 w-[220px]'
                />
                <Select
                  value={assignmentsDoulaId || ALL_DOULAS_VALUE}
                  onValueChange={(value) => {
                    setAssignmentsDoulaId(
                      value === ALL_DOULAS_VALUE ? '' : value
                    );
                    setAssignmentsPager((prev) => ({ ...prev, offset: 0 }));
                  }}
                >
                  <SelectTrigger className='h-9 w-[220px]'>
                    <SelectValue placeholder='Filter by doula' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_DOULAS_VALUE}>All doulas</SelectItem>
                    {doulaOptions.map((doula) => (
                      <SelectItem key={doula.id} value={doula.id}>
                        {doula.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={assignmentsHospital}
                  onChange={(event) => {
                    setAssignmentsHospital(event.target.value);
                    setAssignmentsPager((prev) => ({ ...prev, offset: 0 }));
                  }}
                  placeholder='Hospital'
                  className='h-9 w-[180px]'
                />
                <Input
                  type='date'
                  value={assignmentsDateFrom}
                  onChange={(event) => {
                    setAssignmentsDateFrom(event.target.value);
                    setAssignmentsPager((prev) => ({ ...prev, offset: 0 }));
                  }}
                  className='h-9 w-[160px]'
                />
                <Input
                  type='date'
                  value={assignmentsDateTo}
                  onChange={(event) => {
                    setAssignmentsDateTo(event.target.value);
                    setAssignmentsPager((prev) => ({ ...prev, offset: 0 }));
                  }}
                  className='h-9 w-[160px]'
                />
                <Select
                  value={assignmentsSort}
                  onValueChange={(value) => {
                    setAssignmentsSort(value);
                    setAssignmentsPager((prev) => ({ ...prev, offset: 0 }));
                  }}
                >
                  <SelectTrigger className='h-9 w-[220px]'>
                    <SelectValue placeholder='Sort' />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-9'
                  onClick={() => {
                    setAssignmentsQ('');
                    setAssignmentsDoulaId('');
                    setAssignmentsHospital('');
                    setAssignmentsDateFrom('');
                    setAssignmentsDateTo('');
                    setAssignmentsSort('updatedAt_desc');
                    setAssignmentsPager((prev) => ({ ...prev, offset: 0 }));
                  }}
                >
                  Clear
                </Button>
              </div>

              <div className='overflow-hidden rounded-xl border bg-card shadow-sm'>
                {assignmentsError && (
                  <div className='border-b border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
                    {assignmentsError}
                    <Button
                      variant='outline'
                      size='sm'
                      className='ml-3 h-7'
                      onClick={() =>
                        setAssignmentsReloadKey((value) => value + 1)
                      }
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {assignmentsLoading ? (
                  <div className='flex items-center justify-center gap-2 p-8 text-muted-foreground'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Loading assignments...
                  </div>
                ) : assignmentRows.length === 0 ? (
                  <div className='p-8 text-center text-sm text-muted-foreground'>
                    No assignments match the selected filters.
                  </div>
                ) : (
                  <>
                    <p className='px-4 pt-3 text-xs text-muted-foreground'>
                      Click any row to open full assignment details in the
                      sidebar.
                    </p>
                    <Table className='table-fixed'>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Doula</TableHead>
                          <TableHead>Hospital</TableHead>
                          <TableHead>Assigned At</TableHead>
                          <TableHead>Updated At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignmentRows.map((row) => (
                          <TableRow
                            key={row.id}
                            className='cursor-pointer'
                            onClick={() => setSelectedAssignment(row)}
                          >
                            <TableCell className='font-medium'>
                              {row.clientName}
                            </TableCell>
                            <TableCell className='max-w-[190px] truncate'>
                              {row.clientEmail}
                            </TableCell>
                            <TableCell>{row.clientPhone}</TableCell>
                            <TableCell className='max-w-[190px] truncate'>
                              {resolveDoulaName(row)}
                            </TableCell>
                            <TableCell className='max-w-[160px] truncate'>
                              {row.hospital}
                            </TableCell>
                            <TableCell>
                              {formatDateCompact(row.assignedAt)}
                            </TableCell>
                            <TableCell>
                              {formatDateCompact(row.updatedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <PaginationControls
                      pager={assignmentsPager}
                      onLimitChange={(limit) =>
                        setAssignmentsPager({
                          ...assignmentsPager,
                          limit,
                          offset: 0,
                        })
                      }
                      onOffsetChange={(offset) =>
                        setAssignmentsPager((prev) => ({ ...prev, offset }))
                      }
                    />
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Main>

      <Sheet
        open={Boolean(selectedDoula)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDoula(null);
            setDetailRows([]);
            setDetailError(null);
            setSidebarEditMode(false);
            setSelectedClientId('');
            setClientPickerOpen(false);
          }
        }}
      >
        <SheetContent className='sm:max-w-2xl'>
          <SheetHeader>
            <SheetTitle>{selectedDoula?.fullName ?? 'Doula detail'}</SheetTitle>
            <SheetDescription>
              Assignment details for the selected doula.
            </SheetDescription>
          </SheetHeader>

          <div className='px-4 pb-4'>
            {selectedDoula && (
              <div className='mb-4 rounded-lg border bg-muted/20 p-3'>
                {sidebarEditMode ? (
                  <>
                    <div className='grid gap-3 text-sm'>
                      <div>
                        <label className='text-muted-foreground'>Name</label>
                        <Input
                          value={sidebarEditForm.fullName}
                          onChange={(event) =>
                            setSidebarEditForm((prev) => ({
                              ...prev,
                              fullName: event.target.value,
                            }))
                          }
                          className='mt-1 h-9'
                        />
                      </div>
                      <div>
                        <label className='text-muted-foreground'>Email</label>
                        <Input
                          value={sidebarEditForm.email}
                          onChange={(event) =>
                            setSidebarEditForm((prev) => ({
                              ...prev,
                              email: event.target.value,
                            }))
                          }
                          className='mt-1 h-9'
                        />
                      </div>
                      <div>
                        <label className='text-muted-foreground'>Phone</label>
                        <Input
                          value={sidebarEditForm.phone}
                          onChange={(event) =>
                            setSidebarEditForm((prev) => ({
                              ...prev,
                              phone: event.target.value,
                            }))
                          }
                          className='mt-1 h-9'
                        />
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Assignments:
                        </span>{' '}
                        <span>{selectedDoula.assignmentCount ?? '—'}</span>
                      </div>
                    </div>

                    <div className='mt-3 flex items-center gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        onClick={() => {
                          const updated: DirectoryRow = {
                            ...selectedDoula,
                            fullName:
                              sidebarEditForm.fullName.trim() ||
                              selectedDoula.fullName,
                            email:
                              sidebarEditForm.email.trim() ||
                              selectedDoula.email,
                            phone: sidebarEditForm.phone.trim() || '—',
                          };
                          setPendingDoulaUpdate(updated);
                          setConfirmDoulaSaveOpen(true);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setSidebarEditForm({
                            fullName: selectedDoula.fullName,
                            email:
                              selectedDoula.email === '—'
                                ? ''
                                : selectedDoula.email,
                            phone:
                              selectedDoula.phone === '—'
                                ? ''
                                : selectedDoula.phone,
                          });
                          setSidebarEditMode(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='grid gap-2 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>Name:</span>{' '}
                        <span className='font-medium'>
                          {selectedDoula.fullName}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Email:</span>{' '}
                        <span>{selectedDoula.email}</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Phone:</span>{' '}
                        <span>{selectedDoula.phone}</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Assignments:
                        </span>{' '}
                        <span>{selectedDoula.assignmentCount ?? '—'}</span>
                      </div>
                    </div>
                    <Button
                      type='button'
                      size='sm'
                      className='mt-3'
                      onClick={() => setSidebarEditMode(true)}
                    >
                      Edit in Sidebar
                    </Button>
                  </>
                )}

                <div className='mt-4 border-t pt-4'>
                  <p className='mb-2 text-sm font-medium'>
                    Assign client to this doula
                  </p>
                  <div className='flex flex-col gap-2 sm:flex-row'>
                    <Popover
                      open={clientPickerOpen}
                      onOpenChange={setClientPickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          role='combobox'
                          aria-expanded={clientPickerOpen}
                          disabled={clientsLoading}
                          className='w-full justify-between sm:w-[320px]'
                        >
                          {clientsLoading
                            ? 'Loading clients...'
                            : selectedClientOption
                              ? selectedClientOption.label
                              : 'Search client...'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className='w-full p-0 sm:w-[360px]'
                        align='start'
                      >
                        <Command>
                          <CommandInput placeholder='Search clients by name or email' />
                          <CommandList>
                            <CommandEmpty>No clients found.</CommandEmpty>
                            <CommandGroup>
                              {clientOptions.map((client) => (
                                <CommandItem
                                  key={client.id}
                                  value={`${client.label} ${client.email}`}
                                  onSelect={() => {
                                    setSelectedClientId(client.id);
                                    setClientPickerOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedClientId === client.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  <span className='truncate'>
                                    {client.label}
                                    {client.email ? ` (${client.email})` : ''}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <Button
                      type='button'
                      disabled={
                        !selectedDoula?.id ||
                        !selectedClientId ||
                        assigningClient
                      }
                      onClick={async () => {
                        if (!selectedDoula?.id || !selectedClientId) return;
                        setAssigningClient(true);
                        try {
                          await assignDoula(selectedClientId, selectedDoula.id);
                          toast.success('Client assigned to doula.');
                          setSelectedClientId('');
                          setAssignmentsReloadKey((value) => value + 1);
                          setDetailReloadKey((value) => value + 1);
                          setDirectoryReloadKey((value) => value + 1);
                        } catch (error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : 'Failed to assign client to doula.'
                          );
                        } finally {
                          setAssigningClient(false);
                        }
                      }}
                    >
                      {assigningClient ? 'Assigning...' : 'Assign Client'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {detailError && (
              <div className='mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive'>
                {detailError}
                <Button
                  variant='outline'
                  size='sm'
                  className='ml-3 h-7'
                  onClick={() => setDetailReloadKey((value) => value + 1)}
                >
                  Retry
                </Button>
              </div>
            )}

            <div className='overflow-hidden rounded-lg border'>
              {detailLoading ? (
                <div className='flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Loading doula assignments...
                </div>
              ) : detailRows.length === 0 ? (
                <div className='p-6 text-center text-sm text-muted-foreground'>
                  No assignments found for this doula.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Hospital</TableHead>
                        <TableHead>Assigned At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailRows.map((row) => (
                        <TableRow
                          key={row.id}
                          className='cursor-pointer'
                          onClick={() => setSelectedAssignment(row)}
                        >
                          <TableCell className='font-medium'>
                            {row.clientName}
                          </TableCell>
                          <TableCell>{row.hospital}</TableCell>
                          <TableCell>
                            {formatDateTime(row.assignedAt)}
                          </TableCell>
                          <TableCell>{formatDateTime(row.updatedAt)}</TableCell>
                          <TableCell>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedAssignment(row);
                              }}
                            >
                              View / Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    pager={detailPager}
                    onLimitChange={(limit) =>
                      setDetailPager({ ...detailPager, limit, offset: 0 })
                    }
                    onOffsetChange={(offset) =>
                      setDetailPager((prev) => ({ ...prev, offset }))
                    }
                  />
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(selectedAssignment)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAssignment(null);
            setAssignmentEditMode(false);
          }
        }}
      >
        <SheetContent className='sm:max-w-xl'>
          <SheetHeader>
            <SheetTitle>
              {selectedAssignment?.clientName ?? 'Assignment detail'}
            </SheetTitle>
            <SheetDescription>
              Full assignment details without table scrolling.
            </SheetDescription>
          </SheetHeader>

          {selectedAssignment && (
            <div className='px-4 pb-4'>
              <div className='rounded-lg border bg-muted/20 p-4'>
                <div className='mb-3 flex items-center justify-between'>
                  <h4 className='text-base font-semibold'>
                    Assignment Details
                  </h4>
                  {!assignmentEditMode ? (
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        onClick={() => setAssignmentEditMode(true)}
                      >
                        Edit
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='text-destructive hover:text-destructive'
                        disabled={removingAssignment}
                        onClick={() => setConfirmRemoveOpen(true)}
                      >
                        {removingAssignment
                          ? 'Removing...'
                          : 'Remove Assignment'}
                      </Button>
                    </div>
                  ) : (
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        onClick={() => {
                          const updated: AssignmentRow = {
                            ...selectedAssignment,
                            clientName:
                              assignmentEditForm.clientName.trim() ||
                              selectedAssignment.clientName,
                            clientEmail:
                              assignmentEditForm.clientEmail.trim() ||
                              selectedAssignment.clientEmail,
                            clientPhone:
                              assignmentEditForm.clientPhone.trim() ||
                              selectedAssignment.clientPhone,
                            doulaName:
                              assignmentEditForm.doulaName.trim() ||
                              selectedAssignment.doulaName,
                            hospital: assignmentEditForm.hospital.trim() || '—',
                            assignedAt:
                              fromDatetimeLocal(
                                assignmentEditForm.assignedAt
                              ) || selectedAssignment.assignedAt,
                            updatedAt:
                              fromDatetimeLocal(assignmentEditForm.updatedAt) ||
                              selectedAssignment.updatedAt,
                            notes: assignmentEditForm.notes.trim(),
                          };
                          setPendingAssignmentUpdate(updated);
                          setConfirmAssignmentSaveOpen(true);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setAssignmentEditMode(false);
                          setAssignmentEditForm({
                            clientName: selectedAssignment.clientName,
                            clientEmail: selectedAssignment.clientEmail,
                            clientPhone: selectedAssignment.clientPhone,
                            doulaName: resolveDoulaName(selectedAssignment),
                            hospital:
                              selectedAssignment.hospital === '—'
                                ? ''
                                : selectedAssignment.hospital,
                            assignedAt: toDatetimeLocal(
                              selectedAssignment.assignedAt
                            ),
                            updatedAt: toDatetimeLocal(
                              selectedAssignment.updatedAt
                            ),
                            notes: selectedAssignment.notes,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {assignmentEditMode ? (
                  <div className='grid gap-3 text-sm'>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div>
                        <label className='text-muted-foreground'>Client</label>
                        <Input
                          className='mt-1 h-9'
                          value={assignmentEditForm.clientName}
                          onChange={(event) =>
                            setAssignmentEditForm((prev) => ({
                              ...prev,
                              clientName: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className='text-muted-foreground'>Doula</label>
                        <Input
                          className='mt-1 h-9'
                          value={assignmentEditForm.doulaName}
                          onChange={(event) =>
                            setAssignmentEditForm((prev) => ({
                              ...prev,
                              doulaName: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div>
                        <label className='text-muted-foreground'>
                          Client Email
                        </label>
                        <Input
                          className='mt-1 h-9'
                          value={assignmentEditForm.clientEmail}
                          onChange={(event) =>
                            setAssignmentEditForm((prev) => ({
                              ...prev,
                              clientEmail: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className='text-muted-foreground'>
                          Client Phone
                        </label>
                        <Input
                          className='mt-1 h-9'
                          value={assignmentEditForm.clientPhone}
                          onChange={(event) =>
                            setAssignmentEditForm((prev) => ({
                              ...prev,
                              clientPhone: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className='text-muted-foreground'>Hospital</label>
                      <Input
                        className='mt-1 h-9'
                        value={assignmentEditForm.hospital}
                        onChange={(event) =>
                          setAssignmentEditForm((prev) => ({
                            ...prev,
                            hospital: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div>
                        <label className='text-muted-foreground'>
                          Assigned At
                        </label>
                        <Input
                          type='datetime-local'
                          className='mt-1 h-9'
                          value={assignmentEditForm.assignedAt}
                          onChange={(event) =>
                            setAssignmentEditForm((prev) => ({
                              ...prev,
                              assignedAt: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className='text-muted-foreground'>
                          Updated At
                        </label>
                        <Input
                          type='datetime-local'
                          className='mt-1 h-9'
                          value={assignmentEditForm.updatedAt}
                          onChange={(event) =>
                            setAssignmentEditForm((prev) => ({
                              ...prev,
                              updatedAt: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className='text-muted-foreground'>Notes</label>
                      <Textarea
                        className='mt-1 min-h-[110px]'
                        value={assignmentEditForm.notes}
                        onChange={(event) =>
                          setAssignmentEditForm((prev) => ({
                            ...prev,
                            notes: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className='grid gap-3 text-sm'>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div>
                        <p className='text-xs uppercase text-muted-foreground'>
                          Client
                        </p>
                        <p className='font-medium'>
                          {selectedAssignment.clientName}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs uppercase text-muted-foreground'>
                          Doula
                        </p>
                        <p className='font-medium'>
                          {resolveDoulaName(selectedAssignment)}
                        </p>
                      </div>
                    </div>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div>
                        <p className='text-xs uppercase text-muted-foreground'>
                          Client Email
                        </p>
                        <p>{selectedAssignment.clientEmail}</p>
                      </div>
                      <div>
                        <p className='text-xs uppercase text-muted-foreground'>
                          Client Phone
                        </p>
                        <p>{selectedAssignment.clientPhone}</p>
                      </div>
                    </div>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div>
                        <p className='text-xs uppercase text-muted-foreground'>
                          Hospital
                        </p>
                        <p>{selectedAssignment.hospital}</p>
                      </div>
                      <div>
                        <p className='text-xs uppercase text-muted-foreground'>
                          Assigned At
                        </p>
                        <p>{formatDateTime(selectedAssignment.assignedAt)}</p>
                      </div>
                    </div>
                    <div>
                      <p className='text-xs uppercase text-muted-foreground'>
                        Updated At
                      </p>
                      <p>{formatDateTime(selectedAssignment.updatedAt)}</p>
                    </div>
                    <div>
                      <p className='text-xs uppercase text-muted-foreground'>
                        Notes
                      </p>
                      <p className='mt-1 whitespace-pre-wrap break-words'>
                        {selectedAssignment.notes || '—'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDoulaSaveOpen}
        onOpenChange={(open) => {
          setConfirmDoulaSaveOpen(open);
          if (!open) setPendingDoulaUpdate(null);
        }}
        className='max-w-md'
        title='Confirm doula update'
        desc='Apply these edits to the selected doula record?'
        confirmText='Save changes'
        handleConfirm={applyPendingDoulaUpdate}
      />

      <ConfirmDialog
        open={confirmAssignmentSaveOpen}
        onOpenChange={(open) => {
          setConfirmAssignmentSaveOpen(open);
          if (!open) setPendingAssignmentUpdate(null);
        }}
        className='max-w-md'
        title='Confirm assignment update'
        desc='Apply these edits to the selected assignment record?'
        confirmText='Save changes'
        handleConfirm={applyPendingAssignmentUpdate}
      />

      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        className='max-w-md'
        title='Confirm assignment removal'
        desc='This will remove the doula assignment for this client.'
        confirmText='Remove assignment'
        destructive
        isLoading={removingAssignment}
        handleConfirm={async () => {
          await handleRemoveAssignment();
          setConfirmRemoveOpen(false);
        }}
      />
    </>
  );
}
