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
  getInsuranceCardSide,
  isInsuranceCardDocument,
  listClientDocuments,
  uploadInsuranceCard,
  formatClientDocumentErrorMessage,
  type InsuranceCardSide,
  type ClientDocument,
} from '@/api/clients/clientDocuments';
import { normalizeZipCode } from '@/common/utils/zipCode';
import {
  isMedicaidMethod,
  isSelfPayMethod as sharedIsSelfPayMethod,
  requiresInsuranceDetails,
  getPaymentMethodMessage,
  derivePaymentAuthorizationStatus,
} from '@/lib/paymentRules';
import { getPaymentAuthorizationFormHref } from '@/lib/paymentAuthorizationForm';

type ClientDashboardView = 'all' | 'profile' | 'billing';

const BILLING_PAYMENT_METHOD_OPTIONS = [
  'Self-Pay',
  'Commercial Insurance',
  'Private Insurance',
  'Medicaid',
] as const;

function normalizeBillingPaymentMethod(method: unknown): string {
  const raw = String(method ?? '').trim();
  if (!raw) return '';

  const normalized = raw.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ');

  if (normalized === 'self-pay' || normalized === 'self pay' || normalized === 'selfpay') {
    return 'Self-Pay';
  }
  if (normalized === 'commercial insurance') {
    return 'Commercial Insurance';
  }
  if (normalized === 'private insurance') {
    return 'Private Insurance';
  }
  if (normalized === 'medicaid') {
    return 'Medicaid';
  }

  return raw;
}

function isBillingPaymentMethodOption(value: string): boolean {
  return BILLING_PAYMENT_METHOD_OPTIONS.includes(value as (typeof BILLING_PAYMENT_METHOD_OPTIONS)[number]);
}

function isSelfPayMethod(method: string): boolean {
  return sharedIsSelfPayMethod(method);
}

/** Returns true when insurance-specific fields should be shown (not Medicaid, not Self-Pay). */
function hasInsuranceBilling(method: string): boolean {
  const trimmed = method.trim();
  return trimmed.length > 0 && !isSelfPayMethod(trimmed) && !isMedicaidMethod(trimmed);
}

function isImageDocument(document: ClientDocument): boolean {
  const contentType = document.contentType?.toLowerCase() || '';
  if (contentType.startsWith('image/')) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(document.fileName);
}

function isEndpointUnavailableStatus(status: number): boolean {
  return status === 404 || status === 405 || status === 501;
}

export function getInsuranceCardDocumentForSide(
  documents: ClientDocument[],
  side: InsuranceCardSide
): ClientDocument | null {
  const explicit = documents.find(
    (document) => getInsuranceCardSide(document.documentType, document.fileName) === side
  );
  if (explicit) return explicit;
  const hasSideTaggedDocument = documents.some(
    (document) => getInsuranceCardSide(document.documentType, document.fileName) !== null
  );
  if (hasSideTaggedDocument) return null;
  if (side === 'front') return documents.find((document) => document.documentType === 'insurance_card') ?? null;
  return null;
}

export function buildClientProfileUpdatePayload(formData: {
  firstname: string;
  lastname: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string | number | null | undefined;
}) {
  return {
    firstname: formData.firstname,
    lastname: formData.lastname,
    phone: formData.phone,
    phone_number: formData.phone,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zip_code: normalizeZipCode(formData.zip_code),
  };
}

function extractBillingPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {};
  const obj = payload as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object') {
    return obj.data as Record<string, unknown>;
  }
  return obj;
}

interface ClientProfileTabProps {
  view?: ClientDashboardView;
}

export default function ClientProfileTab({ view = 'all' }: ClientProfileTabProps) {
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
  const [uploadingInsuranceCardSide, setUploadingInsuranceCardSide] =
    useState<InsuranceCardSide | null>(null);
  const [deletingInsuranceCardId, setDeletingInsuranceCardId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [documentPreviewUrls, setDocumentPreviewUrls] = useState<Record<string, string>>({});
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileSnapshot, setProfileSnapshot] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });
  const [billingPaymentMethodDisplay, setBillingPaymentMethodDisplay] = useState('');
  const [isBillingEditing, setIsBillingEditing] = useState(false);
  const [billingSnapshot, setBillingSnapshot] = useState({
    payment_method: '',
    insurance_provider: '',
    insurance_member_id: '',
    policy_number: '',
    insurance_phone_number: '',
    has_secondary_insurance: false,
    secondary_insurance_provider: '',
    secondary_insurance_member_id: '',
    secondary_policy_number: '',
  });
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    payment_method: '',
    insurance_provider: '',
    insurance_member_id: '',
    policy_number: '',
    insurance_phone_number: '',
    has_secondary_insurance: false,
    secondary_insurance_provider: '',
    secondary_insurance_member_id: '',
    secondary_policy_number: '',
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

      const profilePaymentMethod = normalizeBillingPaymentMethod(
        profile?.payment_method ?? profile?.paymentMethod ?? ''
      );
      const profileBillingState = {
        payment_method: isBillingPaymentMethodOption(profilePaymentMethod)
          ? profilePaymentMethod
          : '',
        insurance_provider:
          profile?.insurance_provider ||
          profile?.insuranceProvider ||
          profile?.insurance ||
          '',
        insurance_member_id:
          profile?.insurance_member_id || profile?.insuranceMemberId || '',
        policy_number: profile?.policy_number || profile?.policyNumber || '',
        insurance_phone_number:
          profile?.insurance_phone_number || profile?.insurancePhoneNumber || '',
        has_secondary_insurance:
          profile?.has_secondary_insurance ?? profile?.hasSecondaryInsurance ?? false,
        secondary_insurance_provider:
          profile?.secondary_insurance_provider ||
          profile?.secondaryInsuranceProvider ||
          '',
        secondary_insurance_member_id:
          profile?.secondary_insurance_member_id ||
          profile?.secondaryInsuranceMemberId ||
          '',
        secondary_policy_number:
          profile?.secondary_policy_number || profile?.secondaryPolicyNumber || '',
      };

      setFormData({
        firstname: profile?.firstname || profile?.first_name || effectiveClientFirstName,
        lastname: profile?.lastname || profile?.last_name || effectiveClientLastName,
        email: profile?.email || effectiveClientEmail,
        phone: profile?.phone || profile?.phone_number || '',
        address: profile?.address || profile?.address_line1 || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip_code: normalizeZipCode(profile?.zip_code ?? profile?.zipCode),
        ...profileBillingState,
      });
      setProfileSnapshot({
        firstname: profile?.firstname || profile?.first_name || effectiveClientFirstName,
        lastname: profile?.lastname || profile?.last_name || effectiveClientLastName,
        phone: profile?.phone || profile?.phone_number || '',
        address: profile?.address || profile?.address_line1 || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip_code: normalizeZipCode(profile?.zip_code ?? profile?.zipCode),
      });
      setIsProfileEditing(false);
      setBillingPaymentMethodDisplay(profilePaymentMethod);
      setBillingSnapshot(profileBillingState);
      setIsBillingEditing(false);

      // Prefer dedicated billing endpoint when available; keep profile values as fallback.
      try {
        const billingResponse = await fetchWithAuth(buildUrl('/api/clients/me/billing'), {
          method: 'GET',
        });
        if (billingResponse.ok) {
          const billingRaw = await billingResponse.json().catch(() => ({}));
          const billing = extractBillingPayload(billingRaw);
          const loadedPaymentMethod = normalizeBillingPaymentMethod(
            billing.payment_method ??
              billing.paymentMethod ??
              profilePaymentMethod ??
              ''
          );
          const loadedBillingState = {
            payment_method: isBillingPaymentMethodOption(loadedPaymentMethod)
              ? loadedPaymentMethod
              : '',
            insurance_provider:
              String(
                billing.insurance_provider ??
                  billing.insuranceProvider ??
                  billing.insurance ??
                  profileBillingState.insurance_provider ??
                  ''
              ) || '',
            insurance_member_id:
              String(
                billing.insurance_member_id ??
                  billing.insuranceMemberId ??
                  profileBillingState.insurance_member_id ??
                  ''
              ) || '',
            policy_number:
              String(
                billing.policy_number ??
                  billing.policyNumber ??
                  profileBillingState.policy_number ??
                  ''
              ) || '',
            insurance_phone_number:
              String(
                billing.insurance_phone_number ??
                  billing.insurancePhoneNumber ??
                  profileBillingState.insurance_phone_number ??
                  ''
              ) || '',
            has_secondary_insurance:
              billing.has_secondary_insurance ??
              billing.hasSecondaryInsurance ??
              profileBillingState.has_secondary_insurance ??
              false,
            secondary_insurance_provider:
              String(
                billing.secondary_insurance_provider ??
                  billing.secondaryInsuranceProvider ??
                  profileBillingState.secondary_insurance_provider ??
                  ''
              ) || '',
            secondary_insurance_member_id:
              String(
                billing.secondary_insurance_member_id ??
                  billing.secondaryInsuranceMemberId ??
                  profileBillingState.secondary_insurance_member_id ??
                  ''
              ) || '',
            secondary_policy_number:
              String(
                billing.secondary_policy_number ??
                  billing.secondaryPolicyNumber ??
                  profileBillingState.secondary_policy_number ??
                  ''
              ) || '',
          };
          setFormData((prev) => ({
            ...prev,
            ...loadedBillingState,
          }));
          setProfileSnapshot((prev) => ({
            ...prev,
            firstname: profile?.firstname || profile?.first_name || effectiveClientFirstName,
            lastname: profile?.lastname || profile?.last_name || effectiveClientLastName,
            phone: profile?.phone || profile?.phone_number || '',
            address: profile?.address || profile?.address_line1 || '',
            city: profile?.city || '',
            state: profile?.state || '',
            zip_code: normalizeZipCode(profile?.zip_code ?? profile?.zipCode),
          }));
          setBillingPaymentMethodDisplay(loadedPaymentMethod);
          setBillingSnapshot(loadedBillingState);
          setIsBillingEditing(false);
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
        payment_method: '',
        insurance_provider: '',
        insurance_member_id: '',
        policy_number: '',
        insurance_phone_number: '',
        has_secondary_insurance: false,
        secondary_insurance_provider: '',
        secondary_insurance_member_id: '',
        secondary_policy_number: '',
      });
      setBillingPaymentMethodDisplay('');
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
      const message =
        error instanceof Error
          ? formatClientDocumentErrorMessage(error.message)
          : 'Failed to load billing documents';
      toast.error(message);
      setClientDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const populatePreviewUrls = async () => {
      const imageDocs = clientDocuments.filter(isInsuranceCardDocument).filter(isImageDocument);
      const missingDocs = imageDocs.filter((doc) => !documentPreviewUrls[doc.id]);

      if (missingDocs.length === 0) return;

      const entries = await Promise.all(
        missingDocs.map(async (doc) => {
          try {
            const url = doc.url || (await getClientDocumentUrl('client-self', doc.id));
            return [doc.id, url] as const;
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      setDocumentPreviewUrls((prev) => {
        const next = { ...prev };
        entries.forEach((entry) => {
          if (entry) {
            next[entry[0]] = entry[1];
          }
        });
        return next;
      });
    };

    void populatePreviewUrls();
    return () => {
      cancelled = true;
    };
  }, [clientDocuments, documentPreviewUrls]);

  useEffect(() => {
    if (effectiveClientId) {
      fetchProfile();
      if (view !== 'billing') {
        fetchClientAssignedDoulas();
        fetchSharedNotesFromDoula();
      }
      if (view !== 'profile') {
        fetchClientDocuments();
      }
    } else {
      setIsLoading(false);
    }
  }, [
    effectiveClientId,
    fetchProfile,
    fetchClientAssignedDoulas,
    fetchSharedNotesFromDoula,
    fetchClientDocuments,
    view,
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

      if (view === 'profile') {
        const response = await fetch(
          `${getClientApiBase()}/clients/${effectiveClientId}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: getClientAuthHeaders(token),
            body: JSON.stringify(
              buildClientProfileUpdatePayload({
                firstname: formData.firstname,
                lastname: formData.lastname,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code,
              })
            ),
          }
        );

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(
            `Failed to update profile (${response.status}) ${errorText}`.trim()
          );
        }

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
        setProfileSnapshot({
          firstname: formData.firstname,
          lastname: formData.lastname,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
        });
        setIsProfileEditing(false);
        return;
      }

      if (view === 'billing') {
        const selectedPaymentMethod = formData.payment_method.trim();
        const isSelfPay = isSelfPayMethod(selectedPaymentMethod);
        const isMedicaid = isMedicaidMethod(selectedPaymentMethod);
        const needsInsuranceDetails = !isMedicaid && !isSelfPay;

        if (!selectedPaymentMethod) {
          toast.error('Please select a payment method.');
          setIsSaving(false);
          return;
        }
        if (needsInsuranceDetails && !formData.insurance_provider.trim()) {
          toast.error('Please enter an insurance provider for insurance billing.');
          setIsSaving(false);
          return;
        }
        if (needsInsuranceDetails && !formData.insurance_member_id.trim()) {
          toast.error('Please enter an insurance member ID for insurance billing.');
          setIsSaving(false);
          return;
        }
        if (needsInsuranceDetails && !formData.policy_number.trim()) {
          toast.error('Please enter a policy number for insurance billing.');
          setIsSaving(false);
          return;
        }
        if (formData.has_secondary_insurance) {
          if (!formData.secondary_insurance_provider.trim()) {
            toast.error('Please enter a secondary insurance provider.');
            setIsSaving(false);
            return;
          }
          if (!formData.secondary_insurance_member_id.trim()) {
            toast.error('Please enter a secondary insurance member ID.');
            setIsSaving(false);
            return;
          }
          if (!formData.secondary_policy_number.trim()) {
            toast.error('Please enter a secondary policy number.');
            setIsSaving(false);
            return;
          }
        }
        if (needsInsuranceDetails && (!frontInsuranceCard || !backInsuranceCard)) {
          toast.error('Please upload both the front and back insurance cards before saving insurance billing.');
          setIsSaving(false);
          return;
        }

        const billingPayload = {
          payment_method: selectedPaymentMethod,
          payment_authorization_status: derivePaymentAuthorizationStatus(selectedPaymentMethod),
          insurance_provider: needsInsuranceDetails ? formData.insurance_provider : '',
          insurance_member_id: needsInsuranceDetails ? formData.insurance_member_id : '',
          policy_number: needsInsuranceDetails ? formData.policy_number : '',
          insurance_phone_number: needsInsuranceDetails ? formData.insurance_phone_number : '',
          has_secondary_insurance: needsInsuranceDetails ? formData.has_secondary_insurance : false,
          secondary_insurance_provider: needsInsuranceDetails ? formData.secondary_insurance_provider : '',
          secondary_insurance_member_id: needsInsuranceDetails ? formData.secondary_insurance_member_id : '',
          secondary_policy_number: needsInsuranceDetails ? formData.secondary_policy_number : '',
          insurance: needsInsuranceDetails ? formData.insurance_provider : '',
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
              const legacyErrorText = await legacyBillingResponse.text().catch(() => '');
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

        toast.success('Billing updated successfully');
        setBillingPaymentMethodDisplay(selectedPaymentMethod);
        setBillingSnapshot({
          payment_method: isSelfPay ? 'Self-Pay' : selectedPaymentMethod,
          insurance_provider: isSelfPay ? '' : formData.insurance_provider,
          insurance_member_id: isSelfPay ? '' : formData.insurance_member_id,
          policy_number: isSelfPay ? '' : formData.policy_number,
          insurance_phone_number: isSelfPay ? '' : formData.insurance_phone_number,
          has_secondary_insurance: isSelfPay ? false : formData.has_secondary_insurance,
          secondary_insurance_provider: isSelfPay ? '' : formData.secondary_insurance_provider,
          secondary_insurance_member_id: isSelfPay ? '' : formData.secondary_insurance_member_id,
          secondary_policy_number: isSelfPay ? '' : formData.secondary_policy_number,
        });
        setIsBillingEditing(false);
        return;
      }

      const selectedPaymentMethod = formData.payment_method.trim();
      const isSelfPay = isSelfPayMethod(selectedPaymentMethod);
      const isMedicaid = isMedicaidMethod(selectedPaymentMethod);
      const needsInsuranceDetails = !isMedicaid && !isSelfPay;

      if (!selectedPaymentMethod) {
        toast.error('Please select a payment method.');
        setIsSaving(false);
        return;
      }
      if (needsInsuranceDetails && !formData.insurance_provider.trim()) {
        toast.error('Please enter an insurance provider for insurance billing.');
        setIsSaving(false);
        return;
      }
      if (needsInsuranceDetails && !formData.insurance_member_id.trim()) {
        toast.error('Please enter an insurance member ID for insurance billing.');
        setIsSaving(false);
        return;
      }
      if (needsInsuranceDetails && !formData.policy_number.trim()) {
        toast.error('Please enter a policy number for insurance billing.');
        setIsSaving(false);
        return;
      }
      if (formData.has_secondary_insurance) {
        if (!formData.secondary_insurance_provider.trim()) {
          toast.error('Please enter a secondary insurance provider.');
          setIsSaving(false);
          return;
        }
        if (!formData.secondary_insurance_member_id.trim()) {
          toast.error('Please enter a secondary insurance member ID.');
          setIsSaving(false);
          return;
        }
        if (!formData.secondary_policy_number.trim()) {
          toast.error('Please enter a secondary policy number.');
          setIsSaving(false);
          return;
        }
      }
      if (needsInsuranceDetails && (!frontInsuranceCard || !backInsuranceCard)) {
        toast.error('Please upload both the front and back insurance cards before saving insurance billing.');
        setIsSaving(false);
        return;
      }

      const response = await fetch(
        `${getClientApiBase()}/clients/${effectiveClientId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: getClientAuthHeaders(token),
          body: JSON.stringify(buildClientProfileUpdatePayload(formData)),
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
        payment_authorization_status: derivePaymentAuthorizationStatus(selectedPaymentMethod),
        insurance_provider: needsInsuranceDetails ? formData.insurance_provider : '',
        insurance_member_id: needsInsuranceDetails ? formData.insurance_member_id : '',
        policy_number: needsInsuranceDetails ? formData.policy_number : '',
        insurance_phone_number: needsInsuranceDetails ? formData.insurance_phone_number : '',
        has_secondary_insurance: needsInsuranceDetails ? formData.has_secondary_insurance : false,
        secondary_insurance_provider: needsInsuranceDetails ? formData.secondary_insurance_provider : '',
        secondary_insurance_member_id: needsInsuranceDetails ? formData.secondary_insurance_member_id : '',
        secondary_policy_number: needsInsuranceDetails ? formData.secondary_policy_number : '',
        // Keep legacy insurance field in sync where backend still uses it.
        insurance: needsInsuranceDetails ? formData.insurance_provider : '',
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
      setBillingPaymentMethodDisplay(selectedPaymentMethod);
      setBillingSnapshot({
        payment_method: selectedPaymentMethod,
        insurance_provider: needsInsuranceDetails ? formData.insurance_provider : '',
        insurance_member_id: needsInsuranceDetails ? formData.insurance_member_id : '',
        policy_number: needsInsuranceDetails ? formData.policy_number : '',
        insurance_phone_number: needsInsuranceDetails ? formData.insurance_phone_number : '',
        has_secondary_insurance: needsInsuranceDetails ? formData.has_secondary_insurance : false,
        secondary_insurance_provider: needsInsuranceDetails ? formData.secondary_insurance_provider : '',
        secondary_insurance_member_id: needsInsuranceDetails ? formData.secondary_insurance_member_id : '',
        secondary_policy_number: needsInsuranceDetails ? formData.secondary_policy_number : '',
      });
      setIsBillingEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const insuranceCardDocuments = clientDocuments
    .filter(isInsuranceCardDocument)
    .sort(compareClientDocumentsByUploadedAtDesc);
  const frontInsuranceCard = getInsuranceCardDocumentForSide(insuranceCardDocuments, 'front');
  const backInsuranceCard = getInsuranceCardDocumentForSide(insuranceCardDocuments, 'back');
  const isProfileFormDisabled = isSaving || !isProfileEditing;
  /** Commercial / Private only: both card images required before save. */
  const needsCommercialPrivateInsuranceCards =
    requiresInsuranceDetails(formData.payment_method) &&
    (!frontInsuranceCard || !backInsuranceCard);
  const isBillingFormDisabled = isSaving || !isBillingEditing;
  const isBillingSaveDisabled =
    isSaving || !isBillingEditing || needsCommercialPrivateInsuranceCards;

  const handleStartProfileEdit = () => {
    setProfileSnapshot({
      firstname: formData.firstname,
      lastname: formData.lastname,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
    });
    setIsProfileEditing(true);
  };

  const handleCancelProfileEdit = () => {
    setFormData((prev) => ({
      ...prev,
      firstname: profileSnapshot.firstname,
      lastname: profileSnapshot.lastname,
      phone: profileSnapshot.phone,
      address: profileSnapshot.address,
      city: profileSnapshot.city,
      state: profileSnapshot.state,
      zip_code: profileSnapshot.zip_code,
    }));
    setIsProfileEditing(false);
  };

  const handleStartBillingEdit = () => {
      setBillingSnapshot({
        payment_method: formData.payment_method,
        insurance_provider: formData.insurance_provider,
        insurance_member_id: formData.insurance_member_id,
        policy_number: formData.policy_number,
        insurance_phone_number: formData.insurance_phone_number,
        has_secondary_insurance: formData.has_secondary_insurance,
        secondary_insurance_provider: formData.secondary_insurance_provider,
        secondary_insurance_member_id: formData.secondary_insurance_member_id,
        secondary_policy_number: formData.secondary_policy_number,
      });
    setIsBillingEditing(true);
  };

  const handleCancelBillingEdit = () => {
    setFormData((prev) => ({
      ...prev,
      payment_method: billingSnapshot.payment_method,
      insurance_provider: billingSnapshot.insurance_provider,
      insurance_member_id: billingSnapshot.insurance_member_id,
      policy_number: billingSnapshot.policy_number,
      insurance_phone_number: billingSnapshot.insurance_phone_number,
      has_secondary_insurance: billingSnapshot.has_secondary_insurance,
      secondary_insurance_provider: billingSnapshot.secondary_insurance_provider,
      secondary_insurance_member_id: billingSnapshot.secondary_insurance_member_id,
      secondary_policy_number: billingSnapshot.secondary_policy_number,
    }));
    setBillingPaymentMethodDisplay(billingSnapshot.payment_method);
    setIsBillingEditing(false);
  };

  const handleInsuranceCardSelected = async (
    side: InsuranceCardSide,
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

    setUploadingInsuranceCardSide(side);
    try {
      await uploadInsuranceCard(file, side);
      toast.success(`Insurance card ${side} uploaded successfully`);
      await fetchClientDocuments();
    } catch (error) {
      const message =
        error instanceof Error
          ? formatClientDocumentErrorMessage(error.message)
          : `Failed to upload insurance card ${side}`;
      toast.error(message);
    } finally {
      setUploadingInsuranceCardSide((current) => (current === side ? null : current));
    }
  };

  const handleDeleteInsuranceCard = async (documentItem: ClientDocument) => {
    setDeletingInsuranceCardId(documentItem.id);
    try {
      await deleteClientDocument(documentItem.id);
      setClientDocuments((prev) => prev.filter((item) => item.id !== documentItem.id));
      setDocumentPreviewUrls((prev) => {
        const next = { ...prev };
        delete next[documentItem.id];
        return next;
      });
      await fetchClientDocuments();
      toast.success('Insurance card deleted successfully');
    } catch (error) {
      const message =
        error instanceof Error
          ? formatClientDocumentErrorMessage(error.message)
          : 'Failed to delete insurance card';
      toast.error(message);
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
      const message =
        error instanceof Error
          ? formatClientDocumentErrorMessage(error.message)
          : 'Failed to open insurance card';
      toast.error(message);
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
      const message =
        error instanceof Error
          ? formatClientDocumentErrorMessage(error.message)
          : 'Failed to download insurance card';
      toast.error(message);
    } finally {
      setActiveDocumentId(null);
    }
  };

  const renderInsuranceCardDocument = (documentItem: ClientDocument) => {
    const parsed = documentItem.uploadedAt ? parseISO(documentItem.uploadedAt) : null;
    const uploadedAt =
      parsed && isValid(parsed) ? format(parsed, 'MMM d, yyyy') : documentItem.uploadedAt || '';
    const isBusy =
      activeDocumentId === documentItem.id ||
      deletingInsuranceCardId === documentItem.id ||
      uploadingInsuranceCardSide !== null;
    const previewUrl = documentPreviewUrls[documentItem.id] || documentItem.url || '';
    const showPreview = isImageDocument(documentItem) && previewUrl;

    return (
      <div
        key={documentItem.id}
        className='flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-start md:justify-between'
      >
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <FileImage className='h-4 w-4 text-primary' />
            <p className='truncate text-sm font-medium'>{documentItem.fileName}</p>
            <Badge variant='secondary'>
              {getClientDocumentLabel(documentItem.documentType, documentItem.fileName)}
            </Badge>
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>
            {uploadedAt ? `Uploaded ${uploadedAt}` : 'Upload date unavailable'}
          </p>
          {showPreview ? (
            <img
              src={previewUrl}
              alt={documentItem.fileName}
              className='mt-3 max-h-56 rounded-md border object-contain'
            />
          ) : null}
        </div>
        <div className='flex flex-wrap items-center gap-2'>
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
            disabled={isBusy || isBillingFormDisabled}
          >
            <Trash2 className='mr-1 h-4 w-4' />
            {deletingInsuranceCardId === documentItem.id
              ? 'Removing...'
              : 'Remove Insurance Card'}
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={isLoading} />;
  }

  return (
    <div className='space-y-4'>
      {view !== 'billing' ? (
        <>
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
        </>
      ) : null}

      {view !== 'billing' ? (
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='mb-4 flex items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
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
              <div className='flex flex-wrap gap-2'>
                {isProfileEditing ? (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancelProfileEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button
                  type='button'
                  variant={isProfileEditing ? 'secondary' : 'outline'}
                  onClick={handleStartProfileEdit}
                  disabled={isSaving || isProfileEditing}
                >
                  {isProfileEditing ? 'Editing Profile' : 'Edit Profile'}
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <Label htmlFor='firstname'>First Name</Label>
                <Input
                  id='firstname'
                  value={formData.firstname}
                  onChange={(e) =>
                    setFormData({ ...formData, firstname: e.target.value })
                  }
                  disabled={isProfileFormDisabled}
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
                  disabled={isProfileFormDisabled}
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
                disabled={isProfileFormDisabled}
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
                disabled={isProfileFormDisabled}
              />
            </div>

            <div className='grid grid-cols-3 gap-3'>
              <div className='space-y-2'>
                <Label htmlFor='city'>City</Label>
                <Input
                  id='city'
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  disabled={isProfileFormDisabled}
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
                  disabled={isProfileFormDisabled}
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
                  disabled={isProfileFormDisabled}
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <Button type='submit' disabled={isProfileFormDisabled}>
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      ) : null}

      {view !== 'profile' ? (
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Current payment method:{' '}
                  <span className='font-medium text-foreground'>
                    {billingPaymentMethodDisplay || 'Not set'}
                  </span>
                </p>
              </div>
              <div className='flex flex-wrap gap-2'>
                {isBillingEditing ? (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancelBillingEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button
                  type='button'
                  variant={isBillingEditing ? 'secondary' : 'outline'}
                  onClick={handleStartBillingEdit}
                  disabled={isSaving || isBillingEditing}
                >
                  {isBillingEditing ? 'Editing Billing' : 'Edit Billing'}
                </Button>
              </div>
            </div>

            {(() => {
              const msg = getPaymentMethodMessage(formData.payment_method);
              if (!msg) return null;
              const colors =
                msg.variant === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800';
              return (
                <div className={`rounded-lg border px-4 py-3 text-sm ${colors}`}>
                  {msg.text}
                </div>
              );
            })()}

            {!isBillingEditing ? (
              <p className='text-sm text-muted-foreground'>
                Click <span className='font-medium text-foreground'>Edit Billing</span> to change your
                payment method or add insurance or Medicaid card photos.
              </p>
            ) : (
              <div className='space-y-6'>
                <div className='space-y-1.5'>
                  <Label>Payment method</Label>
                  <Select
                    value={formData.payment_method || undefined}
                    onValueChange={(value) => {
                      const clearInsurance = isSelfPayMethod(value) || isMedicaidMethod(value);
                      setFormData((prev) => ({
                        ...prev,
                        payment_method: value,
                        insurance_provider: clearInsurance ? '' : prev.insurance_provider,
                        insurance_member_id: clearInsurance ? '' : prev.insurance_member_id,
                        policy_number: clearInsurance ? '' : prev.policy_number,
                        insurance_phone_number: clearInsurance ? '' : prev.insurance_phone_number,
                        has_secondary_insurance: clearInsurance ? false : prev.has_secondary_insurance,
                        secondary_insurance_provider: clearInsurance ? '' : prev.secondary_insurance_provider,
                        secondary_insurance_member_id: clearInsurance ? '' : prev.secondary_insurance_member_id,
                        secondary_policy_number: clearInsurance ? '' : prev.secondary_policy_number,
                      }));
                      setBillingPaymentMethodDisplay(value);
                    }}
                    disabled={isBillingFormDisabled}
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

                {hasInsuranceBilling(formData.payment_method) ? (
                  <>
                    <div className='grid gap-3 lg:grid-cols-2'>
                      {[
                        {
                          side: 'front' as const,
                          label: 'Front of Card',
                          document: frontInsuranceCard,
                        },
                        {
                          side: 'back' as const,
                          label: 'Back of Card',
                          document: backInsuranceCard,
                        },
                      ].map((slot) => (
                        <div key={slot.side} className='rounded-lg border border-dashed p-3 space-y-3'>
                          <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                            <div className='space-y-0.5'>
                              <p className='font-medium'>Insurance {slot.label.toLowerCase()} *</p>
                              <p className='text-sm text-muted-foreground'>
                                Upload the {slot.label.toLowerCase()} of the insurance card. Staff will
                                be able to view and download it from your client profile.
                              </p>
                            </div>
                            <div>
                              <input
                                id={`insurance-card-${slot.side}-upload`}
                                type='file'
                                accept='.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
                                className='hidden'
                                onChange={(event) => void handleInsuranceCardSelected(slot.side, event)}
                                disabled={
                                  isBillingFormDisabled ||
                                  uploadingInsuranceCardSide !== null ||
                                  Boolean(deletingInsuranceCardId)
                                }
                              />
                              <Button
                                type='button'
                                onClick={() =>
                                  document.getElementById(`insurance-card-${slot.side}-upload`)?.click()
                                }
                                disabled={
                                  isBillingFormDisabled ||
                                  uploadingInsuranceCardSide !== null ||
                                  Boolean(deletingInsuranceCardId)
                                }
                              >
                                <Upload className='mr-2 h-4 w-4' />
                                {uploadingInsuranceCardSide === slot.side
                                  ? 'Uploading...'
                                  : slot.document
                                    ? `Upload Another ${slot.side === 'front' ? 'Front' : 'Back'} Card`
                                    : `Upload ${slot.side === 'front' ? 'Front' : 'Back'} Card`}
                              </Button>
                            </div>
                          </div>

                          {documentsLoading ? (
                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                              <Loader2 className='h-4 w-4 animate-spin' />
                              Loading uploaded documents...
                            </div>
                          ) : slot.document ? (
                            renderInsuranceCardDocument(slot.document)
                          ) : (
                            <p className='text-sm text-muted-foreground'>
                              No {slot.label.toLowerCase()} uploaded yet.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='insurance_provider'>Insurance Provider *</Label>
                      <Input
                        id='insurance_provider'
                        value={formData.insurance_provider}
                        onChange={(e) =>
                          setFormData({ ...formData, insurance_provider: e.target.value })
                        }
                        disabled={isBillingFormDisabled}
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1.5'>
                        <Label htmlFor='insurance_member_id'>Insurance Member ID *</Label>
                        <Input
                          id='insurance_member_id'
                          value={formData.insurance_member_id}
                          onChange={(e) =>
                            setFormData({ ...formData, insurance_member_id: e.target.value })
                          }
                          disabled={isBillingFormDisabled}
                        />
                      </div>

                      <div className='space-y-1.5'>
                        <Label htmlFor='policy_number'>Policy Number *</Label>
                        <Input
                          id='policy_number'
                          value={formData.policy_number}
                          onChange={(e) =>
                            setFormData({ ...formData, policy_number: e.target.value })
                          }
                          disabled={isBillingFormDisabled}
                        />
                      </div>
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='insurance_phone_number'>Insurance Phone Number</Label>
                      <Input
                        id='insurance_phone_number'
                        value={formData.insurance_phone_number}
                        onChange={(e) =>
                          setFormData({ ...formData, insurance_phone_number: e.target.value })
                        }
                        disabled={isBillingFormDisabled}
                      />
                    </div>

                    <div className='space-y-2 rounded-lg border p-3'>
                      <label className='flex items-center gap-2 text-sm font-medium'>
                        <input
                          type='checkbox'
                          checked={formData.has_secondary_insurance}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              has_secondary_insurance: e.target.checked,
                              secondary_insurance_provider: e.target.checked
                                ? formData.secondary_insurance_provider
                                : '',
                              secondary_insurance_member_id: e.target.checked
                                ? formData.secondary_insurance_member_id
                                : '',
                              secondary_policy_number: e.target.checked
                                ? formData.secondary_policy_number
                                : '',
                            })
                          }
                          disabled={isBillingFormDisabled}
                        />
                        Secondary Insurance?
                      </label>

                      {formData.has_secondary_insurance ? (
                        <>
                          <div className='space-y-1.5'>
                            <Label htmlFor='secondary_insurance_provider'>Secondary Provider *</Label>
                            <Input
                              id='secondary_insurance_provider'
                              value={formData.secondary_insurance_provider}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  secondary_insurance_provider: e.target.value,
                                })
                              }
                              disabled={isBillingFormDisabled}
                            />
                          </div>
                          <div className='grid grid-cols-2 gap-3'>
                            <div className='space-y-1.5'>
                              <Label htmlFor='secondary_insurance_member_id'>Secondary Member ID *</Label>
                              <Input
                                id='secondary_insurance_member_id'
                                value={formData.secondary_insurance_member_id}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    secondary_insurance_member_id: e.target.value,
                                  })
                                }
                                disabled={isBillingFormDisabled}
                              />
                            </div>
                            <div className='space-y-1.5'>
                              <Label htmlFor='secondary_policy_number'>Secondary Policy Number *</Label>
                              <Input
                                id='secondary_policy_number'
                                value={formData.secondary_policy_number}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    secondary_policy_number: e.target.value,
                                  })
                                }
                                disabled={isBillingFormDisabled}
                              />
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {isMedicaidMethod(formData.payment_method) ? (
                  <>
                    <p className='text-sm text-muted-foreground'>
                      Upload photos of your Medicaid ID card (front and back). This is your state or
                      managed-care Medicaid card—not a credit card. Uploads are optional but help us
                      verify your coverage.
                    </p>
                    <div className='grid gap-3 lg:grid-cols-2'>
                      {[
                        {
                          side: 'front' as const,
                          label: 'Front of Medicaid card',
                          document: frontInsuranceCard,
                        },
                        {
                          side: 'back' as const,
                          label: 'Back of Medicaid card',
                          document: backInsuranceCard,
                        },
                      ].map((slot) => (
                        <div key={slot.side} className='rounded-lg border border-dashed p-3 space-y-3'>
                          <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                            <div className='space-y-0.5'>
                              <p className='font-medium'>{slot.label}</p>
                              <p className='text-sm text-muted-foreground'>
                                Staff can view and download this from your profile.
                              </p>
                            </div>
                            <div>
                              <input
                                id={`medicaid-card-${slot.side}-upload`}
                                type='file'
                                accept='.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
                                className='hidden'
                                onChange={(event) => void handleInsuranceCardSelected(slot.side, event)}
                                disabled={
                                  isBillingFormDisabled ||
                                  uploadingInsuranceCardSide !== null ||
                                  Boolean(deletingInsuranceCardId)
                                }
                              />
                              <Button
                                type='button'
                                onClick={() =>
                                  document.getElementById(`medicaid-card-${slot.side}-upload`)?.click()
                                }
                                disabled={
                                  isBillingFormDisabled ||
                                  uploadingInsuranceCardSide !== null ||
                                  Boolean(deletingInsuranceCardId)
                                }
                              >
                                <Upload className='mr-2 h-4 w-4' />
                                {uploadingInsuranceCardSide === slot.side
                                  ? 'Uploading...'
                                  : slot.document
                                    ? `Replace ${slot.side === 'front' ? 'Front' : 'Back'}`
                                    : `Upload ${slot.side === 'front' ? 'Front' : 'Back'}`}
                              </Button>
                            </div>
                          </div>

                          {documentsLoading ? (
                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                              <Loader2 className='h-4 w-4 animate-spin' />
                              Loading uploaded documents...
                            </div>
                          ) : slot.document ? (
                            renderInsuranceCardDocument(slot.document)
                          ) : (
                            <p className='text-sm text-muted-foreground'>
                              No {slot.side} photo uploaded yet.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {isSelfPayMethod(formData.payment_method) ? (
                  <p className='text-sm text-muted-foreground'>
                    Self-pay billing is supported without storing credit card details in this portal.
                  </p>
                ) : null}

                {!formData.payment_method.trim() ? (
                  <p className='text-sm text-muted-foreground'>
                    Choose a payment method above to configure the rest of your billing details.
                  </p>
                ) : null}

                <div className='flex justify-end'>
                  <Button
                    type='submit'
                    disabled={isBillingSaveDisabled}
                    title={
                      needsCommercialPrivateInsuranceCards
                        ? 'Upload front and back insurance cards to enable saving'
                        : undefined
                    }
                  >
                    {isSaving
                      ? 'Saving...'
                      : needsCommercialPrivateInsuranceCards
                        ? 'Upload Insurance Card'
                        : 'Save Billing Changes'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      ) : null}

      {view !== 'profile' && !isMedicaidMethod(formData.payment_method) ? (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Payment authorization</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              For plans that require a card or bank payment on file, we collect that through a{' '}
              <span className='font-medium text-foreground'>payment authorization form</span>—not by
              entering card numbers in this portal. Download the form below, complete it, and return
              it to your care team as they instruct. When we have your authorization on file, your
              status will show in billing.
            </p>
            <Button variant='outline' size='sm' className='w-fit' asChild>
              <a
                href={getPaymentAuthorizationFormHref()}
                download
                target='_blank'
                rel='noopener noreferrer'
              >
                <Download className='mr-2 h-4 w-4' />
                Download payment authorization form (PDF)
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
