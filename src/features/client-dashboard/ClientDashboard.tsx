import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import ClientProfileTab from './components/ClientProfileTab';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { useIsClientPortalUser } from '@/common/hooks/auth/useIsClientPortalUser';
import { useUser } from '@/common/hooks/user/useUser';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const serviceOutcomesUrl = (
  import.meta.env.VITE_CLIENT_PORTAL_SERVICE_OUTCOMES_URL as string | undefined
)?.trim();

/** Client-facing area: profile only (no org metrics or staff CRM). */
export default function ClientDashboard() {
  const { client, isLoading: clientAuthLoading } = useClientAuth();
  const { isClientPortalUser, isLoading: portalLoading } = useIsClientPortalUser();
  const { user } = useUser();
  const isLoading = clientAuthLoading || portalLoading;

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Header fixed>
          <div className='ml-auto flex items-center space-x-4'></div>
        </Header>
        <Main>
          <div className='flex-1 overflow-auto p-6'>
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
            </div>
          </div>
        </Main>
      </>
    );
  }

  if (!isClientPortalUser) {
    return (
      <>
        <Header fixed>
          <div className='ml-auto flex items-center space-x-4'></div>
        </Header>
        <Main>
          <div className='flex-1 overflow-auto p-6'>
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
        </Main>
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
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'></div>
      </Header>

      <Main>
        <div className='flex-1 overflow-auto p-6'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Your profile</h1>
            <p className='text-gray-600 mt-1'>
              Welcome, {welcomeName}. Update your details below.
            </p>
            {serviceOutcomesUrl ? (
              <p className='text-gray-600 mt-2'>
                <a
                  href={serviceOutcomesUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-primary underline underline-offset-2 hover:text-primary/90'
                >
                  Service Outcomes
                </a>
                <span className='text-gray-500 text-sm ml-2'>(opens in a new tab)</span>
              </p>
            ) : null}
          </div>

          <ClientProfileTab />
        </div>
      </Main>
    </>
  );
}
