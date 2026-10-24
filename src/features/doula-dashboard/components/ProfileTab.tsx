import DocumentsTab from '@/features/doula-dashboard/components/DocumentsTab';
import CertificationsList from '@/features/doula-dashboard/components/CertificationsList';
import UserAvatar from '@/common/components/user/UserAvatar';
import {
  formatPhone,
  isValidPhone,
  PHONE_ERROR,
} from '@/features/doula-dashboard/phone';
import {
  hasCertificationDetails,
  isValidExpirationDate,
} from '@/features/doula-dashboard/certifications';
import CertificationsFields from '@/features/doula-dashboard/components/CertificationsFields';
import { useState, useEffect, useRef } from 'react';
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
  getDoulaDocuments,
  submitDoulaProfile,
  updateDoulaAvailability,
  updateDoulaProfile,
  uploadDoulaProfilePicture,
  type DoulaProfile,
  type UpdateProfileData,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import { preloadProfileImage } from '@/common/components/user/UserAvatar';
import { ProfileImageInput } from '@/common/components/form/ProfileImageInput';
import { X, Loader2 } from 'lucide-react';
import {
  ANOTHER_RACE_ETHNICITY,
  DOULA_RACE_ETHNICITY_OPTIONS,
  normalizeRaceEthnicityFromApi,
  RACE_ETHNICITY_FIELD_LABEL,
  toggleRaceEthnicitySelection,
} from '@/features/doula-dashboard/doulaDemographics';
import type { ProfileCompletionStatus } from '@/features/doula-dashboard/doulaDashboardTypes';
import { getDoulaSchedulingInfo } from '@/common/utils/doulaScheduling';

interface ProfileTabProps {
  onProfileStatusChange?: (status: ProfileCompletionStatus) => void;
  initialStep?: 'documents';
}

let cachedProfile: DoulaProfile | null = null;
const PROFILE_STEPS = [
  'About you',
  'Address',
  'Certifications',
  'Documents',
  'Scheduling',
  'Demographics',
  'Review',
] as const;

const REQUIRED_TEXT_FIELDS = [
  'firstname',
  'lastname',
  'address',
  'city',
  'state',
  'country',
  'zip_code',
  'bio',
] as const satisfies ReadonlyArray<keyof UpdateProfileData>;

type RequiredTextField = (typeof REQUIRED_TEXT_FIELDS)[number];

const FIELD_LABELS: Record<RequiredTextField, string> = {
  firstname: 'First Name',
  lastname: 'Last Name',
  address: 'Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  zip_code: 'Zip Code',
  bio: 'Bio',
};

function normalizeDateOnly(value: string | null | undefined): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  return raw.includes('T') ? raw.slice(0, 10) : raw;
}

function profileToFormData(profile: DoulaProfile): UpdateProfileData {
  const schedulingInfo = getDoulaSchedulingInfo(profile);
  return {
    phone_number: formatPhone(profile.phone_number || ''),
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
    certifications: (profile.certifications ?? []).filter(
      hasCertificationDetails
    ),
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
  if (!isValidPhone(data.phone_number)) missing.push('Phone number');
  return missing;
};

function toStartOfDayIso(dateValue: string): string {
  return new Date(`${normalizeDateOnly(dateValue)}T00:00:00`).toISOString();
}

function toEndOfDayIso(dateValue: string): string {
  return new Date(`${normalizeDateOnly(dateValue)}T23:59:59.999`).toISOString();
}

export default function ProfileTab({
  onProfileStatusChange,
  initialStep,
}: ProfileTabProps) {
  const [profile, setProfile] = useState<DoulaProfile | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [activeStep, setActiveStep] = useState(
    initialStep === 'documents' ? 3 : 0
  );
  const [isEditing, setIsEditing] = useState(initialStep === 'documents');
  const editingInitialized = useRef(false);
  const [stepDirection, setStepDirection] = useState(1);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const savingRef = useRef(false);
  const [checkingDocuments, setCheckingDocuments] = useState(true);

  useEffect(() => {
    let generation = 0;
    let mounted = true;
    const refreshDocuments = async () => {
      const request = ++generation;
      setCheckingDocuments(true);
      try {
        const data = await getDoulaDocuments();
        if (mounted && request === generation)
          setHasTrainingCertificate(
            data.documents.some(
              (doc) =>
                doc.documentType === 'training_certificate' &&
                ['uploaded', 'approved'].includes(doc.status)
            )
          );
      } catch {
        if (mounted && request === generation) setHasTrainingCertificate(false);
      } finally {
        if (mounted && request === generation) setCheckingDocuments(false);
      }
    };
    void refreshDocuments();
    window.addEventListener('doula-documents-changed', refreshDocuments);
    window.addEventListener('focus', refreshDocuments);
    return () => {
      mounted = false;
      window.removeEventListener('doula-documents-changed', refreshDocuments);
      window.removeEventListener('focus', refreshDocuments);
    };
  }, []);
  const [hasTrainingCertificate, setHasTrainingCertificate] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [languageDraft, setLanguageDraft] = useState('');
  const [formData, setFormData] = useState<UpdateProfileData>({
    phone_number: '',
    firstname: '',
    lastname: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    bio: '',
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
  });

  useEffect(() => {
    fetchProfile(!cachedProfile);
  }, []);

  // Sync form data when profile changes (but only if formData hasn't been manually updated)
  // This prevents resetting form data immediately after a successful update
  useEffect(() => {
    if (profile) {
      const newFormData = profileToFormData(profile);
      setFormData((prev) => {
        const keys = Object.keys(newFormData) as (keyof UpdateProfileData)[];
        const hasChanges = keys.some((key) => {
          const next = newFormData[key];
          const cur = prev[key];
          if (key === 'race_ethnicity') {
            const a = Array.isArray(next) ? next : [];
            const b = Array.isArray(cur) ? cur : [];
            return a.length !== b.length || a.some((v, i) => v !== b[i]);
          }
          return next !== cur;
        });
        return hasChanges ? newFormData : prev;
      });
    }
  }, [profile]);

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

      // Set profile - this will trigger the useEffect to update formData
      setProfile(data);
      cachedProfile = data;

      // Also set formData directly as a backup to ensure it's populated
      const newFormData = profileToFormData(data);
      setFormData(newFormData);
      const missingFields = getMissingRequiredFields(newFormData);
      if (!editingInitialized.current) {
        setIsEditing(initialStep === 'documents' || missingFields.length > 0);
        editingInitialized.current = true;
      }
      onProfileStatusChange?.({
        isComplete: missingFields.length === 0,
        missingFields,
      });
    } catch (error: any) {
      logFailure('doula-dashboard', 'failed_to_fetch_profile');
      toast.error(error.message || 'Failed to load profile');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (savingRef.current) return;
    const submittingForReview =
      (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') ===
      'submit-profile';
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
        : { ...formData };

    if (pendingLanguage.length > 0) {
      setLanguageDraft('');
      setFormData(nextFormData);
    }

    // An untouched add row is optional; partially entered certifications still
    // need a name. Normalize here for both saving and submitting for review.
    nextFormData.certifications = (nextFormData.certifications ?? [])
      .map((entry) => ({
        ...entry,
        name: entry.name.trim(),
        issuingOrganization: entry.issuingOrganization.trim(),
        expiration_date: entry.expiration_date || null,
        no_expiration: entry.no_expiration === true,
      }))
      .filter(hasCertificationDetails);
    if (nextFormData.certifications.some((entry) => !entry.name)) {
      toast.error('Enter a name for each certification or remove the entry.');
      return;
    }

    if (
      nextFormData.certifications.some(
        (entry) =>
          (entry.expiration_date &&
            !isValidExpirationDate(entry.expiration_date)) ||
          (entry.no_expiration && entry.expiration_date)
      )
    ) {
      toast.error(
        'Enter a valid certification expiration date or select No expiration.'
      );
      return;
    }

    if (!isValidPhone(nextFormData.phone_number)) {
      setActiveStep(0);
      setPhoneError(true);
      toast.error(PHONE_ERROR);
      onProfileStatusChange?.({
        isComplete: false,
        missingFields: getMissingRequiredFields(nextFormData),
      });
      return;
    }
    nextFormData.phone_number = nextFormData.phone_number.replace(/-/g, '');
    const missingFields = getMissingRequiredFields(nextFormData);
    if (missingFields.length > 0) {
      setActiveStep(
        ['First Name', 'Last Name', 'Bio'].some((field) =>
          missingFields.includes(field)
        )
          ? 0
          : 1
      );
      toast.error(`Complete all required fields: ${missingFields.join(', ')}`);
      onProfileStatusChange?.({ isComplete: false, missingFields });
      return;
    }

    savingRef.current = true;
    setIsSubmittingReview(submittingForReview);
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

      await updateDoulaProfile(profilePayload);

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

      if (submittingForReview) await submitDoulaProfile();
      await fetchProfile(false);
      setIsEditing(false);

      toast.success(
        submittingForReview
          ? 'Profile submitted. Confirmation and admin review emails have been queued.'
          : 'Profile updated successfully'
      );
    } catch (error: any) {
      logFailure('doula-dashboard', 'profiletab_failed_to_update_profile');
      toast.error(error.message || 'Failed to update profile');
    } finally {
      savingRef.current = false;
      setIsSubmittingReview(false);
      setIsSaving(false);
    }
  };

  const isMissing = (field: RequiredTextField) =>
    !String(formData[field] ?? '').trim();
  const requiredStyle = (field: RequiredTextField) =>
    isMissing(field) ? 'border-red-600 focus-visible:ring-red-600' : '';
  const changeStep = (next: number) => {
    setStepDirection(next >= activeStep ? 1 : -1);
    setActiveStep(next);
    document
      .querySelector('main[aria-label="Doula dashboard content"]')
      ?.scrollTo?.({ top: 0 });
  };
  const nextStep = () => {
    const fields: RequiredTextField[] =
      activeStep === 0
        ? ['firstname', 'lastname', 'bio']
        : activeStep === 1
          ? ['address', 'city', 'state', 'zip_code', 'country']
          : [];
    if (activeStep === 0 && !isValidPhone(formData.phone_number)) {
      setPhoneError(true);
      toast.error(PHONE_ERROR);
      document.getElementById('phone_number')?.focus();
      return;
    }
    const missing = fields.filter(isMissing);
    if (missing.length) {
      toast.error(
        `Complete all required fields: ${missing.map((field) => FIELD_LABELS[field]).join(', ')}`
      );
      document.getElementById(missing[0])?.focus();
      return;
    }
    changeStep(Math.min(activeStep + 1, PROFILE_STEPS.length - 1));
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

  return (
    <form
      id='doula-profile-form'
      noValidate
      onSubmit={handleSubmit}
      className='mx-auto max-w-5xl space-y-4'
    >
      <div className='rounded-xl border bg-card p-4 sm:p-5 space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='min-w-0'>
            <h2 className='text-lg font-semibold'>Your doula profile</h2>
            <p className='break-words text-sm text-muted-foreground'>
              {profile.firstname} {profile.lastname} · {profile.email}
            </p>
          </div>
          <span className='text-sm font-medium text-muted-foreground'>
            Step {activeStep + 1} of {PROFILE_STEPS.length}
          </span>
        </div>
        {profile.profile_submitted_at &&
          profile.profile_review_status !== 'changes_requested' && (
            <Badge className='w-fit'>Submitted for review</Badge>
          )}
        <ol
          aria-label='Profile steps'
          className='grid grid-cols-7 gap-1 sm:gap-2'
        >
          {PROFILE_STEPS.map((label, index) => (
            <li key={label}>
              <button
                type='button'
                aria-label={`${label} step`}
                aria-current={activeStep === index ? 'step' : undefined}
                aria-controls={`profile-panel-${index}`}
                disabled={isSaving}
                onClick={() => changeStep(index)}
                className={`flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs sm:text-sm ${activeStep === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
              >
                <span className='flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-semibold'>
                  {index + 1}
                </span>
                <span className='hidden sm:block'>{label}</span>
              </button>
            </li>
          ))}
        </ol>
        <div
          role='progressbar'
          aria-label='Profile step progress'
          aria-valuemin={1}
          aria-valuemax={PROFILE_STEPS.length}
          aria-valuenow={activeStep + 1}
          className='h-1.5 overflow-hidden rounded-full bg-muted'
        >
          <div
            className='h-full bg-primary transition-[width] duration-200 motion-reduce:transition-none'
            style={{
              width: `${((activeStep + 1) / PROFILE_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
      <Card className='gap-4 py-4 sm:py-5'>
        <CardHeader>
          <CardTitle id='profile-step-heading' role='heading' aria-level={3}>
            {PROFILE_STEPS[activeStep]}
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            {activeStep === 3
              ? 'Upload and manage your documents here. Document changes are saved immediately.'
              : !isEditing
                ? 'Viewing your saved profile. Select Edit profile to make changes.'
                : activeStep < 2
                  ? 'Required fields are marked in red until completed.'
                  : activeStep === 6
                    ? 'Review your details, save your changes, and submit when you are ready.'
                    : 'Optional. Your edits stay in place as you move between steps.'}
          </p>
        </CardHeader>
        <CardContent>
          <div
            id='profile-panel-0'
            hidden={activeStep !== 0}
            className={
              activeStep === 0
                ? `animate-in fade-in duration-200 motion-reduce:animate-none ${stepDirection > 0 ? 'slide-in-from-right-2' : 'slide-in-from-left-2'}`
                : ''
            }
          >
            {isEditing ? (
              <>
                <section className='space-y-4' aria-label='Basic info'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='firstname'
                        className={isMissing('firstname') ? 'text-red-600' : ''}
                      >
                        First Name
                      </Label>
                      <Input
                        id='firstname'
                        aria-invalid={isMissing('firstname')}
                        aria-describedby={
                          isMissing('firstname')
                            ? 'firstname-required'
                            : undefined
                        }
                        className={requiredStyle('firstname')}
                        name='firstname'
                        value={formData.firstname || ''}
                        onChange={handleInputChange}
                        required
                      />
                      {isMissing('firstname') && (
                        <p
                          id='firstname-required'
                          className='text-sm text-red-600'
                        >
                          {FIELD_LABELS.firstname} is required
                        </p>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='lastname'
                        className={isMissing('lastname') ? 'text-red-600' : ''}
                      >
                        Last Name
                      </Label>
                      <Input
                        id='lastname'
                        aria-invalid={isMissing('lastname')}
                        aria-describedby={
                          isMissing('lastname')
                            ? 'lastname-required'
                            : undefined
                        }
                        className={requiredStyle('lastname')}
                        name='lastname'
                        value={formData.lastname || ''}
                        onChange={handleInputChange}
                        required
                      />
                      {isMissing('lastname') && (
                        <p
                          id='lastname-required'
                          className='text-sm text-red-600'
                        >
                          {FIELD_LABELS.lastname} is required
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='phone_number'
                      className={
                        !isValidPhone(formData.phone_number)
                          ? 'text-red-600'
                          : ''
                      }
                    >
                      Phone number
                    </Label>
                    <Input
                      id='phone_number'
                      name='phone_number'
                      type='tel'
                      inputMode='numeric'
                      autoComplete='tel-national'
                      placeholder='555-555-5555'
                      required
                      pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
                      value={formData.phone_number || ''}
                      aria-invalid={!isValidPhone(formData.phone_number)}
                      className={
                        !isValidPhone(formData.phone_number)
                          ? 'border-red-600 focus-visible:ring-red-600'
                          : ''
                      }
                      aria-describedby={
                        phoneError || !isValidPhone(formData.phone_number)
                          ? 'phone-error'
                          : 'phone-help'
                      }
                      onChange={(e) => {
                        e.target.setCustomValidity('');
                        const value = formatPhone(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          phone_number: value,
                        }));
                        if (phoneError) setPhoneError(!isValidPhone(value));
                      }}
                      onBlur={() =>
                        setPhoneError(!isValidPhone(formData.phone_number))
                      }
                      onInvalid={(e) => {
                        e.currentTarget.setCustomValidity(PHONE_ERROR);
                        setPhoneError(true);
                      }}
                    />
                    {(phoneError || !isValidPhone(formData.phone_number)) && (
                      <p
                        id='phone-error'
                        role='alert'
                        className='text-sm text-red-600'
                      >
                        {PHONE_ERROR}
                      </p>
                    )}
                    <p
                      id='phone-help'
                      className='text-sm text-muted-foreground'
                    >
                      Visible to you and Sokana admins only.
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='font-semibold'>About me</h3>
                    <Label
                      htmlFor='bio'
                      className={isMissing('bio') ? 'text-red-600' : ''}
                    >
                      About me (bio)
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Write in first person, for example &quot;I’m a birth and
                      postpartum doula who…&quot;. Families will see this.
                    </p>
                    <Textarea
                      id='bio'
                      aria-invalid={isMissing('bio')}
                      aria-describedby={
                        isMissing('bio') ? 'bio-required' : undefined
                      }
                      className={requiredStyle('bio')}
                      name='bio'
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder='Tell us about yourself...'
                      required
                    />
                    {isMissing('bio') && (
                      <p id='bio-required' className='text-sm text-red-600'>
                        {FIELD_LABELS.bio} is required
                      </p>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <dl className='grid grid-cols-1 gap-5 text-sm sm:grid-cols-2'>
                <div>
                  <dt className='font-semibold'>Name</dt>
                  <dd>
                    {profile.firstname} {profile.lastname}
                  </dd>
                </div>
                <div>
                  <dt className='font-semibold'>Phone number</dt>
                  <dd
                    className={
                      !isValidPhone(profile.phone_number) ? 'text-red-600' : ''
                    }
                  >
                    {formatPhone(profile.phone_number || '') || PHONE_ERROR}
                  </dd>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Visible to you and Sokana admins only.
                  </p>
                </div>
                <div className='sm:col-span-2'>
                  <dt className='font-semibold'>About me</dt>
                  <dd className='mt-1 whitespace-pre-wrap'>
                    {profile.bio || 'Bio is required'}
                  </dd>
                </div>
              </dl>
            )}
          </div>
          <div
            id='profile-panel-1'
            hidden={activeStep !== 1}
            className={
              activeStep === 1
                ? `animate-in fade-in duration-200 motion-reduce:animate-none ${stepDirection > 0 ? 'slide-in-from-right-2' : 'slide-in-from-left-2'}`
                : ''
            }
          >
            {isEditing ? (
              <>
                <section className='space-y-4' aria-label='Address fields'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='address'
                      className={isMissing('address') ? 'text-red-600' : ''}
                    >
                      Address
                    </Label>
                    <Input
                      id='address'
                      aria-invalid={isMissing('address')}
                      aria-describedby={
                        isMissing('address') ? 'address-required' : undefined
                      }
                      className={requiredStyle('address')}
                      name='address'
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      required
                    />
                    {isMissing('address') && (
                      <p id='address-required' className='text-sm text-red-600'>
                        {FIELD_LABELS.address} is required
                      </p>
                    )}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='city'
                        className={isMissing('city') ? 'text-red-600' : ''}
                      >
                        City
                      </Label>
                      <Input
                        id='city'
                        aria-invalid={isMissing('city')}
                        aria-describedby={
                          isMissing('city') ? 'city-required' : undefined
                        }
                        className={requiredStyle('city')}
                        name='city'
                        value={formData.city || ''}
                        onChange={handleInputChange}
                        required
                      />
                      {isMissing('city') && (
                        <p id='city-required' className='text-sm text-red-600'>
                          {FIELD_LABELS.city} is required
                        </p>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='state'
                        className={isMissing('state') ? 'text-red-600' : ''}
                      >
                        State
                      </Label>
                      <Input
                        id='state'
                        aria-invalid={isMissing('state')}
                        aria-describedby={
                          isMissing('state') ? 'state-required' : undefined
                        }
                        className={requiredStyle('state')}
                        name='state'
                        value={formData.state || ''}
                        onChange={handleInputChange}
                        required
                      />
                      {isMissing('state') && (
                        <p id='state-required' className='text-sm text-red-600'>
                          {FIELD_LABELS.state} is required
                        </p>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='zip_code'
                        className={isMissing('zip_code') ? 'text-red-600' : ''}
                      >
                        Zip Code
                      </Label>
                      <Input
                        id='zip_code'
                        aria-invalid={isMissing('zip_code')}
                        aria-describedby={
                          isMissing('zip_code')
                            ? 'zip_code-required'
                            : undefined
                        }
                        className={requiredStyle('zip_code')}
                        name='zip_code'
                        value={formData.zip_code || ''}
                        onChange={handleInputChange}
                        required
                      />
                      {isMissing('zip_code') && (
                        <p
                          id='zip_code-required'
                          className='text-sm text-red-600'
                        >
                          {FIELD_LABELS.zip_code} is required
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='country'
                      className={isMissing('country') ? 'text-red-600' : ''}
                    >
                      Country
                    </Label>
                    <Input
                      id='country'
                      aria-invalid={isMissing('country')}
                      aria-describedby={
                        isMissing('country') ? 'country-required' : undefined
                      }
                      className={requiredStyle('country')}
                      name='country'
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      required
                    />
                    {isMissing('country') && (
                      <p id='country-required' className='text-sm text-red-600'>
                        {FIELD_LABELS.country} is required
                      </p>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <dl className='grid grid-cols-1 gap-5 text-sm sm:grid-cols-2'>
                {[
                  ['Address', profile.address],
                  ['City', profile.city],
                  ['State', profile.state],
                  ['Zip Code', profile.zip_code],
                  ['Country', profile.country],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className='font-semibold'>{label}</dt>
                    <dd className={!value ? 'text-red-600' : ''}>
                      {value || `${label} is required`}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div
            id='profile-panel-2'
            hidden={activeStep !== 2}
            className={
              activeStep === 2
                ? `animate-in fade-in duration-200 motion-reduce:animate-none ${stepDirection > 0 ? 'slide-in-from-right-2' : 'slide-in-from-left-2'}`
                : ''
            }
          >
            {isEditing ? (
              <>
                <div className='space-y-5'>
                  <div className='space-y-3'>
                    <h3 className='font-semibold'>Profile photo</h3>
                    <ProfileImageInput
                      id='profile-picture-upload'
                      accept='image/jpeg,image/jpg,image/png,image/webp'
                      showAvatar
                      currentImageUrl={profile.profile_picture || undefined}
                      fullName={`${profile.firstname} ${profile.lastname}`}
                      isUploading={isUploadingPicture}
                      onFileChange={handleProfilePictureChange}
                    />
                  </div>
                  <CertificationsFields
                    onOpenDocuments={() => changeStep(3)}
                    savedValue={profile.certifications}
                    value={formData.certifications ?? []}
                    onChange={(certifications) =>
                      setFormData((prev) => ({ ...prev, certifications }))
                    }
                  />
                </div>
              </>
            ) : (
              <div className='space-y-5'>
                <div className='flex items-center gap-3'>
                  <UserAvatar
                    fullName={`${profile.firstname} ${profile.lastname}`}
                    profile_picture={profile.profile_picture || undefined}
                    className='h-16 w-16'
                  />
                  <p className='text-sm'>Profile photo</p>
                </div>
                <section aria-label='Saved certifications'>
                  <CertificationsList
                    certifications={profile.certifications ?? []}
                  />
                </section>
              </div>
            )}
          </div>
          <div id='profile-panel-3' hidden={activeStep !== 3}>
            {activeStep === 3 && <DocumentsTab embedded />}
          </div>
          <div
            id='profile-panel-4'
            hidden={activeStep !== 4}
            className={
              activeStep === 4
                ? `animate-in fade-in duration-200 motion-reduce:animate-none ${stepDirection > 0 ? 'slide-in-from-right-2' : 'slide-in-from-left-2'}`
                : ''
            }
          >
            {isEditing ? (
              <>
                <div className='space-y-4'>
                  <div className='mt-4 space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='scheduling_url'>Scheduling Link</Label>
                      <Input
                        id='scheduling_url'
                        name='scheduling_url'
                        type='url'
                        value={formData.scheduling_url || ''}
                        onChange={handleInputChange}
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
                        <Label htmlFor='availability_note'>
                          Availability Note
                        </Label>
                        <Input
                          id='availability_note'
                          name='availability_note'
                          value={formData.availability_note || ''}
                          onChange={handleInputChange}
                          placeholder='Optional note for admins and families'
                        />
                      </div>
                    </div>

                    {(formData.availability_status || 'available') ===
                      'unavailable' && (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='unavailable_from'>
                            Unavailable From
                          </Label>
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
                                ? String(formData.unavailable_until).slice(
                                    0,
                                    10
                                  )
                                : ''
                            }
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <dl className='grid grid-cols-1 gap-5 text-sm sm:grid-cols-2'>
                {[
                  ['Scheduling link', profile.scheduling_url],
                  ['Availability', profile.availability_status],
                  ['Availability note', profile.availability_note],
                  ['Unavailable from', profile.unavailable_from],
                  ['Unavailable until', profile.unavailable_until],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className='font-semibold'>{label}</dt>
                    <dd className='break-words'>{value || 'Not provided'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div
            id='profile-panel-5'
            hidden={activeStep !== 5}
            className={
              activeStep === 5
                ? `animate-in fade-in duration-200 motion-reduce:animate-none ${stepDirection > 0 ? 'slide-in-from-right-2' : 'slide-in-from-left-2'}`
                : ''
            }
          >
            {isEditing ? (
              <>
                <div className='space-y-4'>
                  <div className='mt-4 space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='gender'>Gender</Label>
                        <Input
                          id='gender'
                          name='gender'
                          value={formData.gender || ''}
                          onChange={handleInputChange}
                          placeholder='e.g. Woman, Man, Non-binary'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='pronouns'>Pronouns</Label>
                        <Input
                          id='pronouns'
                          name='pronouns'
                          value={formData.pronouns || ''}
                          onChange={handleInputChange}
                          placeholder='e.g. she/her, he/him, they/them'
                        />
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <Label className='text-base'>
                        Languages spoken (other than English)
                      </Label>
                      <p className='text-xs text-muted-foreground'>
                        Optionally add languages. Press Enter or click Add after
                        typing.
                      </p>
                      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                        <Input
                          value={languageDraft}
                          onChange={(e) => setLanguageDraft(e.target.value)}
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
                      </Label>
                      <p className='text-xs text-muted-foreground'>
                        Select all that apply.
                      </p>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {DOULA_RACE_ETHNICITY_OPTIONS.map((opt) => {
                          const checked = (
                            formData.race_ethnicity ?? []
                          ).includes(opt.value);
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
                                    race_ethnicity:
                                      toggleRaceEthnicitySelection(
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
                        rows={3}
                        placeholder='Anything else you would like to share (optional)'
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <dl className='grid grid-cols-1 gap-5 text-sm sm:grid-cols-2'>
                {[
                  ['Gender', profile.gender],
                  ['Pronouns', profile.pronouns],
                  [
                    'Languages',
                    profile.languages_other_than_english?.join(', '),
                  ],
                  ['Race / ethnicity', profile.race_ethnicity?.join(', ')],
                  [
                    'Other demographic details',
                    profile.other_demographic_details,
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className='font-semibold'>{label}</dt>
                    <dd>{value || 'Not provided'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div
            id='profile-panel-6'
            hidden={activeStep !== 6}
            className={
              activeStep === 6
                ? `animate-in fade-in duration-200 motion-reduce:animate-none ${stepDirection > 0 ? 'slide-in-from-right-2' : 'slide-in-from-left-2'}`
                : ''
            }
          >
            <div className='space-y-5'>
              <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                <div>
                  <dt className='font-semibold'>Name</dt>
                  <dd>
                    {formData.firstname} {formData.lastname}
                  </dd>
                </div>
                <div>
                  <dt className='font-semibold'>Phone number</dt>
                  <dd
                    className={
                      !isValidPhone(formData.phone_number) ? 'text-red-600' : ''
                    }
                  >
                    {formatPhone(formData.phone_number || '') || PHONE_ERROR}
                  </dd>
                </div>
                <div>
                  <dt className='font-semibold'>Address</dt>
                  <dd>
                    {[
                      formData.address,
                      formData.city,
                      formData.state,
                      formData.zip_code,
                      formData.country,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Address is required'}
                  </dd>
                </div>
                <div>
                  <dt className='font-semibold'>About me</dt>
                  <dd className='whitespace-pre-wrap'>
                    {formData.bio || 'Bio is required'}
                  </dd>
                </div>
              </dl>
              <Card className='gap-3 py-4'>
                <CardHeader className='pb-3'>
                  <CardTitle>Complete your profile</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {profile.profile_review_status === 'changes_requested' && (
                    <div
                      role='alert'
                      className='rounded-md border border-amber-300 bg-amber-50 p-4 space-y-2'
                    >
                      <h3 className='font-semibold'>Changes requested</h3>
                      <p className='whitespace-pre-wrap'>
                        {profile.profile_review_reason}
                      </p>
                      <p>
                        Correct the items above, replace or remove any rejected
                        documents in the Documents step, then select Resubmit
                        for review. Your profile approval remains pending. Your
                        dashboard tools remain available.
                      </p>
                    </div>
                  )}

                  <details>
                    <summary className='cursor-pointer text-sm font-medium'>
                      Profile setup instructions
                    </summary>
                    <ol className='mt-3 list-decimal pl-5 space-y-2 text-sm'>
                      <li>
                        Enter your first and last name, phone number, full
                        address (including city, state, ZIP code and country),
                        and bio below.
                      </li>
                      <li>
                        Open the Documents step and upload your Doula training
                        certificate. Liability insurance and Illinois Medicaid
                        documents are optional for general approval.
                      </li>
                      <li>
                        Return here and select Mark profile complete. This saves
                        your changes and emails the Sokana team for review.
                      </li>
                      <li>
                        Your account is active. You can log hours, record birth
                        outcomes, and use your assigned-work tools while your
                        profile and documents are pending review.
                      </li>
                    </ol>
                  </details>
                  {(!profile.profile_submitted_at ||
                    profile.profile_review_status === 'changes_requested') && (
                    <p className='text-sm' role='status'>
                      {getMissingRequiredFields(formData).length > 0
                        ? `Still needed: ${getMissingRequiredFields(formData)
                            .map((field) => field.replace(/_/g, ' '))
                            .join(', ')}.`
                        : 'Required profile fields are complete.'}{' '}
                      {hasTrainingCertificate
                        ? 'Training certificate uploaded.'
                        : 'Training certificate still needed in Documents.'}
                    </p>
                  )}
                  {profile.profile_submitted_at &&
                  profile.profile_review_status !== 'changes_requested' ? (
                    <Badge>
                      {profile.profile_review_status === 'approved'
                        ? 'Profile approved'
                        : 'Submitted — waiting for admin review'}
                    </Badge>
                  ) : (
                    <>
                      <Button
                        type='submit'
                        name='action'
                        value='submit-profile'
                        aria-busy={isSaving}
                        disabled={
                          isSaving ||
                          !(
                            !profile.profile_submitted_at ||
                            profile.profile_review_status ===
                              'changes_requested'
                          ) ||
                          checkingDocuments ||
                          !hasTrainingCertificate ||
                          getMissingRequiredFields(formData).length > 0
                        }
                      >
                        {isSaving && (
                          <Loader2
                            className='mr-2 h-4 w-4 animate-spin'
                            aria-hidden='true'
                          />
                        )}
                        {isSaving
                          ? isSubmittingReview
                            ? 'Submitting for review...'
                            : 'Saving...'
                          : checkingDocuments
                            ? 'Checking documents...'
                            : profile.profile_review_status ===
                                'changes_requested'
                              ? 'Resubmit for review'
                              : 'Mark profile complete'}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className='sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3 shadow-sm'>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={activeStep === 0 || isSaving}
            onClick={() => changeStep(activeStep - 1)}
          >
            Back
          </Button>
          {activeStep < PROFILE_STEPS.length - 1 && (
            <Button
              type='button'
              disabled={isSaving}
              onClick={() =>
                isEditing ? nextStep() : changeStep(activeStep + 1)
              }
            >
              Next
            </Button>
          )}
        </div>
        <div className='flex gap-2'>
          {isEditing ? (
            <>
              <Button
                type='button'
                variant='outline'
                disabled={isSaving}
                onClick={() => {
                  setFormData(profileToFormData(profile));
                  setLanguageDraft('');
                  setPhoneError(false);
                  setActiveStep(0);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button type='button' onClick={() => setIsEditing(true)}>
              Edit profile
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
