import {
  Navigate,
  Route,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import DoulaDashboard from './DoulaDashboard';
import ProfileTab from './components/ProfileTab';
import ClientsTab from './components/ClientsTab';
import HoursTab from './components/HoursTab';
import ActivitiesTab from './components/ActivitiesTab';
import type { DoulaDashboardOutletContext } from './doulaDashboardTypes';

function DoulaProfilePage() {
  const { onProfileStatusChange } =
    useOutletContext<DoulaDashboardOutletContext>();
  const [params] = useSearchParams();
  return (
    <ProfileTab
      key={params.get('step') ?? 'profile'}
      initialStep={params.get('step') === 'documents' ? 'documents' : undefined}
      onProfileStatusChange={onProfileStatusChange}
    />
  );
}

function DoulaDocumentsPage() {
  return <Navigate to='/doula-dashboard/profile?step=documents' replace />;
}

function DoulaClientsPage() {
  const navigate = useNavigate();
  return (
    <ClientsTab
      onClientSelect={(clientId) => {
        navigate(`/doula-dashboard/activities/${clientId}`);
      }}
    />
  );
}

function DoulaHoursPage() {
  return <HoursTab />;
}

function DoulaActivitiesPage() {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId?: string }>();

  return (
    <ActivitiesTab
      clientId={clientId ?? null}
      onBack={() => {
        navigate('/doula-dashboard/clients');
      }}
    />
  );
}

const DoulaDashboardRoutes = () => (
  <Route path='/doula-dashboard' element={<DoulaDashboard />}>
    <Route index element={<Navigate to='profile' replace />} />
    <Route path='profile' element={<DoulaProfilePage />} />
    <Route path='documents' element={<DoulaDocumentsPage />} />
    <Route path='clients' element={<DoulaClientsPage />} />
    <Route path='hours' element={<DoulaHoursPage />} />
    <Route path='activities' element={<DoulaActivitiesPage />} />
    <Route path='activities/:clientId' element={<DoulaActivitiesPage />} />
  </Route>
);

export default DoulaDashboardRoutes;
