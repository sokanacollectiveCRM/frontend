import { useUser } from '@/common/hooks/user/useUser';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { CalendarWidget } from './components/CalendarWidget';
import { StatsOverview } from './components/StatsOverview';
import ClientDashboard from '@/features/client-dashboard/ClientDashboard';

export default function Home() {
  const { user, isLoading: isUserLoading } = useUser();
  const { client, isLoading: isClientLoading } = useClientAuth();
  const isDoula = user?.role === 'doula';
  const isClient = !!client;

  // Show loading state while checking auth
  if (isClientLoading || isUserLoading) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
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
    <div className="h-full p-6 space-y-8 overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstname || 'User'}!</h1>
        <p className="text-muted-foreground">
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
