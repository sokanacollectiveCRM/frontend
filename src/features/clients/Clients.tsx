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
} from 'react';
import type { MutableRefObject } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { columns } from './components/users-columns';
import { UsersDialogs } from './components/users-dialogs';
import { UsersTable } from './components/users-table';
import UsersProvider from './context/users-context';
import { TemplatesProvider } from './contexts/TemplatesContext';
import { userListSchema, UserSummary } from './data/schema';

type RouteParams = {
  clientId?: string;
};

export default function Users() {
  const { clients, isLoading, getClients, getClientById } = useClients();
  const [userList, setUserList] = useState<UserSummary[]>([]);
  const { user, isLoading: userLoading } = useContext(UserContext);
  const { clientId } = useParams<RouteParams>();
  const location = useLocation();
  const [missingClientId, setMissingClientId] = useState<string | null>(null);
  const manualCloseRef = useRef(false);

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
            {isLoading ? (
              <div className='flex justify-center items-center p-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                <span className='ml-3 text-gray-600'>Loading leads...</span>
              </div>
            ) : (
              <UsersTable
                columns={columns(getClients)}
                data={userList}
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

    if (
      open === 'lead-profile' &&
      currentRow?.id &&
      String(currentRow.id) === normalizedId
    ) {
      lastRequestedIdRef.current = normalizedId;
      return;
    }

    const existingClient = knownClients.find((client) =>
      matchesClientIdentifier(client as ClientIdentifier, normalizedId)
    );

    if (existingClient) {
      setCurrentRow(ensureClientIdentifiers(existingClient, null, normalizedId));
      setOpen('lead-profile');
      lastRequestedIdRef.current = normalizedId;
      setMissingClientId(null);
      return;
    }

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

function mapApiClientToUserSummary(
  client: any,
  fallbackId?: string
): UserSummary | null {
  try {
    const parsed = userListSchema.parse([client]);
    const result = parsed[0];
    if (fallbackId && !matchesClientIdentifier(result as ClientIdentifier, fallbackId)) {
      return ensureClientIdentifiers(result as ClientIdentifier, client, fallbackId);
    }
    return result;
  } catch (error) {
    console.error('Failed to parse client from API response:', error, client);
    const rawClient = client ?? {};
    if (fallbackId && !rawClient.id) {
      rawClient.id = fallbackId;
    }
    return rawClient as UserSummary;
  }
}
