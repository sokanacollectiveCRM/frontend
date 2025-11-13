import { useUser } from '@/common/hooks/user/useUser';
import { CalendarWidget } from './components/CalendarWidget';
import { StatsOverview } from './components/StatsOverview';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="h-full p-6 space-y-8 overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstname || 'User'}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your organization today.</p>
      </div>
      
      {/* Due Date Calendar Widget */}
      <CalendarWidget />
      
      {/* Dashboard Statistics */}
      <StatsOverview />
    </div>
  );
}
