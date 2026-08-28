import { useEffect, useState } from 'react';
import { logFailure } from '@/utils/safeLog';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useUser } from '@/common/hooks/user/useUser';
import type { IdentityMfaPending } from '@/common/types/auth';
import GoogleButton from '@/features/auth/GoogleButton';
import { API_CONFIG } from '@/api/config';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { PasswordInput } from '@/common/components/form/PasswordInput';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, googleAuth, verifyIdentityMfa, resendIdentityMfa } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [mfa, setMfa] = useState<IdentityMfaPending | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [resendInSec, setResendInSec] = useState(0);
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');
  const identityMode = API_CONFIG.authMode === 'identity';

  useEffect(() => {
    if (oauthError) {
      toast.error(oauthError);
    }
  }, [oauthError]);

  // Identity migration emails use continueUrl=/login; forward oobCode to reset page.
  useEffect(() => {
    if (!identityMode) return;
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    if (!oobCode || (mode && mode !== 'resetPassword')) return;
    navigate(`/auth/reset-password?${searchParams.toString()}`, {
      replace: true,
    });
  }, [identityMode, navigate, searchParams]);

  // Drop stale Identity Platform browser sessions (password resets invalidate
  // persisted refresh tokens and otherwise spam accounts:lookup 400).
  useEffect(() => {
    if (!identityMode || !isFirebaseConfigured()) return;
    void signOut(getFirebaseAuth()).catch(() => undefined);
  }, [identityMode]);

  useEffect(() => {
    if (resendInSec <= 0) return;
    const id = window.setInterval(() => {
      setResendInSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendInSec]);

  const startResendCooldown = (seconds?: number) => {
    setResendInSec(
      typeof seconds === 'number' && seconds > 0 ? Math.ceil(seconds) : 60
    );
  };

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formState.email, formState.password);
      if (result !== true && result.mfaRequired) {
        setMfa(result);
        setMfaCode('');
        startResendCooldown(result.resendAvailableInSec);
        toast.message(
          `We sent a code to ${result.emailHint}. You can resend in 60 seconds.`
        );
        return;
      }
      navigate('/', { replace: true });
    } catch (submitError) {
      logFailure('auth', 'login_error');
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to sign in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mfa) return;
    setIsLoading(true);
    try {
      await verifyIdentityMfa(mfa.challengeId, mfaCode.trim(), mfa.idToken);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Invalid verification code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!mfa || resendInSec > 0) return;
    setIsLoading(true);
    try {
      const next = await resendIdentityMfa(mfa.challengeId, mfa.idToken);
      setMfa(next);
      startResendCooldown(next.resendAvailableInSec);
      toast.message(
        `New code sent to ${next.emailHint}. You can resend again in 60 seconds.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleAuth();
    } catch (googleError) {
      toast.error(
        googleError instanceof Error
          ? googleError.message
          : 'Failed to sign in using Google. Please try again.'
      );
    }
  };

  if (mfa) {
    return (
      <div className='flex flex-col gap-6 max-w-md mx-auto w-full px-4 py-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Check your email</CardTitle>
            <CardDescription>
              Enter the 6-digit code we sent to {mfa.emailHint}. Codes expire in
              10 minutes. You can request a new code every 60 seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMfaSubmit} className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='mfaCode'>Verification code</Label>
                <Input
                  id='mfaCode'
                  name='mfaCode'
                  inputMode='numeric'
                  autoComplete='one-time-code'
                  className='text-base md:text-sm tracking-widest'
                  placeholder='123456'
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin mx-auto' />
                ) : (
                  'Verify and continue'
                )}
              </Button>
              <Button
                type='button'
                variant='ghost'
                className='w-full'
                disabled={isLoading || resendInSec > 0}
                onClick={() => void handleResend()}
              >
                {resendInSec > 0
                  ? `Resend code in ${resendInSec}s`
                  : 'Resend code'}
              </Button>
              <Button
                type='button'
                variant='link'
                className='w-full'
                disabled={isLoading}
                onClick={() => {
                  setMfa(null);
                  setMfaCode('');
                  setResendInSec(0);
                }}
              >
                Back to login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 max-w-md mx-auto w-full px-4 py-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Log In</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                name='email'
                autoComplete='email'
                inputMode='email'
                className='text-base md:text-sm'
                placeholder='jsmith or j@example.com'
                value={formState.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor='password'>Password</Label>
                <Link
                  to='/forgot-password'
                  className='ml-auto text-sm underline-offset-4 hover:underline'
                >
                  Forgot your password?
                </Link>
              </div>
              <PasswordInput
                id='password'
                name='password'
                autoComplete='current-password'
                className='text-base md:text-sm'
                placeholder='Enter your password'
                value={formState.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin mx-auto' />
              ) : (
                'Log In'
              )}
            </Button>
            {!identityMode && (
              <GoogleButton
                onClick={handleGoogleLogin}
                isLoading={isLoading}
                text='Sign in with Google'
              />
            )}
          </form>
          <div className='mt-4 text-center text-sm'>
            Don't have an account?{' '}
            <Link to='/signup' className='underline underline-offset-4'>
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
