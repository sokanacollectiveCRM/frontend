// src/common/hooks/clients/useClients.ts
import { useCallback, useState } from 'react'
import type { Client } from '../../types/client'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getClients = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const rawBase = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050'
      const BASE = rawBase.replace(/\/+$/, '')
      const token = localStorage.getItem('authToken')

      const res = await fetch(`${BASE}/clients`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Failed (${res.status}): ${txt || res.statusText}`)
      }

      // cast it to Client[] so setClients has the right shape
      const data = (await res.json()) as Client[]
      setClients(data)
      return data
    } catch (err: any) {
      setError(err.message)
      setClients([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getClientById = async (id: string, detailed = false): Promise<Client | null> => {
    const token = localStorage.getItem('authToken');
    setIsLoading(true);
    setError(null);

    try {
      const rawBase = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050'
      const BASE = rawBase.replace(/\/+$/, '')
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
      const message = err instanceof Error ? err.message : 'Error fetching client';
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
