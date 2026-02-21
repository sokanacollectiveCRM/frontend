import { useUser } from '@/common/hooks/user/useUser';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { CalendarWidget } from './components/CalendarWidget';
import { StatsOverview } from './components/StatsOverview';
import ClientDashboard from '@/features/client-dashboard/ClientDashboard';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const QUICKBOOKS_CONNECTED_KEY = 'quickbooks_just_connected';

export default function Home() {
  const { user, isLoading: isUserLoading } = useUser();
  const { client, isLoading: isClientLoading } = useClientAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDoula = user?.role === 'doula';
  const isClient = !!client;
  const displayFirstName =
    user?.firstname ||
    user?.first_name ||
    user?.firstName ||
    user?.name?.split?.(' ')?.[0] ||
    'User';

  // Show notification when user is redirected back to dashboard after connecting QuickBooks
  useEffect(() => {
    const fromUrl = searchParams.get('quickbooks_connected') === '1';
    const fromStorage = sessionStorage.getItem(QUICKBOOKS_CONNECTED_KEY);
    if (fromUrl || fromStorage) {
      toast.success(
        'QuickBooks is connected. You can use it for invoicing and customers.'
      );
      sessionStorage.removeItem(QUICKBOOKS_CONNECTED_KEY);
      if (fromUrl) {
        searchParams.delete('quickbooks_connected');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  // Show loading state while checking auth
  if (isClientLoading || isUserLoading) {
    return (
      <div className='h-full p-6 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  // Show client dashboard if client is logged in via Supabase
  if (isClient) {
    return <ClientDashboard />;
  }

  // Show regular dashboard for admin/doula users
  return (
    <div className='h-full p-6 space-y-8 overflow-y-auto'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Welcome back, {displayFirstName}!
        </h1>
        <p className='text-muted-foreground'>
          {isDoula
            ? "Here's your calendar for today."
            : "Here's what's happening with your organization today."}
        </p>
      </div>

      {/* Due Date Calendar Widget */}
      <CalendarWidget />

      {/* Dashboard Statistics - Only show for admins */}
      {!isDoula && <StatsOverview />}
    </div>
  );
}
