// src/features/clients/CreateCustomerPage.tsx
'use client'

import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SubmitButton from '../../../common/components/form/SubmitButton'
import { UserContext } from '../../../common/contexts/UserContext'
import { useClients } from '../../../common/hooks/clients/useClients'
import type { Client } from '../../../common/types/client'

export default function CreateCustomerPage() {
  const { user, isLoading: authLoading } = useContext(UserContext)
  const navigate = useNavigate()

  const { clients, isLoading, error, getClients } = useClients()
  const [convertingIds, setConvertingIds] = useState<number[]>([])

  // Admin guard
  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      toast.error('No permission.')
      navigate('/')
    }
  }, [authLoading, user, navigate])

  // Fetch clients on mount
  useEffect(() => {
    getClients()
  }, [getClients])

  if (isLoading) return <p className="p-8 text-center">Loading clients…</p>
  if (error)     return <p className="p-8 text-center text-red-500">{error}</p>
console.log(clients)
  const convert = async (client: Client) => {
    setConvertingIds(ids => [...ids, client.id])
    try {
      // 1️⃣ Create customer in your DB and/or QuickBooks (hit your backend endpoint)
      const token = localStorage.getItem('authToken')
      const res = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/quickbooks/customers`, // ← use your correct endpoint!
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            internalCustomerId: client.userId, // UUID
            firstName: client.firstName,
            lastName:  client.lastName,
            email:     client.email,
          }),
        }
      )
      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText)
        throw new Error(`DB/QuickBooks creation failed: ${errText}`)
      }

      // 2️⃣ (OPTIONAL) If you still need to hit QuickBooks directly, call your API utility here:
      // await createQuickBooksCustomer({ ... });

      toast.success('Client converted and synced to QuickBooks!')
      getClients()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setConvertingIds(ids => ids.filter(id => id !== client.id))
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-white px-4 pt-8">
      <section className="max-w-4xl w-full text-gray-900">
        <h1 className="text-3xl font-bold text-center mb-4">Create Customer</h1>
        <p className="text-sm text-gray-700 text-center mb-6">
          Select a client to bill.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Needs</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client: Client) => (
                <tr key={client.id} className="border-t">
                  <td className="px-4 py-3">
                    {client.firstName} {client.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {client.serviceNeeded}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {client.status}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SubmitButton
                      onClick={() => convert(client)}
                      disabled={convertingIds.includes(client.id)}
                      className="px-4 py-1"
                    >
                      {convertingIds.includes(client.id) ? 'Converting…' : 'Convert'}
                    </SubmitButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <ToastContainer position="top-right" newestOnTop closeOnClick />
    </div>
  )
}
