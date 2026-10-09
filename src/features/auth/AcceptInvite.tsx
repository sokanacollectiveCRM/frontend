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

interface InvitationPreview {
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  organizationName: string;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);

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
      const response = await fetch(buildUrl('/auth/invitations/accept'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Could not accept the invitation.');
      }
      setAccepted(true);
      toast.success(
        'Invitation accepted. Check your email to verify your address, then log in.'
      );
    } catch (submitError) {
      const message =
        submitError instanceof Error
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
              : 'Review your invitation and choose a password.'}
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
                Your invitation is accepted for {preview?.email}. We sent a
                verification email — confirm your inbox, then log in.
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
              <div className='grid gap-2'>
                <Label htmlFor='invite-password'>Password</Label>
                <PasswordInput
                  id='invite-password'
                  name='password'
                  autoComplete='new-password'
                  placeholder='Choose a password'
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {error && <p className='text-sm text-red-600'>{error}</p>}
              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className='mx-auto h-4 w-4 animate-spin' />
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
