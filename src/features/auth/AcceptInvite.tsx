import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { PasswordInput } from '@/common/components/form/PasswordInput';
import { buildUrl } from '@/api/http';
import { getFirebaseAuth } from '@/lib/firebase';
import { useUser } from '@/common/hooks/user/useUser';
import { setSelectedOrganization } from '@/api/organizationContext';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface InvitationPreview {
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  organizationName: string;
  requiresSignIn: boolean;
}

export default function AcceptInvite() {
  const { setUser } = useUser();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('This invitation link is missing.');
      setIsLoading(false);
      return;
    }
    void (async () => {
      try {
        const response = await fetch(buildUrl('/auth/invitations/preview'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'This invitation is no longer valid.');
        }
        setPreview(data as InvitationPreview);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'This invitation is no longer valid.'
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (!preview) return;
      let idToken: string | undefined;
      if (preview.requiresSignIn) {
        const credential = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          preview.email,
          password
        );
        idToken = await credential.user.getIdToken(true);
      }
      const response = await fetch(buildUrl('/auth/invitations/accept'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify(
          idToken ? { token, idToken } : { token, password }
        ),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.code === 'EXISTING_ACCOUNT_SIGN_IN_REQUIRED') {
          setPreview((current) =>
            current ? { ...current, requiresSignIn: true } : current
          );
          setPassword('');
        }
        throw new Error(data.error || 'Could not accept the invitation.');
      }
      // Finish with the normal MFA login flow, clearing any previous user's cookie.
      await Promise.allSettled([
        fetch(buildUrl('/auth/logout'), {
          method: 'POST',
          credentials: 'include',
        }),
        Promise.resolve().then(() => signOut(getFirebaseAuth())),
      ]);
      setSelectedOrganization(null);
      setUser(null);
      setRequiresVerification(data.requiresEmailVerification !== false);
      setAccepted(true);
      setPassword('');
      toast.success('Invitation accepted.');
    } catch (submitError) {
      const code = (submitError as { code?: string })?.code;
      const message = code?.startsWith('auth/')
        ? 'Could not sign in. Check your existing password and try again.'
        : submitError instanceof Error
          ? submitError.message
          : 'Could not accept the invitation.';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='mx-auto flex w-full min-w-0 max-w-md flex-col gap-6 px-4 py-6'>
      <Card>
        <CardHeader>
          <AuthFormLogo />
          <CardTitle className='text-2xl'>Accept invitation</CardTitle>
          <CardDescription>
            {preview
              ? `${preview.organizationName} invited you to join as ${preview.role}.`
              : 'Review your invitation.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-6'>
              <Loader2 className='h-5 w-5 animate-spin' />
            </div>
          ) : accepted ? (
            <div className='space-y-4 text-sm'>
              <p>
                Your invitation to {preview?.organizationName} is accepted for{' '}
                {preview?.email}.{' '}
                {requiresVerification
                  ? 'Check your verification email, then sign in.'
                  : 'Sign in with your existing account to choose your organization.'}
              </p>
              <Button asChild className='w-full'>
                <Link to='/login'>Go to login</Link>
              </Button>
            </div>
          ) : preview ? (
            <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='invite-name'>Name</Label>
                <Input
                  id='invite-name'
                  value={`${preview.firstname} ${preview.lastname}`}
                  readOnly
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='invite-email'>Email</Label>
                <Input id='invite-email' value={preview.email} readOnly />
              </div>
              <div
                role='note'
                className='rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950'
              >
                <strong>Before you continue:</strong> Accepting this invitation may
                send a verification email to {preview.email}. If you receive one,
                verify your email before signing in.
              </div>
              <div className='grid gap-2'>
                {preview.requiresSignIn && (
                  <p className='text-sm text-muted-foreground'>
                    You already have an account. Enter your existing password to
                    join {preview.organizationName}.
                  </p>
                )}
                <Label htmlFor='invite-password'>
                  {preview.requiresSignIn
                    ? 'Existing password'
                    : 'Choose a password'}
                </Label>
                <PasswordInput
                  id='invite-password'
                  name='password'
                  autoComplete={
                    preview.requiresSignIn ? 'current-password' : 'new-password'
                  }
                  placeholder={
                    preview.requiresSignIn
                      ? 'Enter your existing password'
                      : 'Choose a password'
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={preview.requiresSignIn ? undefined : 8}
                />
                {preview.requiresSignIn && (
                  <Link to='/forgot-password' className='text-sm underline'>
                    Forgot your password?
                  </Link>
                )}
              </div>
              {error && (
                <p role='alert' className='text-sm text-red-600'>
                  {error}
                </p>
              )}
              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className='mx-auto h-4 w-4 animate-spin' />
                ) : preview.requiresSignIn ? (
                  'Sign in and accept invitation'
                ) : (
                  'Accept invitation'
                )}
              </Button>
            </form>
          ) : (
            <p className='text-sm text-red-600'>{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
