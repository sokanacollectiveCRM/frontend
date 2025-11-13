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

// Dummy data for demonstration
const DUMMY_STATS: DashboardStats = {
  totalDoulas: 24,
  totalClients: 156,
  pendingContracts: 8,
  overdueNotes: 3,
  upcomingTasks: 12,
  monthlyRevenue: 45600,
};

/**
 * Custom hook to fetch dashboard statistics
 * @returns {object} - { stats, loading, error }
 */
export function useDashboardStats() {
  const BASE = import.meta.env.VITE_APP_BACKEND_URL;
  const USE_DUMMY_DATA = true; // Set to false when backend is ready
  
  // Fetcher function for SWR
  const fetcher = async (url: string): Promise<DashboardStats> => {
    // Return dummy data for demonstration
    if (USE_DUMMY_DATA) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return DUMMY_STATS;
    }

    const token = localStorage.getItem('authToken');
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch dashboard stats (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = await response.json();
    return data as DashboardStats;
  };

  // Use SWR for data fetching with automatic revalidation
  const { data, error, isLoading } = useSWR<DashboardStats>(
    `${BASE}/api/dashboard/stats`,
    fetcher,
    {
      refreshInterval: USE_DUMMY_DATA ? 0 : 30000, // Disable refresh for dummy data
      revalidateOnFocus: !USE_DUMMY_DATA,
      revalidateOnReconnect: !USE_DUMMY_DATA,
    }
  );

  return {
    stats: data,
    loading: isLoading,
    error: error?.message || null,
  };
}

