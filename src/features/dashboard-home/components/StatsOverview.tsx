// src/features/dashboard-home/components/StatsOverview.tsx
import { useDashboardStats } from '@/common/hooks/dashboard/useDashboardStats';
import { StatsCard, StatsCardSkeleton, StatsVariant } from './StatsCard';
import { 
  Users, 
  UserCheck, 
  FileText, 
  AlertCircle, 
  CheckSquare, 
  DollarSign 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/common/components/ui/alert';

interface StatConfig {
  key: string;
  label: string;
  variant: StatsVariant;
  icon: typeof Users;
  getValue: (stats: ReturnType<typeof useDashboardStats>['stats']) => number | string;
  shouldHide?: (stats: ReturnType<typeof useDashboardStats>['stats']) => boolean;
}

// Configuration for each stat card
const statsConfig: Record<string, StatConfig> = {
  totalDoulas: {
    key: 'totalDoulas',
    label: 'Total Doulas',
    variant: 'neutral',
    icon: UserCheck,
    getValue: (stats) => stats?.totalDoulas ?? 0,
  },
  totalClients: {
    key: 'totalClients',
    label: 'Total Clients',
    variant: 'neutral',
    icon: Users,
    getValue: (stats) => stats?.totalClients ?? 0,
  },
  pendingContracts: {
    key: 'pendingContracts',
    label: 'Pending Contracts',
    variant: 'warning',
    icon: FileText,
    getValue: (stats) => stats?.pendingContracts ?? 0,
  },
  overdueNotes: {
    key: 'overdueNotes',
    label: 'Overdue Notes',
    variant: 'danger',
    icon: AlertCircle,
    getValue: (stats) => stats?.overdueNotes ?? 0,
  },
  upcomingTasks: {
    key: 'upcomingTasks',
    label: 'Upcoming Tasks',
    variant: 'info',
    icon: CheckSquare,
    getValue: (stats) => stats?.upcomingTasks ?? 0,
  },
  monthlyRevenue: {
    key: 'monthlyRevenue',
    label: 'Monthly Revenue',
    variant: 'success',
    icon: DollarSign,
    getValue: (stats) => {
      if (stats?.monthlyRevenue === null || stats?.monthlyRevenue === undefined) {
        return 'N/A';
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.monthlyRevenue);
    },
    // Hide the card entirely if revenue is null
    shouldHide: (stats) => stats?.monthlyRevenue === null || stats?.monthlyRevenue === undefined,
  },
};

/**
 * Dashboard Statistics Overview Component
 * Fetches and displays six statistic cards in a responsive grid
 */
export function StatsOverview() {
  const { stats, loading, error } = useDashboardStats();

  // Error State
  if (error) {
    return (
      <div className="w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard Statistics</AlertTitle>
          <AlertDescription>
            {error}
            <br />
            <span className="text-sm">Please try refreshing the page or contact support if the issue persists.</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading State - Show skeletons
  if (loading || !stats) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Key metrics and statistics at a glance</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Filter out cards that should be hidden
  const visibleStats = Object.values(statsConfig).filter(
    (config) => !config.shouldHide?.(stats)
  );

  // Data State - Render stats cards
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Key metrics and statistics at a glance</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {visibleStats.map((config) => (
          <StatsCard
            key={config.key}
            label={config.label}
            value={config.getValue(stats)}
            variant={config.variant}
            icon={config.icon}
          />
        ))}
      </div>
    </div>
  );
}

