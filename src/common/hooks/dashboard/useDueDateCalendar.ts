// src/common/hooks/dashboard/useDueDateCalendar.ts
import useSWR from 'swr';

export interface DueDateEvent {
  id: string;
  type: 'pregnancyDueDate';
  title: string;
  date: string; // YYYY-MM-DD format
  color: string;
  clientId?: string;
}

export interface DueDateCalendarResponse {
  events: DueDateEvent[];
}

/**
 * Custom hook to fetch due date calendar events
 * @returns {object} - { events, loading, error }
 */
export function useDueDateCalendar() {
  const BASE = import.meta.env.VITE_APP_BACKEND_URL;

  const fetcher = async (url: string): Promise<DueDateCalendarResponse> => {
    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { events: [] };
      }

      const data = await response.json();
      return data as DueDateCalendarResponse;
    } catch {
      return { events: [] };
    }
  };

  const { data, error, isLoading } = useSWR<DueDateCalendarResponse>(
    `${BASE}/api/dashboard/calendar`,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    events: data?.events ?? [],
    loading: isLoading,
    error: null, // Treat failures as empty calendar; no error UI
  };
}

