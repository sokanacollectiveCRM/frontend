import PublicSigningPage from '@/features/public-signing/PublicSigningPage';
import {
  exchangeSigningInvitation,
  parseSigningInvitationCredential,
  scrubSigningUrlFromAddressBar,
  SigningApiError,
} from '@/features/public-signing/signingApi';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/common/components/ui/alert';
import { Button } from '@/common/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function exchangeErrorMessage(error: unknown): string {
  if (error instanceof SigningApiError) {
    if (error.status === 404) return 'This signing link is unavailable.';
    if (error.status === 429)
      return 'Too many attempts. Please wait and retry.';
    if (error.status === 400 || error.status === 401) return error.message;
  }
  return 'We could not reach the signing service. Please try again.';
}

/** Legacy path-param links: migrate to fragment flow without keeping token in URL. */
export function LegacySigningRedirect() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const invitation = parseSigningInvitationCredential({
      hash: `#invitation=${encodeURIComponent(token ?? '')}`,
      legacyPathToken: token,
    });
    navigate(
      {
        pathname: '/signing',
        hash: invitation ? `invitation=${encodeURIComponent(invitation)}` : '',
      },
      { replace: true, state: location.state }
    );
  }, [location.state, navigate, token]);

  return (
    <main className='flex min-h-dvh items-center justify-center bg-slate-50 p-6'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Loader2 className='size-5 animate-spin' aria-hidden='true' />
        Preparing secure signing…
      </div>
    </main>
  );
}

/** Captures invitation from URL fragment, exchanges for session, then renders signing UI. */
export function PublicSigningEntry() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const invitation = parseSigningInvitationCredential({
        hash: location.hash,
      });
      if (!invitation) {
        if (!cancelled) {
          setError('This signing link is unavailable.');
          setReady(false);
        }
        return;
      }

      scrubSigningUrlFromAddressBar();
      setError(null);
      try {
        await exchangeSigningInvitation(invitation);
        if (!cancelled) setReady(true);
      } catch (requestError) {
        if (!cancelled) {
          setError(exchangeErrorMessage(requestError));
          setRetryAfter(
            requestError instanceof SigningApiError
              ? requestError.retryAfterSeconds
              : null
          );
          setReady(false);
        }
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [location.hash]);

  if (ready) {
    return <PublicSigningPage />;
  }

  if (error) {
    return (
      <main className='flex min-h-dvh items-center justify-center bg-slate-50 p-6'>
        <Alert variant='destructive' className='max-w-lg bg-white'>
          <AlertCircle aria-hidden='true' />
          <AlertTitle>Contract unavailable</AlertTitle>
          <AlertDescription className='space-y-3'>
            <p>{error}</p>
            {retryAfter !== null && <p>Retry after {retryAfter} seconds.</p>}
            <Button
              type='button'
              variant='outline'
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className='flex min-h-dvh items-center justify-center bg-slate-50 p-6'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Loader2 className='size-5 animate-spin' aria-hidden='true' />
        Loading your contract…
      </div>
    </main>
  );
}
