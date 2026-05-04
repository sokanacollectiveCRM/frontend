import { useEffect, useState } from 'react';
import { normalizeHourType, type HourType } from '@/features/hours/data/hour-types';

type WorkLogEntry = {
  id: string;
  client: {
    firstname: string;
    lastname: string;
  };
  doula: {
    firstname: string;
    lastname: string;
  };
  start_time: string;
  end_time: string;
  hours: number;
  type: HourType;
  note?: {
    content?: string;
  } | null;
};

export default function useWorkLog(userId?: string) {
  const [hours, setHours] = useState<WorkLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    async function fetchWorkLog() {
      try {

        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/users/${userId}/hours`,
          {
            headers: {
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching work logs: ${response.status}`);
        }

        const data = await response.json();
        const entries: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.hours)
            ? data.hours
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setHours(
          entries.map((entry) => {
            const startTime = entry.start_time || entry.startTime || '';
            const endTime = entry.end_time || entry.endTime || '';
            const start = startTime ? new Date(startTime) : null;
            const end = endTime ? new Date(endTime) : null;
            const computedHours =
              start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
                ? Math.max(0, Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 10) / 10)
                : 0;

            return {
              id: String(entry.id ?? ''),
              client: {
                firstname: String(entry.client?.firstname ?? entry.client?.user?.firstname ?? entry.client?.first_name ?? entry.client?.user?.first_name ?? ''),
                lastname: String(entry.client?.lastname ?? entry.client?.user?.lastname ?? entry.client?.last_name ?? entry.client?.user?.last_name ?? ''),
              },
              doula: {
                firstname: String(entry.doula?.firstname ?? entry.doula?.user?.firstname ?? entry.doula?.first_name ?? entry.doula?.user?.first_name ?? ''),
                lastname: String(entry.doula?.lastname ?? entry.doula?.user?.lastname ?? entry.doula?.last_name ?? entry.doula?.user?.last_name ?? ''),
              },
              start_time: startTime,
              end_time: endTime,
              hours: typeof entry.hours === 'number' ? entry.hours : computedHours,
              type: normalizeHourType(entry.type || entry.hour_type || entry.hourType),
              note:
                typeof entry.note === 'string'
                  ? { content: entry.note }
                  : entry.note ?? null,
            };
          })
        );
      } catch (error) {
        console.error('Error fetching work logs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkLog();
  }, [userId]);

  return { hours, isLoading };
}
