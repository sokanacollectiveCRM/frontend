import { useEffect, useState } from 'react';
import { logFailure } from '@/utils/safeLog';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { isStaffRole } from '@/common/auth/roles';
import { useUser } from '@/common/hooks/user/useUser';
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
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/common/components/ui/alert';

export default function ClientLogin() {
  const navigate = useNavigate();
  const { user, checkAuth, isLoading: isAuthLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);

  // Redirect staff who already have an authoritative /auth/me role.
  useEffect(() => {
    if (hasLoginError || isAuthLoading) return;
    if (isStaffRole(user?.role)) {
      navigate('/', { replace: true });
    }
  }, [hasLoginError, isAuthLoading, user?.role, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setHasLoginError(false);
    setIsLoading(true);

    try {
      // Sign in with Supabase Auth (same approach as admin login - just authenticate)
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        throw new Error(
          signInError.message === 'Invalid login credentials'
            ? 'Invalid email or password. Please try again.'
            : signInError.message || 'Failed to sign in. Please try again.'
        );
      }

      if (!data.user) {
        throw new Error('No user data received. Please try again.');
      }

      // Success - client is logged in via Supabase
      setError(null);
      toast.success('Welcome! Redirecting to your dashboard...');

      await checkAuth({ silent: true });
      navigate('/', { replace: true });
    } catch (err: any) {
      logFailure('auth', 'client_login_error');
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to sign in. Please try again.';
      setError(errorMessage);
      setHasLoginError(true); // Mark that there was a login error to prevent redirects
      toast.error(errorMessage);
      // IMPORTANT: Do NOT redirect on error - stay on the login page
      // Ensure any Supabase session is cleared on error
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        logFailure('auth', 'error_signing_out_after_failed_login');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className='mx-auto flex w-full min-w-0 max-w-md flex-col gap-6 p-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Client Portal Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your client dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                name='email'
                placeholder='your.email@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete='email'
                className='text-base md:text-sm'
              />
            </div>

            <div className='grid gap-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                <Link
                  to='/forgot-password'
                  className='text-sm text-muted-foreground underline-offset-4 hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id='password'
                name='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete='current-password'
              />
            </div>

            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='rememberMe'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                disabled={isLoading}
              />
              <Label
                htmlFor='rememberMe'
                className='text-sm font-normal cursor-pointer'
              >
                Remember me
              </Label>
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className='mt-6 text-center text-sm space-y-2'>
            <p className='text-muted-foreground'>
              Don't have an account? Contact your administrator to receive a
              portal invite.
            </p>
            <div className='pt-2 border-t'>
              <p className='text-muted-foreground'>
                Are you an admin or doula?{' '}
                <Link
                  to='/login'
                  className='text-primary underline-offset-4 hover:underline'
                >
                  Use the admin login
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
