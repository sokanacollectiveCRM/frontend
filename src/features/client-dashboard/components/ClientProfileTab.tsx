import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { toast } from 'sonner';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { useUser } from '@/common/hooks/user/useUser';
import { supabase } from '@/lib/supabase';
import UserAvatar from '@/common/components/user/UserAvatar';
import {
  ASSIGNMENT_ROLE_OPTIONS,
  normalizeAssignmentRole,
  type AssignedDoula,
} from '@/api/clients/doulaAssignments';
import { Badge } from '@/common/components/ui/badge';
import { format, isValid, parseISO } from 'date-fns';
import { Loader2, MessageSquare } from 'lucide-react';

export default function ClientProfileTab() {
  const { client } = useClientAuth();
  const { user } = useUser();
  const userRecord = user as Record<string, unknown> | null;
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assignedDoulas, setAssignedDoulas] = useState<AssignedDoula[]>([]);
  const [isLoadingAssignedDoulas, setIsLoadingAssignedDoulas] = useState(false);
  const [assignedDoulasError, setAssignedDoulasError] = useState<string | null>(
    null
  );
  const [sharedNotes, setSharedNotes] = useState<
    { id: string; activity_type: string; content: string; created_at: string }[]
  >([]);
  const [sharedNotesLoading, setSharedNotesLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    bio: '',
  });

  const getClientApiBase = () =>
    (import.meta.env.VITE_APP_BACKEND_URL || '').replace(/\/+$/, '');

  const getClientAuthHeaders = (token?: string) => ({
    'Content-Type': 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
          'X-Session-Token': token,
        }
      : {}),
  });

  const effectiveClientId = client?.id || user?.id || null;
  const effectiveClientFirstName =
    client?.firstname || user?.firstname || String(userRecord?.first_name || '');
  const effectiveClientLastName =
    client?.lastname || user?.lastname || String(userRecord?.last_name || '');
  const effectiveClientEmail = client?.email || user?.email || '';

  const fetchClientAssignedDoulas = useCallback(async () => {
    if (!effectiveClientId) return;

    setIsLoadingAssignedDoulas(true);
    setAssignedDoulasError(null);
    try {
      let token: string | undefined;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        token = session?.access_token;
      } catch {
        token = undefined;
      }

      const response = await fetch(
        `${getClientApiBase()}/clients/${effectiveClientId}/assigned-doulas`,
        {
          method: 'GET',
          credentials: 'include',
          headers: getClientAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
          `Failed to fetch assigned doulas: ${response.status} ${text}`
        );
      }

      const payload = await response.json();
      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.doulas)
          ? payload.doulas
          : [];
      setAssignedDoulas(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load assigned doula information.';
      // In client portal, backend may return 401/no-session for unassigned clients.
      // Treat this as empty state instead of an error banner.
      if (message.includes('401')) {
        setAssignedDoulasError(null);
        setAssignedDoulas([]);
      } else {
        setAssignedDoulasError(message);
        setAssignedDoulas([]);
      }
    } finally {
      setIsLoadingAssignedDoulas(false);
    }
  }, [effectiveClientId]);

  const fetchSharedNotesFromDoula = useCallback(async () => {
    if (!effectiveClientId) return;

    setSharedNotesLoading(true);
    try {
      let token: string | undefined;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        token = session?.access_token;
      } catch {
        token = undefined;
      }

      const response = await fetch(
        `${getClientApiBase()}/clients/${effectiveClientId}/activities`,
        {
          method: 'GET',
          credentials: 'include',
          headers: getClientAuthHeaders(token),
        }
      );

      if (!response.ok) {
        setSharedNotes([]);
        return;
      }

      const payload = await response.json();
      const rows = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.activities)
          ? payload.activities
          : [];

      setSharedNotes(
        rows.map((row: any) => ({
          id: String(row.id),
          activity_type: String(row.activity_type ?? row.type ?? 'note'),
          content: String(row.content ?? row.description ?? ''),
          created_at: String(row.created_at ?? row.timestamp ?? row.createdAt ?? ''),
        }))
      );
    } catch {
      setSharedNotes([]);
    } finally {
      setSharedNotesLoading(false);
    }
  }, [effectiveClientId]);

  const fetchProfile = useCallback(async () => {
    if (!effectiveClientId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let token: string | undefined;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        token = session?.access_token;
      } catch {
        token = undefined;
      }

      const response = await fetch(
        `${getClientApiBase()}/clients/${effectiveClientId}?detailed=true`,
        {
          method: 'GET',
          credentials: 'include',
          headers: getClientAuthHeaders(token),
        }
      );

      let profile: any = null;
      if (response.ok) {
        const payload = await response.json();
        profile = payload?.success && payload?.data ? payload.data : payload;
      }

      setFormData({
        firstname: profile?.firstname || profile?.first_name || effectiveClientFirstName,
        lastname: profile?.lastname || profile?.last_name || effectiveClientLastName,
        email: profile?.email || effectiveClientEmail,
        phone: profile?.phone || profile?.phone_number || '',
        address: profile?.address || profile?.address_line1 || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip_code: profile?.zip_code || profile?.zipCode || '',
        bio: profile?.bio || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Fallback to session metadata so profile tab still works locally.
      setFormData({
        firstname: effectiveClientFirstName,
        lastname: effectiveClientLastName,
        email: effectiveClientEmail,
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        bio: '',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    effectiveClientId,
    effectiveClientFirstName,
    effectiveClientLastName,
    effectiveClientEmail,
  ]);

  useEffect(() => {
    if (effectiveClientId) {
      fetchProfile();
      fetchClientAssignedDoulas();
      fetchSharedNotesFromDoula();
    } else {
      setIsLoading(false);
    }
  }, [
    effectiveClientId,
    fetchProfile,
    fetchClientAssignedDoulas,
    fetchSharedNotesFromDoula,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!effectiveClientId) return;

    setIsSaving(true);
    try {
      let token: string | undefined;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        token = session?.access_token;
      } catch {
        token = undefined;
      }

      const response = await fetch(
        `${getClientApiBase()}/clients/${effectiveClientId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: getClientAuthHeaders(token),
          body: JSON.stringify({
            firstname: formData.firstname,
            lastname: formData.lastname,
            phone: formData.phone,
            phone_number: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            bio: formData.bio,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `Failed to update profile (${response.status}) ${errorText}`.trim()
        );
      }

      // Keep Supabase metadata in sync for greeting and avatar fallbacks.
      if (client) {
        await supabase.auth.updateUser({
          data: {
            firstname: formData.firstname,
            lastname: formData.lastname,
            phone: formData.phone,
          },
        });
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={isLoading} />;
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>
            Your Assigned Doula{assignedDoulas.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAssignedDoulas ? (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Loading assigned doulas...
            </div>
          ) : assignedDoulasError ? (
            <div className='space-y-2'>
              <p className='text-sm text-destructive'>{assignedDoulasError}</p>
              <Button
                variant='outline'
                size='sm'
                onClick={fetchClientAssignedDoulas}
              >
                Retry
              </Button>
            </div>
          ) : assignedDoulas.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              You do not have an assigned doula yet.
            </p>
          ) : (
            <div className='space-y-3'>
              {assignedDoulas.map((assignment) => {
                const doula = assignment.doula;
                const fullName =
                  `${doula.firstname || ''} ${doula.lastname || ''}`.trim() ||
                  doula.email;
                const role = normalizeAssignmentRole(
                  assignment.role ?? assignment.category
                );
                const roleLabel = role
                  ? ASSIGNMENT_ROLE_OPTIONS.find((option) => option.value === role)
                      ?.label || 'Unspecified'
                  : 'Unspecified';
                return (
                  <div
                    key={assignment.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-center gap-3'>
                      <UserAvatar fullName={fullName} />
                      <div>
                        <p className='font-medium'>{fullName}</p>
                        <p className='text-sm text-muted-foreground'>
                          {doula.email}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary'>{roleLabel}</Badge>
                      <Badge variant='outline'>{assignment.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            Updates from your care team
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sharedNotesLoading ? (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Loading…
            </div>
          ) : sharedNotes.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              When your doula shares a note with you, it will appear here.
            </p>
          ) : (
            <ul className='space-y-4'>
              {sharedNotes.map((note) => {
                const parsed = note.created_at ? parseISO(note.created_at) : null;
                const when =
                  parsed && isValid(parsed)
                    ? format(parsed, 'MMM d, yyyy · h:mm a')
                    : note.created_at || '';
                return (
                  <li
                    key={note.id}
                    className='rounded-lg border border-border p-3 text-sm'
                  >
                    <div className='mb-1 flex flex-wrap items-center gap-2'>
                      <Badge variant='secondary' className='text-xs capitalize'>
                        {note.activity_type}
                      </Badge>
                      {when ? (
                        <span className='text-xs text-muted-foreground'>{when}</span>
                      ) : null}
                    </div>
                    <p className='whitespace-pre-wrap text-foreground'>{note.content}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='flex items-center gap-6 mb-6'>
              <UserAvatar
                fullName={
                  `${formData.firstname || ''} ${formData.lastname || ''}`.trim() ||
                  formData.email ||
                  'Client'
                }
                large
              />
              <div>
                <h3 className='text-lg font-semibold'>
                  {formData.firstname} {formData.lastname}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {formData.email}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstname'>First Name</Label>
                <Input
                  id='firstname'
                  value={formData.firstname}
                  onChange={(e) =>
                    setFormData({ ...formData, firstname: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='lastname'>Last Name</Label>
                <Input
                  id='lastname'
                  value={formData.lastname}
                  onChange={(e) =>
                    setFormData({ ...formData, lastname: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                disabled
                className='bg-muted'
              />
              <p className='text-xs text-muted-foreground'>
                Email cannot be changed. Contact support if you need to update
                it.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                type='tel'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={isSaving}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Input
                id='address'
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={isSaving}
              />
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='city'>City</Label>
                <Input
                  id='city'
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='state'>State</Label>
                <Input
                  id='state'
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='zip_code'>Zip Code</Label>
                <Input
                  id='zip_code'
                  value={formData.zip_code}
                  onChange={(e) =>
                    setFormData({ ...formData, zip_code: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                disabled={isSaving}
                rows={4}
                placeholder='Tell us about yourself...'
              />
            </div>

            <div className='flex justify-end'>
              <Button type='submit' disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
