import ClientProfileTab from './components/ClientProfileTab';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { useIsClientPortalUser } from '@/common/hooks/auth/useIsClientPortalUser';
import { useUser } from '@/common/hooks/user/useUser';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const serviceOutcomesUrl = (
  import.meta.env.VITE_CLIENT_PORTAL_SERVICE_OUTCOMES_URL as string | undefined
)?.trim();

type ClientDashboardView = 'profile' | 'billing' | 'all';

interface ClientDashboardProps {
  view?: ClientDashboardView;
}

/** Client-facing area: profile only (no org metrics or staff CRM). */
export default function ClientDashboard({ view = 'profile' }: ClientDashboardProps) {
  const { client, isLoading: clientAuthLoading } = useClientAuth();
  const { isClientPortalUser, isLoading: portalLoading } = useIsClientPortalUser();
  const { user } = useUser();
  const isLoading = clientAuthLoading || portalLoading;

  // Show loading state
  if (isLoading) {
    return (
      <>
        <main className='w-full max-w-screen overflow-x-hidden px-4 py-6'>
          <div className='p-6'>
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!isClientPortalUser) {
    return (
      <>
        <main className='w-full max-w-screen overflow-x-hidden px-4 py-6'>
          <div className='p-6'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                You must be logged in as a client to view this page. Use{' '}
                <a href='/auth/client-login' className='underline font-medium'>
                  client portal login
                </a>
                .
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </>
    );
  }

  const welcomeName =
    client?.firstname ||
    user?.firstname ||
    client?.email ||
    user?.email ||
    'Client';

  return (
    <>
      <main className='w-full max-w-screen overflow-x-hidden px-4 py-6'>
        <div className='p-6'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>
              {view === 'billing' ? 'Billing information' : 'Profile information'}
            </h1>
            <p className='mt-1 text-gray-600'>
              Welcome, {welcomeName}.{' '}
              {view === 'billing'
                ? 'Update your billing details below.'
                : 'Update your details below.'}
            </p>
            {serviceOutcomesUrl ? (
              <p className='mt-2 text-gray-600'>
                <a
                  href={serviceOutcomesUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-primary underline underline-offset-2 hover:text-primary/90'
                >
                  Service Outcomes
                </a>
                <span className='ml-2 text-sm text-gray-500'>(opens in a new tab)</span>
              </p>
            ) : null}
          </div>

          <ClientProfileTab view={view} />
        </div>
      </main>
    </>
  );
}
