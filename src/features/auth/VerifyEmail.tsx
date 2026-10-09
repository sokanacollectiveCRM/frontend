import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { Loader2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';

import { AuthFormLogo } from '@/common/components/brand/Sokana360Logo';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { buildUrl, fetchWithAuth } from '@/api/http';
import { getFirebaseAuth } from '@/lib/firebase';
import { useUser } from '@/common/hooks/user/useUser';
import { isStaffRole } from '@/common/auth/roles';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, checkAuth } = useUser();
  const oobCode = searchParams.get('oobCode');
  const [status, setStatus] = useState<
    'idle' | 'applying' | 'success' | 'error' | 'waiting'
  >(oobCode ? 'applying' : 'waiting');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      return;
    }
    void (async () => {
      try {
        await applyActionCode(getFirebaseAuth(), oobCode);
        setStatus('success');
        const refreshed = await checkAuth({ silent: true }).catch(() => false);
        toast.success(
          refreshed
            ? 'Email verified. You can continue in Sokana.'
            : 'Email verified. Sign in with your password to open the app.'
        );
      } catch (err) {
        setStatus('error');
        setError(
          err instanceof Error
            ? err.message
            : 'This verification link is invalid or expired.'
        );
      }
    })();
  }, [oobCode, checkAuth]);

  const loginPath =
    user && !isStaffRole(user.role) ? '/auth/client-login' : '/login';

  const handleResend = async () => {
    setIsSending(true);
    setError('');
    try {
      const response = await fetchWithAuth(
        buildUrl('/auth/send-email-verification'),
        { method: 'POST' }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Could not send verification email.');
      }
      toast.success('Verification email sent.');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not send verification email.';
      setError(message);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className='mx-auto flex w-full min-w-0 max-w-md flex-col gap-6 px-4 py-6'>
      <Card>
        <CardHeader>
          <AuthFormLogo />
          <CardTitle className='text-2xl'>Verify your email</CardTitle>
          <CardDescription>
            Doulas and clients must confirm their inbox before accessing health
            information in Sokana.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-sm'>
          {status === 'applying' && (
            <div className='flex justify-center py-4'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </div>
          )}
          {status === 'success' && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-emerald-700'>
                <MailCheck className='h-5 w-5' />
                <span>Your email is verified.</span>
              </div>
              {user?.emailVerified === true ? (
                <>
                  <p>
                    Your session is updated. Continue to your Sokana dashboard.
                  </p>
                  <Button className='w-full' onClick={() => navigate('/')}>
                    Continue to app
                  </Button>
                </>
              ) : (
                <>
                  <p>
                    Verification is complete on our side. If you are not signed
                    in on this device, use <strong>Sign in</strong> next with
                    the same email and password you chose when you joined.
                  </p>
                  <Button
                    className='w-full'
                    onClick={() => navigate(loginPath)}
                  >
                    Go to sign in
                  </Button>
                </>
              )}
            </div>
          )}
          {(status === 'waiting' || status === 'error') && (
            <div className='space-y-4'>
              {user?.email && (
                <p>
                  We sent a link to <strong>{user.email}</strong>. Open it on
                  this device, then sign in again.
                </p>
              )}
              {!user && (
                <p>
                  Open the verification link from your email, or sign in and
                  resend a new link from this page.
                </p>
              )}
              {error && <p className='text-destructive'>{error}</p>}
              {user && user.emailVerified !== true && (
                <Button
                  className='w-full'
                  disabled={isSending}
                  onClick={() => void handleResend()}
                >
                  {isSending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending…
                    </>
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
              )}
              <Button asChild variant='outline' className='w-full'>
                <Link to={loginPath}>Back to sign in</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
