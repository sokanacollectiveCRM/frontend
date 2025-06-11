// src/hooks/useQuickBooksConnect.ts
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'

/**
 * Hook to initiate the QuickBooks OAuth pop‑up flow via the /auth/url endpoint.
 */
export function useQuickBooksConnect() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError]       = useState<string | null>(null)

  const connectQuickBooks = useCallback(async (): Promise<void> => {
    // Pull Supabase session from localStorage
    const raw = localStorage.getItem('authToken')
    if (!raw) {
      const msg = 'Not authenticated — no session in localStorage'
      setError(msg)
      toast.error(msg)
      return
    }

    let token: string
    try {
      const session = JSON.parse(raw) as { access_token: string }
      token = session.access_token
    } catch {
      // raw is the token itself
      token = raw
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1️⃣ Fetch the JSON URL from your backend (/quickbooks/auth/url)
      const base = (import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050').replace(/\/$/, '')
      const response = await fetch(`${base}/quickbooks/auth/url`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Could not fetch QuickBooks auth URL')
      }

      // 2️⃣ Extract the Intuit consent URL
      const { url } = (await response.json()) as { url: string }

      // 3️⃣ Open the OAuth consent screen in a popup
      const popup = window.open(url, '_blank', 'width=600,height=700')

      // 4️⃣ Listen for the postMessage from your callback handler
      const onMessage = (e: MessageEvent) => {
        if (e.origin !== window.location.origin) return
        popup?.close()
        window.removeEventListener('message', onMessage)
        toast.success('QuickBooks connected 🎉')
      }

      window.addEventListener('message', onMessage)
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Error connecting QuickBooks'
      console.error(msg)
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { connectQuickBooks, isLoading, error }
}
