// src/integrations/quickbooks/QuickBooksConnectPage.tsx
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SubmitButton from '../../common/components/form/SubmitButton'
import { UserContext } from '../../common/contexts/UserContext'; // ← import
import { useQuickBooksConnect } from '../../common/hooks/useQuickBooksIntegration/useQuickBooksIntegration'

const API_BASE = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050'

export default function QuickBooksConnectPage() {
  const { connectQuickBooks, isLoading, error } = useQuickBooksConnect()
  const [connected, setConnected] = useState<boolean | null>(null)
  const { user, isLoading: authLoading } = useContext(UserContext)  // ← get user
  const navigate = useNavigate()                                   // ← get navigate

  // Redirect non‑admins away
  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      toast.error('You do not have permission to access this page.')
      navigate('/')
    }
  }, [authLoading, user, navigate])

  // Fetch initial connection status
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const token = localStorage.getItem('authToken')
        const res = await fetch(`${API_BASE}/quickbooks/status`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const { connected: isConn } = res.ok
          ? await res.json()
          : { connected: false }
        if (alive) setConnected(isConn)
      } catch (err) {
        console.error('Could not load QuickBooks status', err)
        if (alive) setConnected(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // Show errors from the hook
  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  // Listen for the popup’s postMessage
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Only accept messages from your frontend or backend origins
      if (e.origin !== 'http://localhost:3001' && e.origin !== 'http://localhost:5050') {
        return
      }
      if (e.data?.success) {
        setConnected(true)
        toast.success('QuickBooks connected 🎉')
      } else {
        toast.error('QuickBooks connection failed')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const handleClick = useCallback(async () => {
    if (isLoading) return

    if (!connected) {
      // Connect flow
      await connectQuickBooks()
      return
    }

    // Disconnect flow
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`${API_BASE}/quickbooks/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Disconnect failed')
      }
      setConnected(false)
      toast.info('QuickBooks disconnected')
    } catch (err: any) {
      console.error('Disconnect error:', err)
      toast.error(err.message || 'Could not disconnect QuickBooks')
    }
  }, [connected, connectQuickBooks, isLoading])

  if (connected === null) {
    return <p>Loading QuickBooks status…</p>
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <section className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">QuickBooks Integration</h1>
        <p className="text-sm text-gray-500">
          {connected
            ? 'Your QuickBooks account is connected.'
            : 'QuickBooks is currently disconnected.'}
        </p>

        <SubmitButton onClick={handleClick} disabled={isLoading}>
          {isLoading
            ? connected
              ? 'Disconnecting…'
              : 'Connecting…'
            : connected
              ? 'Disconnect QuickBooks'
              : 'Connect QuickBooks'}
        </SubmitButton>
      </section>

      <ToastContainer position="top-right" newestOnTop closeOnClick />
    </div>
  )
}
