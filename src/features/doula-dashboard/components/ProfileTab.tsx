import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { logFailure } from '@/utils/safeLog';
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
import { Checkbox } from '@/common/components/ui/checkbox';
import { Badge } from '@/common/components/ui/badge';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import {
  createDoulaAvailability,
  deleteDoulaAvailability,
  getDoulaAvailability,
  getDoulaProfile,
  updateDoulaAvailability,
  updateDoulaProfile,
  uploadDoulaProfilePicture,
  getDoulaDocuments,
  REQUIRED_DOULA_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  type DocumentsResponse,
  type DoulaProfile,
  type UpdateProfileData,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import { preloadProfileImage } from '@/common/components/user/UserAvatar';
import { ProfileImageInput } from '@/common/components/form/ProfileImageInput';
import { AlertCircle, Check, LoaderCircle, Save, X } from 'lucide-react';
import {
  ANOTHER_RACE_ETHNICITY,
  DOULA_RACE_ETHNICITY_OPTIONS,
  isDoulaRaceEthnicityComplete,
  normalizeRaceEthnicityFromApi,
  RACE_ETHNICITY_FIELD_LABEL,
  toggleRaceEthnicitySelection,
} from '@/features/doula-dashboard/doulaDemographics';
import { getDoulaSchedulingInfo } from '@/common/utils/doulaScheduling';

let cachedProfile: DoulaProfile | null = null;

const REQUIRED_TEXT_FIELDS = [
  'firstname',
  'lastname',
  'phone',
  'address',
  'city',
  'state',
  'country',
  'zip_code',
  'bio',
  'pronouns',
] as const satisfies ReadonlyArray<keyof UpdateProfileData>;

type RequiredTextField = (typeof REQUIRED_TEXT_FIELDS)[number];

const FIELD_LABELS: Record<RequiredTextField, string> = {
  firstname: 'First Name',
  lastname: 'Last Name',
  phone: 'Phone',
  address: 'Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  zip_code: 'Zip Code',
  bio: 'Bio',
  pronouns: 'Pronouns',
};

function normalizeDateOnly(value: string | null | undefined): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  return raw.includes('T') ? raw.slice(0, 10) : raw;
}

function profileToFormData(profile: DoulaProfile): UpdateProfileData {
  const schedulingInfo = getDoulaSchedulingInfo(profile);
  return {
    firstname: profile.firstname || '',
    lastname: profile.lastname || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    country: profile.country || '',
    zip_code:
      profile.zip_code !== undefined &&
      profile.zip_code !== null &&
      profile.zip_code !== -1
        ? typeof profile.zip_code === 'number'
          ? profile.zip_code.toString()
          : String(profile.zip_code)
        : '',
    bio: profile.bio || '',
    phone: profile.phone ?? profile.phone_number ?? '',
    scheduling_url: schedulingInfo.schedulingUrl || '',
    availability_status:
      profile.availability_status ||
      (schedulingInfo.availabilityStatus !== 'unknown'
        ? schedulingInfo.availabilityStatus
        : 'available'),
    availability_note:
      profile.availability_note || schedulingInfo.availabilityMessage || '',
    unavailable_from: normalizeDateOnly(
      profile.unavailable_from || schedulingInfo.unavailableFrom
    ),
    unavailable_until: normalizeDateOnly(
      profile.unavailable_until || schedulingInfo.unavailableUntil
    ),
    gender: profile.gender || '',
    pronouns: profile.pronouns || '',
    race_ethnicity: normalizeRaceEthnicityFromApi(profile.race_ethnicity),
    languages_other_than_english: Array.isArray(
      profile.languages_other_than_english
    )
      ? profile.languages_other_than_english.filter(
          (l): l is string => typeof l === 'string' && l.trim().length > 0
        )
      : [],
    race_ethnicity_other: profile.race_ethnicity_other || '',
    other_demographic_details: profile.other_demographic_details || '',
  };
}

const getMissingRequiredFields = (data: UpdateProfileData): string[] => {
  const missing = REQUIRED_TEXT_FIELDS.filter(
    (field) => !String(data[field] ?? '').trim()
  ).map((field) => FIELD_LABELS[field]);
  const langs = Array.isArray(data.languages_other_than_english)
    ? data.languages_other_than_english.filter(
        (l) => String(l).trim().length > 0
      )
    : [];
  if (langs.length === 0) {
    missing.push('Languages spoken (other than English)');
  }
  if (
    !isDoulaRaceEthnicityComplete(
      data.race_ethnicity,
      data.race_ethnicity_other
    )
  ) {
    if (
      !Array.isArray(data.race_ethnicity) ||
      data.race_ethnicity.length === 0
    ) {
      missing.push(RACE_ETHNICITY_FIELD_LABEL);
    } else {
      missing.push('Another race or ethnicity (please specify)');
    }
  }
  return missing;
};

function toStartOfDayIso(dateValue: string): string {
  return new Date(`${normalizeDateOnly(dateValue)}T00:00:00`).toISOString();
}

function toEndOfDayIso(dateValue: string): string {
  return new Date(`${normalizeDateOnly(dateValue)}T23:59:59.999`).toISOString();
}

export default function ProfileTab() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = searchParams.get('step') || 'about';
  const steps = [
    'about',
    'address',
    'documents',
    'scheduling',
    'demographics',
    'review',
  ];
  const stepIndex = Math.max(0, steps.indexOf(step));
  const hasLoadedForm = useRef(Boolean(cachedProfile));
  const lastAutosaved = useRef(
    cachedProfile ? JSON.stringify(profileToFormData(cachedProfile)) : ''
  );
  const latestFormData = useRef<UpdateProfileData>({});
  const autosaveInFlight = useRef(false);
  const [profile, setProfile] = useState<DoulaProfile | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [languageDraft, setLanguageDraft] = useState('');
  const [autosaveState, setAutosaveState] = useState<
    'saved' | 'saving' | 'error'
  >('saved');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [formData, setFormData] = useState<UpdateProfileData>(() =>
    cachedProfile
      ? profileToFormData(cachedProfile)
      : {
          firstname: '',
          lastname: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zip_code: '',
          bio: '',
          phone: '',
          scheduling_url: '',
          availability_status: 'available',
          availability_note: '',
          unavailable_from: '',
          unavailable_until: '',
          gender: '',
          pronouns: '',
          race_ethnicity: [],
          languages_other_than_english: [],
          race_ethnicity_other: '',
          other_demographic_details: '',
        }
  );
  const isDirty = JSON.stringify(formData) !== lastAutosaved.current;
  latestFormData.current = formData;

  useEffect(() => {
    // Reuse the in-memory profile when returning from another setup tab.
    // Refresh quietly so navigating between steps does not blank the form.
    fetchProfile(!cachedProfile);
  }, []);

  useEffect(() => {
    const targetId = location.hash.slice(1);
    if (!targetId || isLoading) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, isLoading]);

  const [documentsData, setDocumentsData] = useState<DocumentsResponse | null>(
    null
  );
  const [documentsLoading, setDocumentsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getDoulaDocuments()
      .then((data) => {
        if (mounted) setDocumentsData(data);
      })
      .catch(() => {
        if (mounted) setDocumentsData(null);
      })
      .finally(() => {
        if (mounted) setDocumentsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const saveProfileNow = useCallback(async () => {
    if (autosaveInFlight.current) return;
    autosaveInFlight.current = true;
    setAutosaveState('saving');
    try {
      while (JSON.stringify(latestFormData.current) !== lastAutosaved.current) {
        const latestSnapshot = JSON.stringify(latestFormData.current);
        const {
          availability_status: _availabilityStatus,
          availability_note: _availabilityNote,
          unavailable_from: _unavailableFrom,
          unavailable_until: _unavailableUntil,
          ...profilePayload
        } = latestFormData.current;
        const updated = await updateDoulaProfile(profilePayload, {
          autosave: true,
        });
        setProfile(updated);
        cachedProfile = updated;
        lastAutosaved.current = latestSnapshot;
      }
      setSavedAt(new Date());
      setAutosaveState('saved');
    } catch {
      setAutosaveState('error');
    } finally {
      autosaveInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedForm.current || isSaving) return;
    if (JSON.stringify(formData) === lastAutosaved.current) return;
    const timer = window.setTimeout(() => void saveProfileNow(), 700);
    return () => window.clearTimeout(timer);
  }, [formData, isSaving, saveProfileNow]);

  const fetchProfile = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const data = await getDoulaProfile();

      if (!data) {
        toast.error('No profile data found');
        if (showLoading) {
          setIsLoading(false);
        }
        return;
      }

      // Seed form state from the server only at load/save boundaries.
      setProfile(data);
      cachedProfile = data;

      // Also set formData directly as a backup to ensure it's populated
      const newFormData = profileToFormData(data);
      setFormData(newFormData);
      hasLoadedForm.current = true;
      lastAutosaved.current = JSON.stringify(newFormData);
    } catch (error: any) {
      logFailure('doula-dashboard', 'failed_to_fetch_profile');
      toast.error(error.message || 'Failed to load profile');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const refreshApprovalState = useCallback(async () => {
    try {
      const [freshProfile, freshDocuments] = await Promise.all([
        getDoulaProfile(),
        getDoulaDocuments(),
      ]);
      if (freshProfile) {
        setProfile(freshProfile);
        cachedProfile = freshProfile;
      }
      setDocumentsData(freshDocuments);
    } catch {
      // Keep the last known review state if a background refresh is offline.
    }
  }, []);

  useEffect(() => {
    void refreshApprovalState();
    const refreshOnReturn = () => {
      if (document.visibilityState === 'visible') {
        void refreshApprovalState();
      }
    };
    const refreshInterval = window.setInterval(
      () => void refreshApprovalState(),
      30_000
    );
    window.addEventListener('focus', refreshOnReturn);
    document.addEventListener('visibilitychange', refreshOnReturn);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshOnReturn);
      document.removeEventListener('visibilitychange', refreshOnReturn);
    };
  }, [refreshApprovalState]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.currentTarget;
    if (name) {
      setFormData((prev) =>
        prev[name as keyof UpdateProfileData] === value
          ? prev
          : { ...prev, [name]: value }
      );
      // Blur also captures browser autofill and flushes before step navigation.
      window.setTimeout(() => void saveProfileNow(), 0);
    }
  };

  const addLanguage = (raw: string) => {
    const next = raw.trim();
    if (!next) return;
    setFormData((prev) => {
      const current = Array.isArray(prev.languages_other_than_english)
        ? prev.languages_other_than_english
        : [];
      const exists = current.some(
        (l) => l.trim().toLowerCase() === next.toLowerCase()
      );
      if (exists) return prev;
      return {
        ...prev,
        languages_other_than_english: [...current, next],
      };
    });
  };

  const removeLanguage = (language: string) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.languages_other_than_english)
        ? prev.languages_other_than_english
        : [];
      return {
        ...prev,
        languages_other_than_english: current.filter((l) => l !== language),
      };
    });
  };

  const handleProfilePictureChange = async (file?: File) => {
    if (!file) return;
    setIsUploadingPicture(true);
    try {
      const updated = await uploadDoulaProfilePicture(file);
      if (updated.profile_picture) {
        await preloadProfileImage(updated.profile_picture);
      }
      setProfile(updated);
      cachedProfile = updated;
      toast.success('Profile picture updated');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload picture';
      toast.error(message);
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // If the user typed a language but didn't press Enter/Add, include it on submit.
    const pendingLanguage = languageDraft.trim();
    const nextFormData: UpdateProfileData =
      pendingLanguage.length > 0
        ? {
            ...formData,
            languages_other_than_english: [
              ...new Set([
                ...(formData.languages_other_than_english ?? [])
                  .map((l) => String(l).trim())
                  .filter(Boolean),
                pendingLanguage,
              ]),
            ],
          }
        : formData;

    if (pendingLanguage.length > 0) {
      setLanguageDraft('');
      setFormData(nextFormData);
    }

    setIsSaving(true);

    // Log the form data being submitted

    try {
      const {
        availability_status,
        availability_note,
        unavailable_from,
        unavailable_until,
        ...profilePayload
      } = nextFormData;

      const desiredStatus = availability_status || 'available';
      if (desiredStatus === 'unavailable') {
        if (!unavailable_from || !unavailable_until) {
          throw new Error(
            'Unavailable doulas must include both an unavailable start and end date.'
          );
        }
      }

      const updated = await updateDoulaProfile(profilePayload);
      lastAutosaved.current = JSON.stringify(nextFormData);

      const availabilitySnapshot = await getDoulaAvailability();
      const unavailableRecords = availabilitySnapshot.records.filter(
        (record) => record.availabilityStatus === 'unavailable'
      );

      if (desiredStatus === 'unavailable') {
        if (!unavailable_from || !unavailable_until) {
          throw new Error(
            'Unavailable doulas must include both an unavailable start and end date.'
          );
        }

        const availabilityPayload = {
          startAt: toStartOfDayIso(String(unavailable_from)),
          endAt: toEndOfDayIso(String(unavailable_until)),
          availabilityStatus: 'unavailable' as const,
          reason: availability_note || null,
        };

        if (unavailableRecords.length > 0) {
          await updateDoulaAvailability(
            unavailableRecords[0].id,
            availabilityPayload
          );
        } else {
          await createDoulaAvailability(availabilityPayload);
        }
      } else if (unavailableRecords.length > 0) {
        await Promise.all(
          unavailableRecords.map((record) => deleteDoulaAvailability(record.id))
        );
      }

      await fetchProfile(false);

      toast.success('Profile updated successfully');
    } catch (error: any) {
      logFailure('doula-dashboard', 'profiletab_failed_to_update_profile');
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!profile) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500'>Failed to load profile</p>
        <Button onClick={() => void fetchProfile()} className='mt-4'>
          Retry
        </Button>
      </div>
    );
  }

  const missingFields = getMissingRequiredFields(formData);
  const requiredByStep: Record<string, string[]> = {
    about: ['First Name', 'Last Name', 'Phone', 'Bio'],
    address: ['Address', 'City', 'State', 'Zip Code', 'Country'],
    demographics: [
      'Pronouns',
      'Languages spoken (other than English)',
      RACE_ETHNICITY_FIELD_LABEL,
      'Another race or ethnicity (please specify)',
    ],
  };
  const docs = documentsData?.documents ?? [];
  const docByType = new Map(docs.map((doc) => [doc.documentType, doc]));
  const backgroundCheckRequired =
    documentsData?.onboarding?.background_check_required ??
    Boolean(documentsData?.onboarding?.background_check_form_url);
  const missingDocuments = REQUIRED_DOULA_DOCUMENT_TYPES.filter((type) => {
    const doc = docByType.get(type);
    if (
      type === 'background_check' &&
      !backgroundCheckRequired &&
      (!doc || doc.status === 'missing')
    )
      return false;
    return !doc || doc.status === 'missing' || doc.status === 'rejected';
  });
  const ownItemsComplete =
    missingFields.length === 0 &&
    missingDocuments.length === 0 &&
    autosaveState === 'saved' &&
    !isSaving;
  const allRequiredDocumentsApproved = REQUIRED_DOULA_DOCUMENT_TYPES.every(
    (type) =>
      (type === 'background_check' && !backgroundCheckRequired) ||
      docByType.get(type)?.status === 'approved'
  );
  const profileRejected = profile.profile_review_status === 'rejected';
  const accountIsActive =
    String(profile.account_status).toLowerCase() === 'active' &&
    profile.profile_review_status === 'approved' &&
    ownItemsComplete &&
    allRequiredDocumentsApproved;
  const backgroundCheck = docByType.get('background_check');
  const backgroundCheckPending = backgroundCheckRequired
    ? Boolean(backgroundCheck && backgroundCheck.status !== 'approved')
    : Boolean(
        backgroundCheck &&
          backgroundCheck.status !== 'approved' &&
          backgroundCheck.status !== 'missing'
      );
  return (
    <div className='space-y-6'>
      <div
        role='status'
        aria-live='polite'
        className='rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5'
      >
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='space-y-1'>
            <p className='text-sm font-semibold text-slate-900'>
              Profile setup
            </p>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className={
                  profileRejected
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : accountIsActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : ownItemsComplete
                        ? 'border-blue-200 bg-blue-50 text-blue-800'
                        : 'border-amber-200 bg-amber-50 text-amber-900'
                }
              >
                {profileRejected
                  ? 'Profile changes requested'
                  : accountIsActive
                    ? 'Profile active'
                    : ownItemsComplete
                      ? 'Submitted for review'
                      : 'In progress'}
              </Badge>
              {backgroundCheckPending && (
                <span className='text-xs text-slate-600'>
                  Background check pending with HR
                </span>
              )}
            </div>
          </div>
          {profileRejected && (
            <div
              role='alert'
              className='w-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900'
            >
              <p className='font-semibold'>Profile information needs changes</p>
              <p className='mt-1'>
                {profile.profile_rejection_reason ||
                  'Please review and update your profile information.'}
              </p>
              <p className='mt-1 text-red-800'>
                Your edits save automatically and will be sent back for review.
              </p>
            </div>
          )}
          <div className='flex flex-wrap items-center gap-3'>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${autosaveState === 'error' ? 'text-red-700' : autosaveState === 'saved' && savedAt ? 'text-emerald-700' : 'text-slate-500'}`}
            >
              {autosaveState === 'saving' ? (
                <>
                  <LoaderCircle className='h-3.5 w-3.5 animate-spin' /> Saving…
                </>
              ) : autosaveState === 'error' ? (
                <>
                  <AlertCircle className='h-3.5 w-3.5' /> Save failed
                </>
              ) : savedAt ? (
                <>
                  <Check className='h-3.5 w-3.5' /> Saved{' '}
                  {savedAt.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </>
              ) : (
                'Autosave on'
              )}
            </span>
            {(isDirty || autosaveState === 'error') && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => void saveProfileNow()}
                disabled={autosaveState === 'saving'}
              >
                <Save className='mr-2 h-4 w-4' />{' '}
                {autosaveState === 'error' ? 'Retry save' : 'Save now'}
              </Button>
            )}
          </div>
        </div>
        {(missingFields.length > 0 || missingDocuments.length > 0) && (
          <div className='mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2'>
            {missingFields.length > 0 && (
              <section aria-label='Profile details to complete'>
                <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Profile details · {missingFields.length} left
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {missingFields.map((field) => (
                    <Badge
                      key={field}
                      variant='outline'
                      className='border-slate-200 bg-white font-normal text-slate-700'
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
            {missingDocuments.length > 0 && (
              <section aria-label='Required documents to upload'>
                <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Documents · {missingDocuments.length} left
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {missingDocuments.map((type) => (
                    <Badge
                      key={type}
                      variant='outline'
                      className='border-slate-200 bg-white font-normal text-slate-700'
                    >
                      {DOCUMENT_TYPE_LABELS[type]}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
        {missingFields.length === 0 && missingDocuments.length === 0 && (
          <p className='mt-3 border-t border-slate-200 pt-3 text-sm text-slate-600'>
            {profileRejected
              ? 'Update the requested profile information to return it to review.'
              : ownItemsComplete
                ? accountIsActive
                  ? 'Your profile is active. You can now use your doula dashboard.'
                  : 'Your profile is complete and in the admin review queue. We’ll email you when your account is active.'
                : 'Everything is complete. Saving your latest changes…'}
          </p>
        )}
      </div>
      <div id='about-you' className='scroll-mt-6'>
        <Card className={step === 'review' ? 'hidden' : ''}>
          <CardHeader className={step === 'about' ? '' : 'hidden'}>
            <div className='flex items-center gap-4'>
              <ProfileImageInput
                id='profile-picture-upload'
                accept='image/jpeg,image/png'
                showAvatar
                currentImageUrl={profile.profile_picture || undefined}
                fullName={`${profile.firstname} ${profile.lastname}`}
                isUploading={isUploadingPicture}
                onFileChange={handleProfilePictureChange}
              />
              <div>
                <CardTitle className='text-2xl'>
                  {profile.firstname} {profile.lastname}
                </CardTitle>
                <p className='text-sm text-gray-600 mt-1'>{profile.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-5 [&_input]:min-h-11 [&_input]:text-base [&_textarea]:text-base [&_select]:min-h-11 [&_select]:text-base [&_label]:text-base'>
            {(requiredByStep[step] ?? []).some((field) =>
              missingFields.includes(field)
            ) && (
              <p
                role='alert'
                className='rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950'
              >
                Still needed:{' '}
                {(requiredByStep[step] ?? [])
                  .filter((field) => missingFields.includes(field))
                  .join(', ')}
              </p>
            )}
            <form onSubmit={handleSubmit} className='space-y-6'>
              {step === 'about' && (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='firstname'>First Name</Label>
                      <Input
                        id='firstname'
                        name='firstname'
                        value={formData.firstname || ''}
                        onChange={handleInputChange}
                        required
                        {...{
                          onBlur: handleInputBlur,
                          autoComplete: 'given-name',
                        }}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='lastname'>Last Name</Label>
                      <Input
                        id='lastname'
                        name='lastname'
                        value={formData.lastname || ''}
                        onChange={handleInputChange}
                        required
                        {...{
                          onBlur: handleInputBlur,
                          autoComplete: 'family-name',
                        }}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Phone</Label>
                    <Input
                      id='phone'
                      name='phone'
                      type='tel'
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      autoComplete='tel'
                      required
                    />
                    {missingFields.includes('Phone') && (
                      <p className='text-sm text-destructive'>
                        Add a phone number to continue.
                      </p>
                    )}
                    <p className='text-xs text-muted-foreground'>
                      A number HR can reach you at.
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='bio'>Bio</Label>
                    <Textarea
                      id='bio'
                      name='bio'
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      rows={5}
                      placeholder='Tell us about yourself...'
                      required
                    />
                  </div>
                </>
              )}
              {step === 'address' && (
                <>
                  <div id='address' className='scroll-mt-6 space-y-2'>
                    <Label htmlFor='address'>Address</Label>
                    <Input
                      id='address'
                      name='address'
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      required
                      onBlur={handleInputBlur}
                      autoComplete='street-address'
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='city'>City</Label>
                      <Input
                        id='city'
                        name='city'
                        value={formData.city || ''}
                        onChange={handleInputChange}
                        required
                        onBlur={handleInputBlur}
                        autoComplete='address-level2'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='state'>State</Label>
                      <Input
                        id='state'
                        name='state'
                        value={formData.state || ''}
                        onChange={handleInputChange}
                        required
                        onBlur={handleInputBlur}
                        autoComplete='address-level1'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='zip_code'>Zip Code</Label>
                      <Input
                        id='zip_code'
                        name='zip_code'
                        value={formData.zip_code || ''}
                        onChange={handleInputChange}
                        required
                        onBlur={handleInputBlur}
                        autoComplete='postal-code'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='country'>Country</Label>
                    <Input
                      id='country'
                      name='country'
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      required
                      onBlur={handleInputBlur}
                      autoComplete='country-name'
                    />
                  </div>
                </>
              )}
              <div
                id='scheduling'
                className={`scroll-mt-6 rounded-lg border border-border bg-muted/30 p-4 space-y-4 ${step === 'scheduling' ? '' : 'hidden'}`}
              >
                <div>
                  <h3 className='text-sm font-semibold text-foreground'>
                    Scheduling
                  </h3>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Families in the contract stage will use this information to
                    book time with you.
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='scheduling_url'>Scheduling Link</Label>
                  <Input
                    id='scheduling_url'
                    name='scheduling_url'
                    type='url'
                    value={formData.scheduling_url || ''}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder='https://calendly.com/your-link'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='availability_status'>
                      Availability Status
                    </Label>
                    <select
                      id='availability_status'
                      name='availability_status'
                      value={formData.availability_status || 'available'}
                      onChange={handleInputChange}
                      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    >
                      <option value='available'>Available</option>
                      <option value='unavailable'>Unavailable</option>
                    </select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='availability_note'>Availability Note</Label>
                    <Input
                      id='availability_note'
                      name='availability_note'
                      value={formData.availability_note || ''}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder='Optional note for admins and families'
                    />
                  </div>
                </div>

                {(formData.availability_status || 'available') ===
                  'unavailable' && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='unavailable_from'>Unavailable From</Label>
                      <Input
                        id='unavailable_from'
                        name='unavailable_from'
                        type='date'
                        value={
                          formData.unavailable_from
                            ? String(formData.unavailable_from).slice(0, 10)
                            : ''
                        }
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='unavailable_until'>
                        Unavailable Until
                      </Label>
                      <Input
                        id='unavailable_until'
                        name='unavailable_until'
                        type='date'
                        value={
                          formData.unavailable_until
                            ? String(formData.unavailable_until).slice(0, 10)
                            : ''
                        }
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div
                id='demographics'
                className={`scroll-mt-6 space-y-4 rounded-lg border border-border bg-muted/30 p-4 ${step === 'demographics' ? '' : 'hidden'}`}
              >
                <div>
                  <h3 className='text-sm font-semibold text-foreground'>
                    Demographics
                  </h3>
                  <p className='text-xs text-muted-foreground mt-1'>
                    All fields in this section are required unless noted.
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='gender'>Gender</Label>
                    <Input
                      id='gender'
                      name='gender'
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder='e.g. Woman, Man, Non-binary'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='pronouns'>
                      Pronouns
                      <span className='text-destructive'> *</span>
                    </Label>
                    <Input
                      id='pronouns'
                      name='pronouns'
                      value={formData.pronouns || ''}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder='e.g. she/her, he/him, they/them'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-3'>
                  <Label className='text-base'>
                    Languages spoken (other than English)
                    <span className='text-destructive'> *</span>
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    Add at least one language. Press Enter or click Add after
                    typing.
                  </p>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                    <Input
                      value={languageDraft}
                      onChange={(e) => setLanguageDraft(e.target.value)}
                      onBlur={() => {
                        addLanguage(languageDraft);
                        setLanguageDraft('');
                        window.setTimeout(() => void saveProfileNow(), 0);
                      }}
                      placeholder='Type a language (e.g. Spanish)'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addLanguage(languageDraft);
                          setLanguageDraft('');
                        }
                      }}
                    />
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={() => {
                        addLanguage(languageDraft);
                        setLanguageDraft('');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {(formData.languages_other_than_english ?? []).map(
                      (lang) => (
                        <Badge
                          key={lang}
                          variant='secondary'
                          className='flex items-center gap-1'
                        >
                          <span>{lang}</span>
                          <button
                            type='button'
                            className='ml-1 rounded-sm hover:bg-background/40'
                            onClick={() => removeLanguage(lang)}
                            aria-label={`Remove ${lang}`}
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div className='space-y-3'>
                  <Label className='text-base'>
                    {RACE_ETHNICITY_FIELD_LABEL}
                    <span className='text-destructive'> *</span>
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    Select all that apply.
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {DOULA_RACE_ETHNICITY_OPTIONS.map((opt) => {
                      const checked = (formData.race_ethnicity ?? []).includes(
                        opt.value
                      );
                      return (
                        <label
                          key={opt.value}
                          className='flex items-start gap-2 rounded-md border border-transparent px-1 py-1 hover:bg-background/80 cursor-pointer'
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                race_ethnicity: toggleRaceEthnicitySelection(
                                  prev.race_ethnicity ?? [],
                                  opt.value
                                ),
                              }));
                            }}
                            className='mt-0.5'
                          />
                          <span className='text-sm leading-tight'>
                            {opt.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {(formData.race_ethnicity ?? []).includes(
                    ANOTHER_RACE_ETHNICITY
                  ) && (
                    <div className='space-y-2 pt-1'>
                      <Label htmlFor='race_ethnicity_other'>
                        Please specify
                      </Label>
                      <Input
                        id='race_ethnicity_other'
                        name='race_ethnicity_other'
                        value={formData.race_ethnicity_other || ''}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder='Your race or ethnicity'
                      />
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='other_demographic_details'>
                    Other demographic details
                  </Label>
                  <Textarea
                    id='other_demographic_details'
                    name='other_demographic_details'
                    value={formData.other_demographic_details || ''}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    rows={3}
                    placeholder='Anything else you would like to share (optional)'
                  />
                </div>
              </div>

              <div className='flex justify-between gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={stepIndex === 0}
                  onClick={() =>
                    step === 'scheduling'
                      ? navigate('/doula-dashboard/documents')
                      : setSearchParams(
                          { step: steps[stepIndex - 1] },
                          { replace: true }
                        )
                  }
                >
                  Back
                </Button>
                {step === 'scheduling' && (
                  <Button type='submit' variant='outline' disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Save scheduling'}
                  </Button>
                )}
                <Button
                  type='button'
                  disabled={isSaving}
                  onClick={() => {
                    const missingForStep = (requiredByStep[step] ?? []).filter(
                      (field) => missingFields.includes(field)
                    );
                    if (missingForStep.length) {
                      toast.error(
                        `Complete required fields: ${missingForStep.join(', ')}`
                      );
                      return;
                    }
                    if (step === 'address') {
                      navigate('/doula-dashboard/documents#required-documents');
                      return;
                    }
                    if (step === 'scheduling') {
                      setSearchParams(
                        { step: 'demographics' },
                        { replace: true }
                      );
                      return;
                    }
                    if (stepIndex < steps.length - 1)
                      setSearchParams(
                        { step: steps[stepIndex + 1] },
                        { replace: true }
                      );
                  }}
                >
                  {step === 'address'
                    ? 'Continue to Documents & credentials'
                    : step === 'scheduling'
                      ? 'Continue to Demographics'
                      : stepIndex < steps.length - 1
                        ? `Continue to ${['Address', 'Documents & credentials', 'Scheduling', 'Demographics', 'Review'][stepIndex]}`
                        : 'Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card
        id='profile-review-bottom'
        tabIndex={-1}
        className={`scroll-mt-6 border-slate-200 outline-none ${step === 'review' ? '' : 'hidden'}`}
      >
        <CardHeader>
          <CardTitle>Review your information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <p className='text-sm text-slate-700'>
            Review each section. Your changes save automatically.
          </p>
          <div className='space-y-2 text-base'>
            <div className='flex items-center justify-between gap-3 border-b py-2'>
              <span>
                About you · {formData.firstname} {formData.lastname} ·{' '}
                {formData.phone || 'Phone needed'}
              </span>
              <Button
                type='button'
                variant='link'
                onClick={() =>
                  setSearchParams({ step: 'about' }, { replace: true })
                }
              >
                Edit
              </Button>
            </div>
            <div className='flex items-center justify-between gap-3 border-b py-2'>
              <span>
                Address · {formData.address}, {formData.city}, {formData.state}{' '}
                {formData.zip_code}
              </span>
              <Button
                type='button'
                variant='link'
                onClick={() =>
                  setSearchParams({ step: 'address' }, { replace: true })
                }
              >
                Edit
              </Button>
            </div>
            <div className='flex items-center justify-between gap-3 border-b py-2'>
              <span>
                Documents ·{' '}
                {missingDocuments.length
                  ? `Still needed: ${missingDocuments.map((type) => DOCUMENT_TYPE_LABELS[type]).join(', ')}`
                  : 'Required documents uploaded'}
              </span>
              <Button
                type='button'
                variant='link'
                onClick={() =>
                  navigate('/doula-dashboard/documents#required-documents')
                }
              >
                Edit
              </Button>
            </div>
            <div className='flex items-center justify-between gap-3 border-b py-2'>
              <span>
                Scheduling · {formData.scheduling_url || 'No link added'}
              </span>
              <Button
                type='button'
                variant='link'
                onClick={() =>
                  setSearchParams({ step: 'scheduling' }, { replace: true })
                }
              >
                Edit
              </Button>
            </div>
            <div className='flex items-center justify-between gap-3 py-2'>
              <span>
                Demographics ·{' '}
                {missingFields.includes('Pronouns')
                  ? 'Needs attention'
                  : 'Complete'}
              </span>
              <Button
                type='button'
                variant='link'
                onClick={() =>
                  setSearchParams({ step: 'demographics' }, { replace: true })
                }
              >
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
