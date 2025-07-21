// src/common/hooks/clients/useClients.ts
import {
  getSessionExpirationMessage,
  isSessionExpiredError,
} from '@/common/utils/sessionUtils';
import type { Client } from '@/features/pipeline/data/schema';
import { useCallback, useState } from 'react';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const BASE = 'http://localhost:5050'; // Base URL for development
      const token = localStorage.getItem('authToken');

      const res = await fetch(`${BASE}/clients`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text();

        // Check for authentication/session expiration errors
        if (isSessionExpiredError(res.status, txt)) {
          throw new Error(getSessionExpirationMessage());
        }

        throw new Error(`Failed (${res.status}): ${txt || res.statusText}`);
      }

      // cast it to Client[] so setClients has the right shape
      const apiData = (await res.json()) as any[];
      console.log('🔍 DEBUG: Raw API data:', apiData);

      // Flatten user object into top-level and map database fields to frontend fields
      const data = apiData.map((client) => {
        const mappedClient = {
          ...client.user,
          ...client,
          // Map database field names to frontend field names
          phoneNumber: client.phone_number || client.phoneNumber || client.user?.phoneNumber || '',
          // Ensure firstname and lastname are properly mapped from user object
          firstname: client.user?.firstname || client.firstname || '',
          lastname: client.user?.lastname || client.lastname || '',
          // Map service needed from top level or user object
          serviceNeeded: client.serviceNeeded || client.user?.service_needed || '',
          // Map dates properly
          requestedAt: client.requestedAt ? new Date(client.requestedAt) : new Date(),
          updatedAt: client.updatedAt ? new Date(client.updatedAt) : new Date(),
          // Map status from top level or user object
          status: client.status || client.user?.status || 'lead',
        };
        console.log('🔍 DEBUG: Client mapping:', {
          original: {
            phone_number: client.phone_number,
            phoneNumber: client.phoneNumber,
            user_phone: client.user?.phoneNumber,
          },
          mapped: { 
            phoneNumber: mappedClient.phoneNumber,
            firstname: mappedClient.firstname,
            lastname: mappedClient.lastname,
            serviceNeeded: mappedClient.serviceNeeded,
            status: mappedClient.status,
          },
        });
        return mappedClient;
      });
      setClients(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      setClients([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getClientById = async (
    id: string,
    detailed = false
  ): Promise<Client | null> => {
    const token = localStorage.getItem('authToken');
    setIsLoading(true);
    setError(null);

    try {
      const BASE = 'http://localhost:5050'; // Base URL for development
      const response = await fetch(
        `${BASE}/clients/${id}?detailed=${detailed}`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Could not fetch client');
      const data = await response.json();
      return data as Client;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error fetching client';
      console.error(message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    isLoading,
    error,
    getClients,
    getClientById,
    setIsLoading,
  };
}
