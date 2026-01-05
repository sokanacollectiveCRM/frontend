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
import { cn } from '@/lib/utils';

export default function SetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Extract access token from URL hash
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const token = hashParams.get('access_token');
    const type = hashParams.get('type');

    console.log('SetPassword - Hash:', hash);
    console.log('SetPassword - Token:', token ? 'present' : 'missing');
    console.log('SetPassword - Type:', type);

    if (!token) {
      setError('Invalid or missing access token. Please request a new invite.');
    } else if (type !== 'recovery') {
      setError('Invalid invite link type. Please use the link from your email.');
    } else {
      setAccessToken(token);
      // Supabase should automatically detect the session from the hash
      // Let's verify the session is available
      supabase.auth.getSession().then(({ data, error }) => {
        console.log('SetPassword - Session check:', { data, error });
        if (error) {
          console.error('SetPassword - Session error:', error);
        }
      });
    }
  }, []);

  // Validate password requirements
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Include at least one uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Include at least one lowercase letter');
    }
    if (!/\d/.test(pwd)) {
      errors.push('Include at least one number');
    }
    return errors;
  };

  // Update password errors when password changes
  useEffect(() => {
    if (password) {
      setPasswordErrors(validatePassword(password));
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password requirements
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    if (!accessToken) {
      setError('Invalid or missing access token. Please request a new invite.');
      return;
    }

    setIsLoading(true);

    try {
      // Supabase automatically detects the session from the URL hash (detectSessionInUrl: true)
      // Wait a moment for Supabase to process the hash, then get the session
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      console.log('SetPassword - Session data:', sessionData);
      console.log('SetPassword - Session error:', sessionError);

      if (sessionError) {
        throw new Error(
          sessionError.message ||
            'Invalid or expired token. Please request a new invite.'
        );
      }

      if (!sessionData.session) {
        // If no session was created from the hash, the token might be invalid
        throw new Error(
          'Email link is invalid or has expired. Please request a new invite.'
        );
      }

      // Update password - the session is already established from the hash
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('SetPassword - Update error:', updateError);
        throw new Error(
          updateError.message || 'Failed to set password. Please try again.'
        );
      }

      setSuccess(true);
      toast.success('Password set successfully! Redirecting to login...');

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/auth/client-login', { replace: true });
      }, 3000);
    } catch (err: any) {
      console.error('Set password error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to set password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className='flex flex-col gap-6 max-w-md mx-auto p-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Password Set Successfully!</CardTitle>
            <CardDescription>
              Your password has been set. You can now log in to your client portal.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Button
              onClick={() => navigate('/auth/client-login', { replace: true })}
              className='w-full'
            >
              Go to Login
            </Button>
            <p className='text-sm text-muted-foreground text-center'>
              Redirecting automatically in a few seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 max-w-md mx-auto p-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Set Your Password</CardTitle>
          <CardDescription>
            Create a secure password to access your client portal. This will email a
            secure link to create a password and access the client dashboard.
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
              <Label htmlFor='password'>Password</Label>
              <PasswordInput
                id='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || !accessToken}
                className={cn(
                  passwordErrors.length > 0 && password && 'border-destructive'
                )}
              />
              {password && passwordErrors.length > 0 && (
                <ul className='text-sm text-destructive space-y-1 mt-1'>
                  {passwordErrors.map((err, index) => (
                    <li key={index} className='flex items-center gap-2'>
                      <span className='text-xs'>•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              )}
              {password && passwordErrors.length === 0 && (
                <p className='text-sm text-green-600 dark:text-green-400'>
                  ✓ Password meets all requirements
                </p>
              )}
              <div className='text-xs text-muted-foreground mt-1'>
                <p>Password requirements:</p>
                <ul className='list-disc list-inside space-y-0.5 mt-1'>
                  <li>Minimum 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                </ul>
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <PasswordInput
                id='confirmPassword'
                placeholder='Confirm your password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading || !accessToken}
                className={cn(
                  confirmPassword &&
                    password !== confirmPassword &&
                    'border-destructive'
                )}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className='text-sm text-destructive'>
                  Passwords do not match
                </p>
              )}
              {confirmPassword &&
                password === confirmPassword &&
                password.length > 0 && (
                  <p className='text-sm text-green-600 dark:text-green-400'>
                    ✓ Passwords match
                  </p>
                )}
            </div>

            <Button type='submit' className='w-full' disabled={isLoading || !accessToken}>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Setting Password...
                </>
              ) : (
                'Set Password'
              )}
            </Button>
          </form>

          {!accessToken && (
            <div className='mt-4 text-center text-sm text-muted-foreground'>
              <p>Need a new invite?</p>
              <p className='mt-1'>
                Please contact your administrator to request a new portal invite.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

