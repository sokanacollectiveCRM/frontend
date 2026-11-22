import { isValidPhone } from '@/features/doula-dashboard/phone';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { Button } from '@/common/components/ui/button';
import {
  getDoulaProfile,
  getDoulaDocuments,
  DOCUMENT_TYPE_LABELS,
} from '@/api/doulas/doulaService';
import { AlertTriangle } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import {
  REQUIRED_DOULA_DOCUMENT_TYPES,
  backgroundCheckSatisfied,
} from '@/domain/documentPolicy';
import { DoulaDashboardOutletContext } from './doulaDashboardTypes';

const REQUIRED_PROFILE_FIELDS = [
  'firstname',
  'lastname',
  'address',
  'city',
  'state',
  'zip_code',
  'bio',
] as const;

const FIELD_LABELS: Record<(typeof REQUIRED_PROFILE_FIELDS)[number], string> = {
  firstname: 'First Name',
  lastname: 'Last Name',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip_code: 'Zip Code',
  bio: 'Bio',
};

export default function DoulaDashboard() {
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);
  const [backgroundPending, setBackgroundPending] = useState(false);
  const [documentsError, setDocumentsError] = useState(false);
  const [documentsChecked, setDocumentsChecked] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    fetchProfileCompletion();
  }, []);

  useEffect(() => {
    let mounted = true;
    let generation = 0;
    const refresh = async () => {
      const request = ++generation;
      try {
        const data = await getDoulaDocuments();
        if (!mounted || request !== generation) return;
        setMissingDocuments(
          REQUIRED_DOULA_DOCUMENT_TYPES.filter((type) => {
            // The API returns newest uploads first; an older approval must not mask a rejected replacement.
            const current = data.documents.find(
              (doc) => doc.documentType === type
            );
            return (
              !current || !['uploaded', 'approved'].includes(current.status)
            );
          }).map((type) => DOCUMENT_TYPE_LABELS[type])
        );
        setBackgroundPending(
          !backgroundCheckSatisfied(data.backgroundCheck?.status)
        );
        setDocumentsError(false);
      } catch {
        if (mounted && request === generation) setDocumentsError(true);
      } finally {
        if (mounted && request === generation) setDocumentsChecked(true);
      }
    };
    void refresh();
    window.addEventListener('doula-documents-changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      mounted = false;
      window.removeEventListener('doula-documents-changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const fetchProfileCompletion = async () => {
    try {
      const profile = await getDoulaProfile();
      const incompleteFields = REQUIRED_PROFILE_FIELDS.filter(
        (field) => !String(profile?.[field] ?? '').trim()
      ).map((field) => FIELD_LABELS[field]);
      if (!isValidPhone(profile?.phone_number))
        incompleteFields.push('Phone number');
      setMissingFields(incompleteFields);
      setIsProfileComplete(incompleteFields.length === 0);
    } catch {
      // Keep dashboard usable when profile check fails.
      setMissingFields([]);
      setIsProfileComplete(true);
    } finally {
      setProfileChecked(true);
    }
  };

  const onProfileStatusChange = useCallback<
    DoulaDashboardOutletContext['onProfileStatusChange']
  >(({ isComplete, missingFields: updatedMissingFields }) => {
    setIsProfileComplete(isComplete);
    setMissingFields(updatedMissingFields);
  }, []);
  const outletContext: DoulaDashboardOutletContext = { onProfileStatusChange };
  const totalRequiredItems =
    REQUIRED_PROFILE_FIELDS.length + 1 + REQUIRED_DOULA_DOCUMENT_TYPES.length;
  const completedRequiredItems = Math.max(
    0,
    totalRequiredItems - missingFields.length - missingDocuments.length
  );
  const completionPercent = Math.round(
    (completedRequiredItems / totalRequiredItems) * 100
  );

  return (
    <div className='flex h-[calc(100dvh-3rem-env(safe-area-inset-top))] min-w-0 flex-col overflow-hidden lg:h-dvh'>
      <header className='shrink-0 border-b bg-background px-4 py-3 sm:px-6'>
        <div className='flex w-full items-center gap-4'>
          <div className='min-w-0'>
            <h1 className='text-lg font-semibold text-slate-900'>
              Doula Dashboard
            </h1>
            <p className='text-sm text-slate-500'>
              Manage your profile, documents, clients, hours, and activities
            </p>
          </div>
          <div className='ml-auto flex items-center gap-4'>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main
        aria-label='Doula dashboard content'
        className='min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6'
      >
        <section
          aria-label='Doula profile completion'
          className='mb-6 rounded-2xl border bg-card p-4'
        >
          <div className='mb-2 flex items-center justify-between gap-3'>
            <p className='font-medium'>Profile setup progress</p>
            <span className='text-sm font-semibold'>
              {profileChecked && documentsChecked && !documentsError
                ? `${completionPercent}%`
                : 'Checking…'}
            </span>
          </div>
          <div
            role='progressbar'
            aria-label='Profile setup progress'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              profileChecked && documentsChecked && !documentsError
                ? completionPercent
                : undefined
            }
            className='h-2.5 overflow-hidden rounded-full bg-muted'
          >
            <div
              className='h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none'
              style={{
                width:
                  profileChecked && documentsChecked && !documentsError
                    ? `${completionPercent}%`
                    : '0%',
              }}
            />
          </div>
          {profileChecked && documentsChecked && !documentsError && (
            <p className='mt-2 text-sm text-muted-foreground'>
              {completedRequiredItems} of {totalRequiredItems} required profile
              and upload items complete.
            </p>
          )}
          {completionPercent === 100 && backgroundPending && (
            <p className='mt-1 text-sm text-muted-foreground'>
              Your setup is complete. Background clearance is reviewed
              separately by HR/payroll and does not hold up submission.
            </p>
          )}
        </section>
        {(missingDocuments.length > 0 ||
          backgroundPending ||
          documentsError) && (
          <div
            role='status'
            className='mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4'
          >
            <p className='font-medium text-amber-900'>
              Required documents need attention
            </p>
            {missingDocuments.length > 0 && (
              <p className='text-sm text-amber-800'>
                Upload or replace: {missingDocuments.join(', ')}.
              </p>
            )}
            {backgroundPending && (
              <p className='text-sm text-amber-800'>
                Background check is awaiting HR/payroll clearance. You do not
                need to upload a background-check file.
              </p>
            )}
            {documentsError && (
              <p className='text-sm text-amber-800'>
                We couldn’t check your documents. Open Documents to review their
                status.
              </p>
            )}
            <Button
              asChild
              size='sm'
              className='mt-3 bg-amber-600 hover:bg-amber-700'
            >
              <Link to='/doula-dashboard/profile?step=documents#profile-step-heading'>
                Review Documents
              </Link>
            </Button>
          </div>
        )}
        {!isProfileComplete && (
          <div className='mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4'>
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='mt-0.5 h-5 w-5 text-amber-700' />
                <div>
                  <p className='font-medium text-amber-900'>
                    Complete your profile to finish account setup.
                  </p>
                  <p className='text-sm text-amber-800'>
                    Missing required fields: {missingFields.join(', ')}
                  </p>
                </div>
              </div>
              <Button
                asChild
                size='sm'
                className='bg-amber-600 hover:bg-amber-700'
              >
                <Link to='/doula-dashboard/profile'>Complete Profile</Link>
              </Button>
            </div>
          </div>
        )}

        <Outlet context={outletContext} />
      </main>
    </div>
  );
}
