import { Client } from "@/features/clients/data/schema"

export async function createContract({
  templateId,
  client,
  note,
  fee,
  deposit,
}: {
  templateId: string
  client: Client
  note?: string
  fee?: string
  deposit?: string
}) {
  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({
      templateId: templateId,
      clientId: client.id,
      fields: {
        clientname: `${client.user.firstname} ${client.user.lastname}`,
        fee,
        deposit,
      },
      note,
      fee,
      deposit,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate contract');
  }
  return data;
}