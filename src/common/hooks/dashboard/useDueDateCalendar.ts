// src/common/hooks/dashboard/useDueDateCalendar.ts
import useSWR from 'swr';
import { addDays, format } from 'date-fns';

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

// Dummy data for demonstration
const DUMMY_EVENTS: DueDateEvent[] = [
  {
    id: 'event-1',
    type: 'pregnancyDueDate',
    title: 'EDD – Baby Due (Sarah Johnson)',
    date: format(new Date(), 'yyyy-MM-dd'), // Today
    color: '#34A853',
    clientId: 'client-1',
  },
  {
    id: 'event-2',
    type: 'pregnancyDueDate',
    title: 'EDD – Baby Due (Maria Garcia)',
    date: format(addDays(new Date(), 3), 'yyyy-MM-dd'), // 3 days from now
    color: '#34A853',
    clientId: 'client-2',
  },
  {
    id: 'event-3',
    type: 'pregnancyDueDate',
    title: 'EDD – Baby Due (Emily Chen)',
    date: format(addDays(new Date(), 7), 'yyyy-MM-dd'), // 7 days from now
    color: '#34A853',
    clientId: 'client-3',
  },
  {
    id: 'event-4',
    type: 'pregnancyDueDate',
    title: 'EDD – Baby Due (Jessica Williams)',
    date: format(addDays(new Date(), 12), 'yyyy-MM-dd'), // 12 days from now
    color: '#34A853',
    clientId: 'client-4',
  },
  {
    id: 'event-5',
    type: 'pregnancyDueDate',
    title: 'EDD – Baby Due (Amanda Brown)',
    date: format(addDays(new Date(), 12), 'yyyy-MM-dd'), // Same day as Jessica (multiple events)
    color: '#34A853',
    clientId: 'client-5',
  },
  {
    id: 'event-6',
    type: 'pregnancyDueDate',
    title: 'EDD – Baby Due (Rachel Martinez)',
    date: format(addDays(new Date(), 18), 'yyyy-MM-dd'), // 18 days from now
    color: '#34A853',
    clientId: 'client-6',
  },
  {
    id: 'event-7',
    type: 'pregnancyDueDate',
    title: 'EDD – Baby Due (Lisa Anderson)',
    date: format(addDays(new Date(), 25), 'yyyy-MM-dd'), // 25 days from now
    color: '#34A853',
    clientId: 'client-7',
  },
  {
    id: 'event-8',
    type: 'pregnancyDueDate',
    title: 'EDD – Baby Due (Michelle Taylor)',
    date: format(addDays(new Date(), -5), 'yyyy-MM-dd'), // 5 days ago
    color: '#34A853',
    clientId: 'client-8',
  },
];

/**
 * Custom hook to fetch due date calendar events
 * @returns {object} - { events, loading, error }
 */
export function useDueDateCalendar() {
  const BASE = import.meta.env.VITE_APP_BACKEND_URL;
  const USE_DUMMY_DATA = true; // Set to false when backend is ready
  
  // Fetcher function for SWR
  const fetcher = async (url: string): Promise<DueDateCalendarResponse> => {
    // Return dummy data for demonstration
    if (USE_DUMMY_DATA) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { events: DUMMY_EVENTS };
    }

    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch calendar events (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = await response.json();
    return data as DueDateCalendarResponse;
  };

  // Use SWR for data fetching with automatic revalidation
  const { data, error, isLoading } = useSWR<DueDateCalendarResponse>(
    `${BASE}/api/dashboard/calendar`,
    fetcher,
    {
      refreshInterval: USE_DUMMY_DATA ? 0 : 60000, // Disable refresh for dummy data
      revalidateOnFocus: !USE_DUMMY_DATA,
      revalidateOnReconnect: !USE_DUMMY_DATA,
    }
  );

  return {
    events: data?.events || [],
    loading: isLoading,
    error: error?.message || null,
  };
}

