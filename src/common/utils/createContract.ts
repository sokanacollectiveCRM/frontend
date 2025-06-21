import { Client } from "@/common/types/client"

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
      template_id: templateId,
      client_id: client.id,
      client_name: `${client.firstName} ${client.lastName}`,
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