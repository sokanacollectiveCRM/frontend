// src/common/hooks/dashboard/useDashboardStats.ts
import useSWR from 'swr';

export interface DashboardStats {
  totalDoulas: number;
  totalClients: number;
  pendingContracts: number;
  overdueNotes: number;
  upcomingTasks: number;
  monthlyRevenue: number | null;
}

const EMPTY_STATS: DashboardStats = {
  totalDoulas: 0,
  totalClients: 0,
  pendingContracts: 0,
  overdueNotes: 0,
  upcomingTasks: 0,
  monthlyRevenue: null,
};

/**
 * Custom hook to fetch dashboard statistics
 * @returns {object} - { stats, loading, error }
 */
export function useDashboardStats() {
  const BASE = import.meta.env.VITE_APP_BACKEND_URL;

  const fetcher = async (url: string): Promise<DashboardStats> => {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return EMPTY_STATS;
      }
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch dashboard stats (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = await response.json();
    return data as DashboardStats;
  };

  const { data, error, isLoading } = useSWR<DashboardStats>(
    `${BASE}/api/dashboard/stats`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      fallbackData: EMPTY_STATS,
    }
  );

  return {
    stats: data ?? EMPTY_STATS,
    loading: isLoading,
    error: error?.message ?? null,
  };
}

