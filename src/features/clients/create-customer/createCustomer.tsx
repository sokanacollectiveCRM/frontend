// src/features/clients/CreateCustomerPage.tsx
'use client'

import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SubmitButton from '../../../common/components/form/SubmitButton'
import { UserContext } from '../../../common/contexts/UserContext'
import { useClients } from '../../../common/hooks/clients/useClients'
import type { User } from '../../../common/types/user'

export default function CreateCustomerPage() {
  const { user, isLoading: authLoading } = useContext(UserContext)
  const navigate = useNavigate()

  // Use your clients hook
  const { clients, isLoading, error, getClients } = useClients()
  const [convertingIds, setConvertingIds] = useState<string[]>([])

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      toast.error('You do not have permission to access this page.')
      navigate('/')
    }
  }, [authLoading, user, navigate])

  // Fetch clients on mount
  useEffect(() => {
    getClients()
  }, [getClients])

  // Show loading / error states
  if (isLoading) {
    return <p className="text-center p-8">Loading clients…</p>
  }
  if (error) {
    return <p className="text-center p-8 text-red-500">{error}</p>
  }

  // Convert one client into a customer
  async function convert(clientId: string) {
    setConvertingIds(ids => [...ids, clientId])
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ clientId }),
      })
      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}))
        throw new Error(message || 'Conversion failed')
      }
      toast.success('✅ Client converted to customer!')
      // Refresh list
      getClients()
    } catch (err: any) {
      toast.error(`❌ ${err.message}`)
    } finally {
      setConvertingIds(ids => ids.filter(id => id !== clientId))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <section className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">Create Customer</h1>
        <p className="text-sm text-gray-500 text-center">
          Select a client below to turn them into a billable customer.
        </p>

        <ul className="space-y-4">
          {clients.length === 0 && (
            <li className="text-center text-gray-600">No clients available.</li>
          )}
          {clients.map((client: User) => (
            <li
              key={client.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {client.firstname} {client.lastname}
                </p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
              <SubmitButton
                onClick={() => convert(client.id)}
                disabled={convertingIds.includes(client.id)}
              >
                {convertingIds.includes(client.id) ? 'Converting…' : 'Convert'}
              </SubmitButton>
            </li>
          ))}
        </ul>
      </section>

      <ToastContainer position="top-right" newestOnTop closeOnClick />
    </div>
  )
}
