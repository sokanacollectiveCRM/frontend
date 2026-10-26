import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/common/contexts/UserContext';
import { AccessDenied } from '@/common/components/routes/AccessDenied';
import {
  DOCUMENT_TYPE_LABELS,
  type BackgroundCheck,
  type Certification,
} from '@/api/doulas/doulaService';
import CertificationsList from '@/features/doula-dashboard/components/CertificationsList';
import { hrRequest } from './hrApi';
interface DoulaProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  unit_number?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bio?: string;
  certifications?: Certification[];
  account_status?: string;
}
interface Documents {
  documents: {
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string | null;
    status: string;
  }[];
  backgroundCheck?: BackgroundCheck;
}
function DoulaHrProfile({ id }: { id: string }) {
  const [profile, setProfile] = useState<DoulaProfile | null>(null);
  const [docs, setDocs] = useState<Documents | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([
      hrRequest<{ doula: DoulaProfile }>(`/doulas/${id}`),
      hrRequest<Documents>(`/doulas/${id}/documents`),
    ])
      .then(([p, d]) => {
        if (active) {
          setProfile(p.doula);
          setDocs(d);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id]);
  async function changeBackground() {
    if (!docs?.backgroundCheck) return;
    setBusy(true);
    setError('');
    try {
      await hrRequest(`/doulas/${id}/background-check`, {
        status:
          docs.backgroundCheck.status === 'cleared' ? 'not_cleared' : 'cleared',
      });
      setDocs(await hrRequest<Documents>(`/doulas/${id}/documents`));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to save background check.'
      );
      setDocs(null);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className='space-y-4 rounded-lg border p-5'
      aria-label='Doula HR profile'
    >
      {error && <p role='alert'>{error}</p>}
      {!profile && !error && <p role='status'>Loading profile…</p>}
      {profile && (
        <>
          <h2 className='text-xl font-semibold'>{profile.full_name}</h2>
          <p>
            {profile.email}
            {profile.phone && ` · ${profile.phone}`}
          </p>
          <p>
            {[
              profile.address,
              profile.unit_number,
              profile.city,
              profile.state,
              profile.zip_code,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
          <p>Account status: {profile.account_status}</p>
          {profile.bio && <p>{profile.bio}</p>}
          <h3 className='font-semibold'>Certifications</h3>
          <CertificationsList certifications={profile.certifications || []} />
        </>
      )}
      {docs?.backgroundCheck && (
        <section
          className='rounded border p-4 space-y-2'
          aria-label='Background check'
        >
          <h3 className='font-semibold'>Background check</h3>
          <p>
            Status:{' '}
            {docs.backgroundCheck.status === 'cleared'
              ? 'Cleared'
              : 'Not cleared'}
          </p>
          {docs.backgroundCheck.setAt && (
            <p>
              Set {new Date(docs.backgroundCheck.setAt).toLocaleString()} by{' '}
              {docs.backgroundCheck.setBy}
            </p>
          )}
          <button
            className='rounded border px-4 py-2'
            disabled={busy}
            onClick={() => void changeBackground()}
          >
            {busy
              ? 'Saving…'
              : docs.backgroundCheck.status === 'cleared'
                ? 'Mark Not cleared'
                : 'Mark Cleared'}
          </button>
        </section>
      )}
      {docs && (
        <>
          <h3 className='font-semibold'>Documents</h3>
          {docs.documents.length === 0 && <p>No documents uploaded.</p>}
          <ul className='space-y-3'>
            {docs.documents.map((doc) => (
              <li key={doc.id} className='rounded border p-3'>
                <p>
                  {(DOCUMENT_TYPE_LABELS as Record<string, string>)[
                    doc.documentType
                  ] || doc.documentType}{' '}
                  · {doc.status}
                </p>
                {doc.fileUrl ? (
                  <a
                    className='underline'
                    href={doc.fileUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {doc.fileName}
                  </a>
                ) : (
                  <span>{doc.fileName} — file unavailable</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
export default function HrWorkspace() {
  const { user } = useContext(UserContext);
  const [doulas, setDoulas] = useState<DoulaProfile[]>([]);
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user?.role !== 'hr') return;
    let active = true;
    hrRequest<{ doulas: DoulaProfile[] }>('/doulas')
      .then((d) => {
        if (active) setDoulas(d.doulas);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id, user?.role]);
  if (user?.role !== 'hr') return <AccessDenied />;
  return (
    <main className='p-6 space-y-5'>
      <h1 className='text-2xl font-semibold'>HR · Doula directory</h1>
      <p>
        Review doula profiles and documents, and manage background-check
        clearance.
      </p>
      {error && <p role='alert'>{error}</p>}
      {loading && <p role='status'>Loading doula directory…</p>}
      <label className='block'>
        Search doulas
        <input
          className='block w-full rounded border p-2'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className='grid gap-5 lg:grid-cols-[minmax(220px,1fr)_3fr]'>
        <nav aria-label='Doulas'>
          <ul className='space-y-2'>
            {doulas
              .filter((d) =>
                `${d.full_name} ${d.email}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((d) => (
                <li key={d.id}>
                  <button
                    className='w-full rounded border p-3 text-left'
                    aria-pressed={selected === d.id}
                    onClick={() => setSelected(d.id)}
                  >
                    {d.full_name}
                    <span className='block text-sm'>{d.email}</span>
                  </button>
                </li>
              ))}
          </ul>
          {!loading && !doulas.length && !error && <p>No doulas found.</p>}
        </nav>
        {selected ? (
          <DoulaHrProfile key={selected} id={selected} />
        ) : (
          <p>Select a doula to review their profile and documents.</p>
        )}
      </div>
    </main>
  );
}
