import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { buildUrl } from '@/api/http';
import { getFirebaseAuth } from '@/lib/firebase';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
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
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [isInitializingSession, setIsInitializingSession] = useState(true);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('oobCode');
    if (!code) {
      setAccessToken(null);
      setError('Invalid or missing access token. Please request a new invite.');
    } else {
      setAccessToken(code);
      setError(null);
      void verifyPasswordResetCode(getFirebaseAuth(), code)
        .then((email) => setAccountEmail(email))
        .catch(() => undefined);
    }
    setIsInitializingSession(false);
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
      await confirmPasswordReset(getFirebaseAuth(), accessToken, password);

      if (accountEmail) {
        await fetch(buildUrl('/auth/email-verification/post-password-setup'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: accountEmail }),
        }).catch(() => undefined);
      }

      setSuccess(true);
      toast.success(
        'Password set! Check your email to verify your address, then sign in.'
      );

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/auth/client-login', { replace: true });
      }, 3000);
    } catch (err: any) {
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
            <CardTitle className='text-2xl'>
              Password Set Successfully!
            </CardTitle>
            <CardDescription>
              Your password has been set. You can now log in to your client
              portal.
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
            Create a secure password to access your client portal. This will
            email a secure link to create a password and access the client
            dashboard.
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
                disabled={isLoading || isInitializingSession || !accessToken}
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
                disabled={isLoading || isInitializingSession || !accessToken}
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

            <Button
              type='submit'
              className='w-full'
              disabled={isLoading || isInitializingSession || !accessToken}
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Setting Password...
                </>
              ) : isInitializingSession ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Validating link...
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
                Please contact your administrator to request a new portal
                invite.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
