import type { Client } from '@/features/clients/data/schema';
import { useEffect, useState } from 'react';
import { buildUrl, fetchWithAuth } from '@/api/http';

interface UseClientProfileDataResult {
  client: Client | null;
  loading: boolean;
  error: string | null;
}

export function useClientProfileData(
  clientId: string
): UseClientProfileDataResult {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId || client) return;

    const fetchClient = async () => {
      try {
        setLoading(true);

        const res = await fetchWithAuth(buildUrl(`/clients/${clientId}`, { detailed: true }));

        if (!res.ok) throw new Error('Failed to fetch client details');
        const raw = await res.json();
        // Unwrap { success, data } so form gets phone_number, due_date, etc. at top level
        const data = raw?.success && raw?.data && typeof raw.data === 'object' ? raw.data : raw;
        setClient(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  return { client, loading, error };
}
