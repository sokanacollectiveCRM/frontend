// src/common/hooks/dashboard/useDashboardStats.ts
import { fetchDoulas } from '@/api/doulas/doulaDirectoryApi';
import { buildUrl, fetchWithAuth } from '@/api/http';
import { fetchClients } from '@/api/services/clients.service';
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
  const computePendingContracts = (
    clients: Awaited<ReturnType<typeof fetchClients>>
  ): number => {
    return clients.filter((client) => {
      const contractStatus = String(client.contractStatus || '').toLowerCase();
      const hasSigned =
        client.hasSignedContract === true || contractStatus === 'signed';
      if (hasSigned) return false;

      // Treat contract-stage unsigned records as pending.
      if (contractStatus === 'pending' || contractStatus === 'not_sent')
        return true;
      return client.status === 'contract';
    }).length;
  };

  const fetcher = async (): Promise<DashboardStats> => {
    // Best-effort fetch for optional metrics (overdue, tasks, revenue).
    let baseStats: DashboardStats = EMPTY_STATS;
    try {
      const response = await fetchWithAuth(buildUrl('/api/dashboard/stats'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const raw = await response.json();
        const obj =
          raw && typeof raw === 'object' && !Array.isArray(raw)
            ? (raw as Record<string, unknown>)
            : {};
        const payload =
          obj.data && typeof obj.data === 'object'
            ? (obj.data as Record<string, unknown>)
            : obj;

        baseStats = {
          totalDoulas: Number(payload.totalDoulas ?? 0),
          totalClients: Number(payload.totalClients ?? 0),
          pendingContracts: Number(payload.pendingContracts ?? 0),
          overdueNotes: Number(payload.overdueNotes ?? 0),
          upcomingTasks: Number(payload.upcomingTasks ?? 0),
          monthlyRevenue:
            payload.monthlyRevenue === null ||
            payload.monthlyRevenue === undefined
              ? null
              : Number(payload.monthlyRevenue),
        };
      }
    } catch {
      // Keep EMPTY_STATS fallback and continue with computed values below.
    }

    const [doulasResult, clientsResult] = await Promise.allSettled([
      fetchDoulas({ limit: 1, offset: 0 }),
      fetchClients(),
    ]);

    const totalDoulas =
      doulasResult.status === 'fulfilled'
        ? doulasResult.value.meta.count
        : baseStats.totalDoulas;

    const clients =
      clientsResult.status === 'fulfilled' ? clientsResult.value : [];
    const totalClients =
      clientsResult.status === 'fulfilled'
        ? clients.length
        : baseStats.totalClients;
    const pendingContracts =
      clientsResult.status === 'fulfilled'
        ? computePendingContracts(clients)
        : baseStats.pendingContracts;

    return {
      ...baseStats,
      totalDoulas,
      totalClients,
      pendingContracts,
    };
  };

  const { data, error, isLoading } = useSWR<DashboardStats>(
    'dashboard-stats-computed',
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
