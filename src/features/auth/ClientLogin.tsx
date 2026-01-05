import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('=== ClientLogin component mounted ===');
    console.log('Current path:', window.location.pathname);
    console.log('Current hash:', window.location.hash);
    console.log('Full URL:', window.location.href);
    
    // Track navigation changes
    const interval = setInterval(() => {
      if (window.location.pathname !== '/auth/client-login') {
        console.error('🚨 PATH CHANGED FROM /auth/client-login TO:', window.location.pathname);
        console.trace('Stack trace of what changed the path');
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Prevent any redirects from happening - this page should always be accessible
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('ClientLogin - Page is about to unload');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Check if user is already logged in
  // Skip this check if there was a recent login error to prevent redirect loops
  useEffect(() => {
    if (hasLoginError) {
      console.log('ClientLogin - Skipping session check due to recent login error');
      return;
    }

    const checkSession = async () => {
      console.log('ClientLogin - Checking Supabase session');
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log('ClientLogin - Session result:', session ? 'has session' : 'no session');

      if (session) {
        // Verify user role
        const userRole = session.user.user_metadata?.role;
        console.log('ClientLogin - User role:', userRole);
        if (userRole === 'client') {
          console.log('ClientLogin - Client session detected');
          // Client has Supabase session - they're already logged in via Supabase
          // Don't redirect to / because that requires backend auth
          // Instead, show a message or redirect to a client-only route (when created)
          // For now, we'll let them stay on the login page or they can manually navigate
          console.log('ClientLogin - Client already has Supabase session, staying on page');
        } else {
          console.log('ClientLogin - Signing out non-client user');
          // Sign out non-client users
          await supabase.auth.signOut();
        }
      } else {
        console.log('ClientLogin - No Supabase session, staying on page');
      }
    };

    checkSession();
  }, [navigate, hasLoginError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setHasLoginError(false);
    setIsLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
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

      // Verify user role is 'client'
      // Check user metadata first
      const userRole = data.user.user_metadata?.role;

      // If not in metadata, check database
      if (userRole !== 'client') {
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (dbError || !userData) {
          // If we can't verify role, check metadata as fallback
          if (userRole && userRole !== 'client') {
            await supabase.auth.signOut();
            throw new Error(
              'This login is for clients only. Please use the admin/doula login page.'
            );
          }
        } else if (userData.role !== 'client') {
          await supabase.auth.signOut();
          throw new Error(
            'This login is for clients only. Please use the admin/doula login page.'
          );
        }
      }

      // Check portal status (optional - if endpoint exists)
      // This is a completely fire-and-forget check - we don't wait for it or block on it
      // We fire it off and continue with login regardless of success/failure
      // Only if the portal is explicitly disabled will we handle it (but not block login)
      fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/clients/me/portal-status`,
        {
          headers: {
            Authorization: `Bearer ${data.session?.access_token}`,
          },
        }
      )
        .then(async (response) => {
          if (response.ok) {
            const portalData = await response.json();
            if (portalData.portal_status === 'disabled') {
              // If portal is disabled, sign out in background (don't block login flow)
              supabase.auth.signOut().catch(() => {});
              // Show toast but don't throw error (login already succeeded)
              toast.error('Your portal access has been disabled. Please contact support.');
            }
          }
          // Silently ignore all other responses (404, 500, etc.) - endpoint may not exist
        })
        .catch(() => {
          // Silently ignore all errors (404, network errors, etc.)
          // This endpoint is optional and may not exist yet
        });

      // Success - client is logged in via Supabase
      setError(null);
      toast.success('Welcome! Redirecting to your dashboard...');
      // Redirect to home page which will show client dashboard
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Client login error:', err);
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
        console.log('ClientLogin - Signed out after failed login');
      } catch (signOutError) {
        console.error('Error signing out after failed login:', signOutError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  console.log('ClientLogin - Rendering component');
  console.log('ClientLogin - Will NOT redirect to /login from this component');
  
  // Prevent any navigation away from this page unless explicitly done by user action
  useEffect(() => {
    const currentPath = window.location.pathname;
    console.log('ClientLogin - useEffect: Current path is', currentPath);
    if (currentPath !== '/auth/client-login') {
      console.warn('ClientLogin - Path changed unexpectedly to:', currentPath);
    }
  }, []);

  return (
    <div className='flex flex-col gap-6 max-w-md mx-auto p-4'>
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
              Don't have an account? Contact your administrator to receive a portal
              invite.
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

