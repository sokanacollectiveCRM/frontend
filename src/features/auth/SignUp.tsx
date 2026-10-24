import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { toast } from 'sonner';
import { getFirebaseAuth } from '@/lib/firebase';
import { AuthFormLogo } from '@/common/components/brand/Sokana360Logo';
import { PasswordInput } from '@/common/components/form/PasswordInput';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { Label } from '@/common/components/ui/label';

export default function SignUp() {
  const [params] = useSearchParams();
  const code = params.get('oobCode') || '';
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
    setError('');
    if (!code) {
      setError(
        'Please ask your admin to resend your invitation for a secure password setup link.'
      );
      return;
    }
    void verifyPasswordResetCode(getFirebaseAuth(), code)
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active)
          setError(
            'This invitation link has expired or was already used. Please ask your admin for a new invitation.'
          );
      });
    return () => {
      active = false;
    };
  }, [code]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || submitting) return;
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await confirmPasswordReset(getFirebaseAuth(), code, password);
      toast.success(
        'Password created. Log in with your invited email address.'
      );
      navigate('/login', { replace: true });
    } catch {
      setError(
        'Could not create your password. Use at least 8 characters and try again, or ask your admin for a new invitation.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className='mx-auto flex w-full min-w-0 max-w-md flex-col gap-6 px-4 py-6'>
      <Card>
        <CardHeader>
          <AuthFormLogo />
          <CardTitle role='heading' aria-level={1} className='text-2xl'>
            Create your password
          </CardTitle>
          <CardDescription>
            Your account details are already saved. Create a password, then log
            in with your invited email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p role='alert' className='mb-4 text-sm text-red-600'>
              {error}
            </p>
          )}
          {ready ? (
            <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Create password</Label>
                <PasswordInput
                  id='password'
                  autoComplete='new-password'
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <p className='text-sm text-muted-foreground'>
                  Use at least 8 characters.
                </p>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='confirmation'>Confirm password</Label>
                <PasswordInput
                  id='confirmation'
                  autoComplete='new-password'
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <Button type='submit' disabled={submitting}>
                {submitting ? 'Creating password…' : 'Create password'}
              </Button>
            </form>
          ) : (
            !error && <p role='status'>Checking your invitation…</p>
          )}
          <div className='mt-4 text-center text-sm'>
            <Link to='/login' className='underline underline-offset-4'>
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
