import { buildUrl, fetchWithAuth } from '@/api/http';

export interface StaffPermissions {
  admins: {
    id: string;
    name: string;
    email: string;
    hr: boolean;
    payroll: boolean;
  }[];
  lastChange: null | {
    actor_id: string;
    admin_id: string;
    actor_email: string | null;
    admin_email: string | null;
    capability: string;
    old_value: boolean;
    new_value: boolean;
    changed_at: string;
  };
}
export async function staffRequest<T>(path = '', body?: unknown): Promise<T> {
  const response = await fetchWithAuth(
    buildUrl(`/api/admin/staff-permissions${path}`),
    {
      method: body === undefined ? 'GET' : 'PATCH',
      ...(body === undefined
        ? {}
        : {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }),
      cache: 'no-store',
    }
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      response.status === 403
        ? 'Staff permissions access denied.'
        : data.error || 'Unable to load staff permissions.'
    );
  return data;
}
