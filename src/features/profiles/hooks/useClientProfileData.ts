import type { Client } from '@/features/clients/data/schema'
import { useEffect, useState } from 'react'

interface UseClientProfileDataResult {
  client: Client | null
  loading: boolean
  error: string | null
}

export function useClientProfileData(clientId: string): UseClientProfileDataResult {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId || client) return;

    const fetchClient = async () => {
      try {
        setLoading(true)

        const token = localStorage.getItem('authToken')
        if (!token) throw new Error('Missing auth token')

        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}clients/${clientId}?detailed=true`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('Failed to fetch client details')
        const data = await res.json()
        // console.log(data);
        setClient(data)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [clientId])

  return { client, loading, error }
}