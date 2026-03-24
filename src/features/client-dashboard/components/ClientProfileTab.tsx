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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
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
import { Download, ExternalLink, FileImage, Loader2, MessageSquare, Trash2, Upload } from 'lucide-react';
import { buildUrl, fetchWithAuth } from '@/api/http';
import {
  compareClientDocumentsByUploadedAtDesc,
  deleteClientDocument,
  getClientDocumentLabel,
  getClientDocumentUrl,
  isInsuranceCardDocument,
  listClientDocuments,
  uploadInsuranceCard,
  type ClientDocument,
} from '@/api/clients/clientDocuments';

const BILLING_PAYMENT_METHOD_OPTIONS = [
  'Self-Pay',
  'Commercial Insurance',
  'Private Insurance',
  'Medicaid',
  'Other',
] as const;

function isSelfPayMethod(method: string): boolean {
  const normalized = method.trim().toLowerCase();
  return normalized === 'self-pay' || normalized === 'self pay' || normalized === 'selfpay';
}

function isEndpointUnavailableStatus(status: number): boolean {
  return status === 404 || status === 405 || status === 501;
}

function extractBillingPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {};
  const obj = payload as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object') {
    return obj.data as Record<string, unknown>;
  }
  return obj;
}

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
  const [clientDocuments, setClientDocuments] = useState<ClientDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadingInsuranceCard, setUploadingInsuranceCard] = useState(false);
  const [deletingInsuranceCardId, setDeletingInsuranceCardId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
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
    payment_method: '',
    insurance_provider: '',
    insurance_member_id: '',
    policy_number: '',
    self_pay_card_info: '',
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
        payment_method: profile?.payment_method || profile?.paymentMethod || '',
        insurance_provider:
          profile?.insurance_provider ||
          profile?.insuranceProvider ||
          profile?.insurance ||
          '',
        insurance_member_id:
          profile?.insurance_member_id || profile?.insuranceMemberId || '',
        policy_number: profile?.policy_number || profile?.policyNumber || '',
        self_pay_card_info:
          profile?.self_pay_card_info || profile?.selfPayCardInfo || '',
      });

      // Prefer dedicated billing endpoint when available; keep profile values as fallback.
      try {
        const billingResponse = await fetchWithAuth(buildUrl('/api/clients/me/billing'), {
          method: 'GET',
        });
        if (billingResponse.ok) {
          const billingRaw = await billingResponse.json().catch(() => ({}));
          const billing = extractBillingPayload(billingRaw);
          setFormData((prev) => ({
            ...prev,
            payment_method:
              String(
                billing.payment_method ??
                  billing.paymentMethod ??
                  prev.payment_method ??
                  ''
              ) || '',
            insurance_provider:
              String(
                billing.insurance_provider ??
                  billing.insuranceProvider ??
                  billing.insurance ??
                  prev.insurance_provider ??
                  ''
              ) || '',
            insurance_member_id:
              String(
                billing.insurance_member_id ??
                  billing.insuranceMemberId ??
                  prev.insurance_member_id ??
                  ''
              ) || '',
            policy_number:
              String(
                billing.policy_number ??
                  billing.policyNumber ??
                  prev.policy_number ??
                  ''
              ) || '',
            self_pay_card_info:
              String(
                billing.self_pay_card_info ??
                  billing.selfPayCardInfo ??
                  prev.self_pay_card_info ??
                  ''
              ) || '',
          }));
        }
      } catch {
        // Keep backward compatibility: ignore if endpoint is unavailable or unreachable.
      }
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
        payment_method: '',
        insurance_provider: '',
        insurance_member_id: '',
        policy_number: '',
        self_pay_card_info: '',
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

  const fetchClientDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const documents = await listClientDocuments('client-self');
      setClientDocuments(documents);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load billing documents');
      setClientDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (effectiveClientId) {
      fetchProfile();
      fetchClientAssignedDoulas();
      fetchSharedNotesFromDoula();
      fetchClientDocuments();
    } else {
      setIsLoading(false);
    }
  }, [
    effectiveClientId,
    fetchProfile,
    fetchClientAssignedDoulas,
    fetchSharedNotesFromDoula,
    fetchClientDocuments,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!effectiveClientId) return;

    setIsSaving(true);
    try {
      const selectedPaymentMethod = formData.payment_method.trim();
      const isSelfPay = isSelfPayMethod(selectedPaymentMethod);

      if (!selectedPaymentMethod) {
        toast.error('Please select a payment method.');
        setIsSaving(false);
        return;
      }
      if (isSelfPay && !formData.self_pay_card_info.trim()) {
        toast.error('Please enter credit card information for self-pay.');
        setIsSaving(false);
        return;
      }
      if (!isSelfPay && !formData.insurance_provider.trim()) {
        toast.error('Please enter an insurance provider for insurance billing.');
        setIsSaving(false);
        return;
      }

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

      const billingPayload = {
        payment_method: selectedPaymentMethod,
        insurance_provider: isSelfPay ? '' : formData.insurance_provider,
        insurance_member_id: isSelfPay ? '' : formData.insurance_member_id,
        policy_number: isSelfPay ? '' : formData.policy_number,
        self_pay_card_info: isSelfPay ? formData.self_pay_card_info : '',
        // Keep legacy insurance field in sync where backend still uses it.
        insurance: isSelfPay ? '' : formData.insurance_provider,
      };

      const billingResponse = await fetchWithAuth(buildUrl('/api/clients/me/billing'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billingPayload),
      });

      if (!billingResponse.ok) {
        if (isEndpointUnavailableStatus(billingResponse.status)) {
          // Backward compatibility fallback to existing profile endpoint.
          const legacyBillingResponse = await fetch(
            `${getClientApiBase()}/clients/${effectiveClientId}`,
            {
              method: 'PUT',
              credentials: 'include',
              headers: getClientAuthHeaders(token),
              body: JSON.stringify(billingPayload),
            }
          );
          if (!legacyBillingResponse.ok) {
            const legacyErrorText = await legacyBillingResponse
              .text()
              .catch(() => '');
            throw new Error(
              `Failed to update billing (${legacyBillingResponse.status}) ${legacyErrorText}`.trim()
            );
          }
        } else {
          const billingErrorText = await billingResponse.text().catch(() => '');
          throw new Error(
            `Failed to update billing (${billingResponse.status}) ${billingErrorText}`.trim()
          );
        }
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

  const activeInsuranceCard =
    clientDocuments
      .filter(isInsuranceCardDocument)
      .sort(compareClientDocumentsByUploadedAtDesc)[0] ?? null;

  const handleInsuranceCardSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const lowerName = file.name.toLowerCase();
    const hasAcceptedExtension =
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.pdf');

    if (!acceptedTypes.includes(file.type) && !hasAcceptedExtension) {
      toast.error('Please upload a JPG, PNG, or PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Max size is 10MB.');
      return;
    }

    setUploadingInsuranceCard(true);
    try {
      await uploadInsuranceCard(file);
      toast.success('Insurance card uploaded successfully');
      await fetchClientDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload insurance card');
    } finally {
      setUploadingInsuranceCard(false);
    }
  };

  const handleDeleteInsuranceCard = async (documentItem: ClientDocument) => {
    setDeletingInsuranceCardId(documentItem.id);
    try {
      await deleteClientDocument(documentItem.id);
      setClientDocuments((prev) => prev.filter((item) => item.id !== documentItem.id));
      toast.success('Insurance card deleted successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete insurance card'
      );
    } finally {
      setDeletingInsuranceCardId(null);
    }
  };

  const handleOpenDocument = async (documentItem: ClientDocument) => {
    setActiveDocumentId(documentItem.id);
    try {
      const url =
        documentItem.url ||
        (await getClientDocumentUrl('client-self', documentItem.id));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open insurance card');
    } finally {
      setActiveDocumentId(null);
    }
  };

  const handleDownloadDocument = async (documentItem: ClientDocument) => {
    setActiveDocumentId(documentItem.id);
    try {
      const url =
        documentItem.url ||
        (await getClientDocumentUrl('client-self', documentItem.id));
      const response = await fetch(url, {
        credentials: 'omit',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Failed to download insurance card');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = documentItem.fileName || 'insurance-card';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download insurance card');
    } finally {
      setActiveDocumentId(null);
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
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='rounded-lg border border-dashed p-4'>
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
              <div className='space-y-1'>
                <p className='font-medium'>Insurance card</p>
                <p className='text-sm text-muted-foreground'>
                  Upload a JPG, PNG, or PDF of your insurance card. Staff will be able to
                  view and download it from your client profile.
                </p>
              </div>
              <div>
                <input
                  id='insurance-card-upload'
                  type='file'
                  accept='.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
                  className='hidden'
                  onChange={handleInsuranceCardSelected}
                  disabled={uploadingInsuranceCard || Boolean(deletingInsuranceCardId)}
                />
                <Button
                  type='button'
                  onClick={() =>
                    document.getElementById('insurance-card-upload')?.click()
                  }
                  disabled={uploadingInsuranceCard || Boolean(deletingInsuranceCardId)}
                >
                  <Upload className='mr-2 h-4 w-4' />
                  {uploadingInsuranceCard
                    ? 'Uploading...'
                    : activeInsuranceCard
                      ? 'Upload Another'
                      : 'Upload Insurance Card'}
                </Button>
              </div>
            </div>
          </div>

          {documentsLoading ? (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Loading uploaded documents...
            </div>
          ) : !activeInsuranceCard ? (
            <p className='text-sm text-muted-foreground'>
              No insurance card uploaded yet.
            </p>
          ) : (
            <div className='space-y-3'>
              {[activeInsuranceCard].map((documentItem) => {
                const parsed = documentItem.uploadedAt
                  ? parseISO(documentItem.uploadedAt)
                  : null;
                const uploadedAt =
                  parsed && isValid(parsed)
                    ? format(parsed, 'MMM d, yyyy')
                    : documentItem.uploadedAt || '';
                const isBusy =
                  activeDocumentId === documentItem.id ||
                  deletingInsuranceCardId === documentItem.id ||
                  uploadingInsuranceCard;

                return (
                  <div
                    key={documentItem.id}
                    className='flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between'
                  >
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <FileImage className='h-4 w-4 text-primary' />
                        <p className='truncate text-sm font-medium'>
                          {documentItem.fileName}
                        </p>
                        <Badge variant='secondary'>
                          {getClientDocumentLabel(documentItem.documentType)}
                        </Badge>
                      </div>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {uploadedAt ? `Uploaded ${uploadedAt}` : 'Upload date unavailable'}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => void handleOpenDocument(documentItem)}
                        disabled={isBusy}
                      >
                        <ExternalLink className='mr-1 h-4 w-4' />
                        {activeDocumentId === documentItem.id ? 'Opening...' : 'View'}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => void handleDownloadDocument(documentItem)}
                        disabled={isBusy}
                      >
                        <Download className='mr-1 h-4 w-4' />
                        {activeDocumentId === documentItem.id ? 'Working...' : 'Download'}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => void handleDeleteInsuranceCard(documentItem)}
                        disabled={isBusy}
                      >
                        <Trash2 className='mr-1 h-4 w-4' />
                        {deletingInsuranceCardId === documentItem.id
                          ? 'Removing...'
                          : 'Remove Insurance Card'}
                      </Button>
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

            <div className='rounded-lg border p-4 space-y-4'>
              <h4 className='text-base font-semibold'>Billing Information</h4>

              <div className='space-y-2'>
                <Label>Payment Method</Label>
                <Select
                  value={formData.payment_method || undefined}
                  onValueChange={(value) => {
                    const selfPaySelected = isSelfPayMethod(value);
                    setFormData((prev) => ({
                      ...prev,
                      payment_method: value,
                      insurance_provider: selfPaySelected ? '' : prev.insurance_provider,
                      insurance_member_id: selfPaySelected ? '' : prev.insurance_member_id,
                      policy_number: selfPaySelected ? '' : prev.policy_number,
                      self_pay_card_info: selfPaySelected ? prev.self_pay_card_info : '',
                    }));
                  }}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select payment method' />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_PAYMENT_METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isSelfPayMethod(formData.payment_method) ? (
                <div className='space-y-2'>
                  <Label htmlFor='self_pay_card_info'>Credit Card Information</Label>
                  <Textarea
                    id='self_pay_card_info'
                    value={formData.self_pay_card_info}
                    onChange={(e) =>
                      setFormData({ ...formData, self_pay_card_info: e.target.value })
                    }
                    disabled={isSaving}
                    rows={3}
                    placeholder='Cardholder name, card brand, and last 4 digits'
                  />
                </div>
              ) : (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='insurance_provider'>Insurance Provider</Label>
                    <Input
                      id='insurance_provider'
                      value={formData.insurance_provider}
                      onChange={(e) =>
                        setFormData({ ...formData, insurance_provider: e.target.value })
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='insurance_member_id'>Insurance Member ID</Label>
                      <Input
                        id='insurance_member_id'
                        value={formData.insurance_member_id}
                        onChange={(e) =>
                          setFormData({ ...formData, insurance_member_id: e.target.value })
                        }
                        disabled={isSaving}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='policy_number'>Policy Number</Label>
                      <Input
                        id='policy_number'
                        value={formData.policy_number}
                        onChange={(e) =>
                          setFormData({ ...formData, policy_number: e.target.value })
                        }
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </>
              )}
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
