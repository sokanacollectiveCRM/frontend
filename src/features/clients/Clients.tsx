import { Search } from '@/common/components/header/Search';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { UserContext } from '@/common/contexts/UserContext';
import { useClients } from '@/common/hooks/clients/useClients';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { useUsers } from '@/features/clients/context/users-context';
import { toast } from 'sonner';
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import type { MutableRefObject } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { columns } from './components/users-columns';
import { PortalInviteModal } from './components/portal-invite-modal';
import { UsersDialogs } from './components/users-dialogs';
import { UsersTable } from './components/users-table';
import UsersProvider from './context/users-context';
import { TemplatesProvider } from './contexts/TemplatesContext';
import { userListSchema, UserSummary, type UserWithPortal } from './data/schema';
import { derivePortalStatus } from './utils/portalStatus';

type RouteParams = {
  clientId?: string;
};

export default function Users() {
  const { clients, isLoading, getClients, getClientById, error: clientsError } = useClients();
  const [userList, setUserList] = useState<UserSummary[]>([]);
  const { user, isLoading: userLoading } = useContext(UserContext);
  const { clientId } = useParams<RouteParams>();
  const location = useLocation();
  const [missingClientId, setMissingClientId] = useState<string | null>(null);
  const manualCloseRef = useRef(false);
  
  // Portal invite modal state
  const [portalInviteModalOpen, setPortalInviteModalOpen] = useState(false);
  const [selectedLeadForPortal, setSelectedLeadForPortal] = useState<UserSummary | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const normalizedRouteClientId = clientId ? String(clientId) : undefined;
  const isAdminClientsPath = location.pathname.startsWith('/admin/clients');

  const attemptedRouteIdsRef = useRef<Set<string>>(new Set());

  // fetch clients
  useEffect(() => {
    getClients();
  }, [getClients]);

  // Debug: Log the raw clients data before parsing
  useEffect(() => {
    if (clients.length > 0) {
      console.log('Raw clients data from API:', clients);
      console.log('First client structure:', clients[0]);
    }
  }, [clients]);

  // parse clients and summarize profile for view
  useEffect(() => {
    if (clients.length === 0) return;

    try {
      console.log(
        '🔍 DEBUG: About to parse clients with Zod:',
        clients.length,
        'clients'
      );
      console.log('🔍 DEBUG: First client before parsing:', clients[0]);

      // Try parsing each client individually to see which one fails
      clients.forEach((client, index) => {
        try {
          userListSchema.parse([client]);
          console.log(`✅ Client ${index} parsed successfully`);
        } catch (parseError) {
          console.error(`❌ Client ${index} failed to parse:`, parseError);
          console.error(`❌ Client ${index} data:`, client);
        }
      });

      const parsed = userListSchema.parse(clients);
      console.log(
        '🔍 DEBUG: Successfully parsed clients:',
        parsed.length,
        'clients'
      );
      console.log('🔍 DEBUG: First parsed client:', parsed[0]);

      setUserList(parsed);
    } catch (err) {
      console.error('Failed to parse client list with Zod:', err);
      console.error('🔍 DEBUG: Zod error details:', err);

      // If Zod parsing fails, try to use the raw data
      console.log('🔍 DEBUG: Falling back to raw clients data');
      setUserList(clients as any);
    }
  }, [clients]);

  // Debug: Log user data to help troubleshoot permission issue
  console.log('Clients page - User data:', user);
  console.log('Clients page - User role:', user?.role);
  console.log('Clients page - Is admin?', user?.role === 'admin');
  console.log('Clients page - User loading:', userLoading);
  console.log('Clients page - Clients data:', clients);
  console.log('Clients page - Clients loading:', isLoading);
  console.log('Clients page - UserList data:', userList);
  console.log('Clients page - UserList length:', userList.length);

  const navigateToOnClose = useMemo(() => {
    if (isAdminClientsPath) {
      return '/admin/clients';
    }

    return '/clients';
  }, [isAdminClientsPath]);

  // Enhance userList with portal_status. List PHI is controlled by backend (admin/assigned doulas get first_name, last_name, email).
  const userListWithPortal = useMemo(() => {
    return userList.map((user) => {
      const portalStatus = derivePortalStatus(user);
      const userWithPortal: UserWithPortal = {
        ...user,
        portal_status: portalStatus,
        invited_at: (user as any).invited_at,
        last_invite_sent_at: (user as any).last_invite_sent_at,
        invite_sent_count: (user as any).invite_sent_count || 0,
      };
      return userWithPortal;
    });
  }, [userList]);

  // Portal action handlers
  const handleInviteToPortal = useCallback((lead: UserSummary) => {
    console.log('🔔 handleInviteToPortal called with lead:', lead);
    setSelectedLeadForPortal(lead);
    setPortalInviteModalOpen(true);
    console.log('🔔 Modal state set to open');
  }, []);

  const handleConfirmInvite = useCallback(async () => {
    console.log('🔔 handleConfirmInvite called, selectedLeadForPortal:', selectedLeadForPortal);
    if (!selectedLeadForPortal) {
      console.error('❌ handleConfirmInvite: No lead selected');
      return;
    }

    setIsSendingInvite(true);
    console.log('✅ Sending invite to:', selectedLeadForPortal.email);

    try {

      // Get the frontend URL (production or current origin)
      const frontendUrl = import.meta.env.VITE_APP_FRONTEND_URL || window.location.origin;
      
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/clients/${selectedLeadForPortal.id}/portal/invite`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            frontend_url: frontendUrl, // Pass frontend URL to backend
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send invite' }));
        throw new Error(errorData.error || `Failed to send invite (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Invite API response:', data);

      // Update local state with response data
      setUserList((prevList) =>
        prevList.map((user) => {
          if (user.id === selectedLeadForPortal.id) {
            const now = new Date().toISOString();
            return {
              ...user,
              portal_status: 'invited' as const,
              invited_at: data.invited_at || now,
              last_invite_sent_at: data.last_invite_sent_at || now,
              invite_sent_count: data.invite_sent_count || ((user as any).invite_sent_count || 0) + 1,
            } as UserWithPortal;
          }
          return user;
        })
      );

      toast.success(`Invite sent to ${selectedLeadForPortal.email || 'client'}`);
      setPortalInviteModalOpen(false);
      setSelectedLeadForPortal(null);
    } catch (error: any) {
      console.error('❌ Error sending invite:', error);
      toast.error(error.message || 'Failed to send invite. Please try again.');
    } finally {
      setIsSendingInvite(false);
    }
  }, [selectedLeadForPortal]);

  const handleResendInvite = useCallback(async (lead: UserSummary) => {
    console.log('🔔 handleResendInvite called for:', lead.email);
    
    try {

      // Get the frontend URL (production or current origin)
      const frontendUrl = import.meta.env.VITE_APP_FRONTEND_URL || window.location.origin;

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/clients/${lead.id}/portal/resend`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            frontend_url: frontendUrl, // Pass frontend URL to backend
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to resend invite' }));
        throw new Error(errorData.error || `Failed to resend invite (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Resend invite API response:', data);

      // Update local state with response data
      setUserList((prevList) =>
        prevList.map((user) => {
          if (user.id === lead.id) {
            const now = new Date().toISOString();
            return {
              ...user,
              last_invite_sent_at: data.last_invite_sent_at || now,
              invite_sent_count: data.invite_sent_count || ((user as any).invite_sent_count || 0) + 1,
            } as UserWithPortal;
          }
          return user;
        })
      );

      toast.success(`Invite resent to ${lead.email || 'client'}`);
    } catch (error: any) {
      console.error('❌ Error resending invite:', error);
      toast.error(error.message || 'Failed to resend invite. Please try again.');
    }
  }, []);

  const handleDisablePortal = useCallback(async (lead: UserSummary) => {
    console.log('🔔 handleDisablePortal called for:', lead.email);
    
    try {

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/clients/${lead.id}/portal/disable`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to disable portal access' }));
        throw new Error(errorData.error || `Failed to disable portal access (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Disable portal API response:', data);

      // Update local state with response data
      setUserList((prevList) =>
        prevList.map((user) => {
          if (user.id === lead.id) {
            return {
              ...user,
              portal_status: 'disabled' as const,
            } as UserWithPortal;
          }
          return user;
        })
      );

      toast.success(`Portal access disabled for ${lead.email || 'client'}`);
    } catch (error: any) {
      console.error('❌ Error disabling portal access:', error);
      toast.error(error.message || 'Failed to disable portal access. Please try again.');
    }
  }, []);

  // Portal handlers object
  const portalHandlers = useMemo(
    () => ({
      onInviteClick: handleInviteToPortal,
      onResendInvite: handleResendInvite,
      onDisablePortal: handleDisablePortal,
    }),
    [handleInviteToPortal, handleResendInvite, handleDisablePortal]
  );

  // Show loading while user data is being fetched
  if (userLoading) {
    return <div className='p-8 text-center'>Loading...</div>;
  }

  // Temporarily comment out admin check to allow all users to see clients
  // if (!user || user.role !== 'admin') {
  //   return (
  //     <div className='p-8 text-center text-red-500'>
  //       You do not have permission to view this page.
  //     </div>
  //   );
  // }

  return (
    <TemplatesProvider>
      <UsersProvider refreshClients={getClients}>
        <RouteAwareLeadProfileLoader
          requestedClientId={normalizedRouteClientId}
          knownClients={userList}
          navigateToOnClose={navigateToOnClose}
          getClientById={getClientById}
          attemptedRouteIdsRef={attemptedRouteIdsRef}
          setMissingClientId={setMissingClientId}
          manualCloseRef={manualCloseRef}
        />
        <Header fixed>
          <Search />
          <div className='ml-auto'>
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className='flex items-center justify-between space-y-2'>
              <h2 className='text-3xl font-bold tracking-tight'>Leads</h2>
            </div>
            {clientsError && (
              <div className='p-4 mb-4 bg-red-50 border border-red-200 rounded-md'>
                <p className='text-red-800 font-semibold'>Error loading leads:</p>
                <p className='text-red-600 text-sm'>{clientsError}</p>
                <button
                  onClick={() => getClients()}
                  className='mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm'
                >
                  Retry
                </button>
              </div>
            )}
            {isLoading ? (
              <div className='flex justify-center items-center p-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                <span className='ml-3 text-gray-600'>Loading leads...</span>
              </div>
            ) : (
              <UsersTable
                columns={columns(getClients, portalHandlers)}
                data={userListWithPortal}
                clients={clients}
              />
            )}
          </div>
        </Main>
        <UsersDialogs
          missingClientId={missingClientId ?? undefined}
          onLeadProfileClose={() => {
            manualCloseRef.current = true;
          }}
        />
        <PortalInviteModal
          open={portalInviteModalOpen}
          onOpenChange={setPortalInviteModalOpen}
          lead={selectedLeadForPortal}
          onConfirm={handleConfirmInvite}
          isLoading={isSendingInvite}
        />
      </UsersProvider>
    </TemplatesProvider>
  );
}

function RouteAwareLeadProfileLoader({
  requestedClientId,
  knownClients,
  navigateToOnClose,
  getClientById,
  attemptedRouteIdsRef,
  setMissingClientId,
  manualCloseRef,
}: {
  requestedClientId?: string;
  knownClients: UserSummary[];
  navigateToOnClose: string;
  getClientById: (id: string, detailed?: boolean) => Promise<any>;
  attemptedRouteIdsRef: MutableRefObject<Set<string>>;
  setMissingClientId: React.Dispatch<React.SetStateAction<string | null>>;
  manualCloseRef: MutableRefObject<boolean>;
}) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFetchingFromRoute, setIsFetchingFromRoute] = useState(false);
  const lastRequestedIdRef = useRef<string | undefined>();

  useEffect(() => {
    if (!requestedClientId) {
      attemptedRouteIdsRef.current.clear();
      lastRequestedIdRef.current = undefined;
      setMissingClientId(null);
      manualCloseRef.current = false;
      return;
    }

    if (manualCloseRef.current) {
      return;
    }

    const normalizedId = String(requestedClientId);

    // Always fetch full detail when URL has a client id so modal gets phone_number, service_needed, etc.
    // (Avoid using list row or currentRow to skip fetch; list data may not include PHI.)
    if (attemptedRouteIdsRef.current.has(normalizedId)) {
      return;
    }

    attemptedRouteIdsRef.current.add(normalizedId);
    let isCancelled = false;

    const fetchClient = async () => {
      try {
        setIsFetchingFromRoute(true);
        const fetchedClient = await getClientById(normalizedId, true);

        if (isCancelled) return;

        if (!fetchedClient) {
          toast.error('Client profile not found.');
          setMissingClientId(normalizedId);
          setCurrentRow(null);
          setOpen('lead-profile');
          lastRequestedIdRef.current = normalizedId;
          return;
        }

        const parsedClient = mapApiClientToUserSummary(
          fetchedClient,
          normalizedId
        );

        if (!parsedClient) {
          toast.error('Unable to load client profile.');
          setMissingClientId(normalizedId);
          setCurrentRow(null);
          setOpen('lead-profile');
          lastRequestedIdRef.current = normalizedId;
          return;
        }

        setCurrentRow(
          ensureClientIdentifiers(parsedClient, fetchedClient, normalizedId)
        );
        setOpen('lead-profile');
        lastRequestedIdRef.current = normalizedId;
        setMissingClientId(null);
      } catch (error) {
        console.error('Error loading client from deep link:', error);
        toast.error('Failed to load client profile.');
        setMissingClientId(normalizedId);
        setCurrentRow(null);
        setOpen('lead-profile');
        lastRequestedIdRef.current = normalizedId;
      } finally {
        if (!isCancelled) {
          setIsFetchingFromRoute(false);
        }
      }
    };

    fetchClient();

    return () => {
      isCancelled = true;
    };
  }, [
    requestedClientId,
    currentRow?.id,
    knownClients,
    getClientById,
    setCurrentRow,
    setOpen,
    open,
    attemptedRouteIdsRef,
    setMissingClientId,
    manualCloseRef,
  ]);

  useEffect(() => {
    if (!requestedClientId) {
      return;
    }

    if (open === 'lead-profile' || isFetchingFromRoute) {
      return;
    }

    if (lastRequestedIdRef.current !== requestedClientId) {
      return;
    }

    if (currentRow) {
      return;
    }

    setMissingClientId(null);
    navigate(navigateToOnClose, { replace: true });
  }, [
    open,
    requestedClientId,
    isFetchingFromRoute,
    currentRow,
    navigate,
    navigateToOnClose,
    setMissingClientId,
  ]);

  return null;
}

type ClientIdentifier = UserSummary & Record<string, any>;

const collectClientIdentifiers = (client: ClientIdentifier | null | undefined) => {
  if (!client) return [] as string[];

  const ids = new Set<string>();
  const add = (value: unknown) => {
    if (value === null || value === undefined) return;
    const str = String(value).trim();
    if (str.length > 0) {
      ids.add(str);
    }
  };

  add((client as any).id);
  add((client as any).uuid);
  add((client as any).clientId);
  add((client as any).client_id);
  add((client as any).request_form_id);
  add((client as any).requestFormId);
  add((client as any).leadId);
  add((client as any).lead_id);
  add((client as any).formId);
  add((client as any).form_id);
  add((client as any).userId);
  add((client as any).user_id);

  const nestedUser = (client as any).user;
  if (nestedUser) {
    add(nestedUser.id);
    add(nestedUser.uuid);
    add(nestedUser.userId);
  }

  return Array.from(ids);
};

const matchesClientIdentifier = (
  client: ClientIdentifier | null | undefined,
  targetId: string
) => {
  return collectClientIdentifiers(client).some((id) => id === targetId);
};

const ensureClientIdentifiers = (
  client: ClientIdentifier,
  rawClient: any,
  fallbackId: string
) => {
  const identifiers = collectClientIdentifiers(client);
  if (identifiers.includes(fallbackId)) {
    return client;
  }

  const nextClient: ClientIdentifier = {
    ...client,
  };

  if (!nextClient.id) {
    nextClient.id = fallbackId;
  }

  if (!nextClient.uuid) {
    nextClient.uuid =
      (rawClient && (rawClient.uuid || rawClient.id || rawClient.userId)) ||
      fallbackId;
  }

  if ((nextClient as any).user && !(nextClient as any).user.id) {
    (nextClient as any).user.id = fallbackId;
  }

  return nextClient;
};

/**
 * Merge API detail/PHI fields (snake_case or camelCase) into the parsed result
 * so the lead profile modal receives and displays them.
 */
function mergeDetailFieldsIntoResult(result: UserSummary & Record<string, any>, raw: any): UserSummary & Record<string, any> {
  if (!raw || typeof raw !== 'object') return result;
  return {
    ...result,
    // Name and email: support both conventions so modal title and fields work (API returns snake_case)
    firstname: result.firstname || raw.firstname || raw.first_name || raw.firstName || '',
    lastname: result.lastname || raw.lastname || raw.last_name || raw.lastName || '',
    first_name: raw.first_name ?? raw.firstName ?? result.firstname,
    last_name: raw.last_name ?? raw.lastName ?? result.lastname,
    email: raw.email ?? result.email ?? '',
    // PHI / detail fields: explicitly map API snake_case → UI keys so form always gets values
    due_date: raw.due_date ?? raw.dueDate ?? result.due_date,
    date_of_birth: raw.date_of_birth ?? raw.dateOfBirth ?? (result as any).date_of_birth,
    address: raw.address ?? raw.address_line1 ?? raw.addressLine1 ?? (result as any).address,
    address_line1: raw.address_line1 ?? raw.addressLine1 ?? (result as any).address_line1,
    phoneNumber: raw.phone_number ?? raw.phoneNumber ?? result.phoneNumber ?? '',
    phone_number: raw.phone_number ?? raw.phoneNumber ?? result.phoneNumber ?? '',
    serviceNeeded: raw.service_needed ?? raw.serviceNeeded ?? result.serviceNeeded ?? '',
    service_needed: raw.service_needed ?? raw.serviceNeeded ?? result.serviceNeeded ?? '',
    health_history: raw.health_history ?? raw.healthHistory,
    health_notes: raw.health_notes ?? raw.healthNotes,
    allergies: raw.allergies,
    medications: raw.medications,
    pregnancy_number: raw.pregnancy_number ?? raw.pregnancyNumber,
    had_previous_pregnancies: raw.had_previous_pregnancies,
    previous_pregnancies_count: raw.previous_pregnancies_count,
    living_children_count: raw.living_children_count,
    past_pregnancy_experience: raw.past_pregnancy_experience,
    baby_sex: raw.baby_sex,
    baby_name: raw.baby_name,
    number_of_babies: raw.number_of_babies,
    race_ethnicity: raw.race_ethnicity,
    client_age_range: raw.client_age_range,
    annual_income: raw.annual_income,
    insurance: raw.insurance,
    portal_status: raw.portal_status,
    invited_at: raw.invited_at,
    last_invite_sent_at: raw.last_invite_sent_at,
    invite_sent_count: raw.invite_sent_count,
    requested_at: raw.requested_at,
    updated_at: raw.updated_at,
    is_eligible: raw.is_eligible,
  };
}

function mapApiClientToUserSummary(
  client: any,
  fallbackId?: string
): UserSummary | null {
  try {
    const parsed = userListSchema.parse([client]);
    const result = parsed[0] as UserSummary & Record<string, any>;
    const merged = mergeDetailFieldsIntoResult(result, client);
    if (fallbackId && !matchesClientIdentifier(merged as ClientIdentifier, fallbackId)) {
      return ensureClientIdentifiers(merged as ClientIdentifier, client, fallbackId);
    }
    return merged;
  } catch (error) {
    console.error('Failed to parse client from API response:', error, client);
    const rawClient = client ?? {};
    if (fallbackId && !rawClient.id) {
      rawClient.id = fallbackId;
    }
    const merged = mergeDetailFieldsIntoResult(rawClient as UserSummary & Record<string, any>, rawClient);
    return merged;
  }
}