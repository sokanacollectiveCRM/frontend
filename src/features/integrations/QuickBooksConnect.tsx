// src/integrations/quickbooks/QuickBooksConnectPage.tsx
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SubmitButton from '../../common/components/form/SubmitButton'

export default function QuickBooksConnectPage() {
  const [loading, setLoading] = useState(false)

  const handleConnect = () => {
    if (loading) return
    setLoading(true)

    // 1️⃣  Open our backend’s auth route directly in a popup
    const popup = window.open(
      'http://localhost:5050/quickbooks/auth',
      '_blank',
      'width=600,height=700'
    )

    // 2️⃣  Listen for the postMessage from your callback handler
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      popup?.close()
      window.removeEventListener('message', onMessage)
      setLoading(false)

      e.data.success
        ? toast.success('QuickBooks connected 🎉')
        : toast.error(`Oops: ${e.data.error}`)
    }
    window.addEventListener('message', onMessage)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <section className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">QuickBooks Integration</h1>
        <p className="text-sm text-gray-500">
          Connect your QuickBooks company to sync customers, send invoices, and
          accept card payments directly inside Sokana Collective CRM.
        </p>

        <SubmitButton onClick={handleConnect}>
          {loading ? 'Connecting…' : 'Connect QuickBooks'}
        </SubmitButton>
      </section>

      <ToastContainer position="top-right" newestOnTop closeOnClick />
    </div>
  )
}
