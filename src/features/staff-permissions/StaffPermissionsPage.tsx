import { useEffect, useState } from 'react';
import { staffRequest, type StaffPermissions } from './staffPermissionsApi';

export default function StaffPermissionsPage() {
  const [data, setData] = useState<StaffPermissions | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    staffRequest<StaffPermissions>()
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function change(
    id: string,
    capability: 'hr' | 'payroll',
    enabled: boolean
  ) {
    setBusy(true);
    setError('');
    try {
      await staffRequest(`/${encodeURIComponent(id)}`, { capability, enabled });
      setData(null);
      setData(await staffRequest<StaffPermissions>());
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Unable to save permission.';
      if (message === 'Staff permissions access denied.') setData(null);
      setError(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className='p-6 space-y-4'>
      <h1 className='text-2xl font-semibold'>Staff permissions</h1>
      {error && <p role='alert'>{error}</p>}
      {!data && !error && <p role='status'>Loading staff permissions…</p>}
      {data && (
        <>
          <p>
            HR and Payroll each allow access to sensitive doula documents and
            background-check status. Changes apply on the next request. No
            sign-out is needed and no notifications are sent.
          </p>
          <table className='w-full text-left'>
            <thead>
              <tr>
                <th scope='col'>Admin</th>
                <th scope='col'>HR</th>
                <th scope='col'>Payroll</th>
              </tr>
            </thead>
            <tbody>
              {data.admins.map((admin) => (
                <tr key={admin.id}>
                  <th scope='row' className='py-3'>
                    {admin.name}
                    <br />
                    <span className='font-normal'>{admin.email}</span>
                  </th>
                  {(['hr', 'payroll'] as const).map((capability) => (
                    <td key={capability}>
                      <input
                        type='checkbox'
                        aria-label={`${capability === 'hr' ? 'HR' : 'Payroll'} for ${admin.email}`}
                        checked={admin[capability]}
                        disabled={busy}
                        onChange={(e) =>
                          void change(admin.id, capability, e.target.checked)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className='font-semibold'>Last change</h2>
          {data.lastChange ? (
            <p>
              {data.lastChange.actor_email || data.lastChange.actor_id} changed{' '}
              {data.lastChange.capability.toUpperCase()} for{' '}
              {data.lastChange.admin_email || data.lastChange.admin_id}:{' '}
              {data.lastChange.old_value ? 'On' : 'Off'} →{' '}
              {data.lastChange.new_value ? 'On' : 'Off'} at{' '}
              {new Date(data.lastChange.changed_at).toLocaleString()}.
            </p>
          ) : (
            <p>No capability changes recorded.</p>
          )}
        </>
      )}
    </main>
  );
}
