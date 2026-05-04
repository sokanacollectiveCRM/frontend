import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Badge } from '@/common/components/ui/badge';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import {
  getDoulaProfile,
  updateDoulaProfile,
  uploadDoulaProfilePicture,
  type DoulaProfile,
  type UpdateProfileData,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import UserAvatar from '@/common/components/user/UserAvatar';
import { Camera, X } from 'lucide-react';
import {
  ANOTHER_RACE_ETHNICITY,
  DOULA_RACE_ETHNICITY_OPTIONS,
  isDoulaRaceEthnicityComplete,
  normalizeRaceEthnicityFromApi,
  RACE_ETHNICITY_FIELD_LABEL,
  toggleRaceEthnicitySelection,
} from '../doulaDemographics';
import type { ProfileCompletionStatus } from '../doulaDashboardTypes';

interface ProfileTabProps {
  onProfileStatusChange?: (status: ProfileCompletionStatus) => void;
}

let cachedProfile: DoulaProfile | null = null;

const REQUIRED_TEXT_FIELDS = [
  'firstname',
  'lastname',
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
  address: 'Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  zip_code: 'Zip Code',
  bio: 'Bio',
  pronouns: 'Pronouns',
};

function profileToFormData(profile: DoulaProfile): UpdateProfileData {
  return {
    firstname: profile.firstname || '',
    lastname: profile.lastname || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    country: profile.country || '',
    zip_code:
      profile.zip_code !== undefined && profile.zip_code !== null && profile.zip_code !== -1
        ? typeof profile.zip_code === 'number'
          ? profile.zip_code.toString()
          : String(profile.zip_code)
        : '',
    bio: profile.bio || '',
    gender: profile.gender || '',
    pronouns: profile.pronouns || '',
    race_ethnicity: normalizeRaceEthnicityFromApi(profile.race_ethnicity),
    languages_other_than_english: Array.isArray(profile.languages_other_than_english)
      ? profile.languages_other_than_english.filter(
          (l): l is string => typeof l === 'string' && l.trim().length > 0
        )
      : [],
    race_ethnicity_other: profile.race_ethnicity_other || '',
    other_demographic_details: profile.other_demographic_details || '',
  };
}

const getMissingRequiredFields = (data: UpdateProfileData): string[] => {
  const missing = REQUIRED_TEXT_FIELDS.filter((field) => !String(data[field] ?? '').trim()).map(
    (field) => FIELD_LABELS[field]
  );
  const langs = Array.isArray(data.languages_other_than_english)
    ? data.languages_other_than_english.filter((l) => String(l).trim().length > 0)
    : [];
  if (langs.length === 0) {
    missing.push('Languages spoken (other than English)');
  }
  if (!isDoulaRaceEthnicityComplete(data.race_ethnicity, data.race_ethnicity_other)) {
    if (!Array.isArray(data.race_ethnicity) || data.race_ethnicity.length === 0) {
      missing.push(RACE_ETHNICITY_FIELD_LABEL);
    } else {
      missing.push('Another race or ethnicity (please specify)');
    }
  }
  return missing;
};

export default function ProfileTab({ onProfileStatusChange }: ProfileTabProps) {
  const [profile, setProfile] = useState<DoulaProfile | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [languageDraft, setLanguageDraft] = useState('');
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstname: '',
    lastname: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    bio: '',
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
    if (profile && !isSaving) {
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
  }, [profile, isSaving]);

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
      onProfileStatusChange?.({
        isComplete: missingFields.length === 0,
        missingFields,
      });
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      toast.error(error.message || 'Failed to load profile');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      const exists = current.some((l) => l.trim().toLowerCase() === next.toLowerCase());
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

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPicture(true);
    e.target.value = '';
    try {
      const updated = await uploadDoulaProfilePicture(file);
      setProfile(updated);
      cachedProfile = updated;
      toast.success('Profile picture updated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload picture';
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
                ...((formData.languages_other_than_english ?? []).map((l) => String(l).trim()).filter(Boolean)),
                pendingLanguage,
              ]),
            ],
          }
        : formData;

    if (pendingLanguage.length > 0) {
      setLanguageDraft('');
      setFormData(nextFormData);
    }

    const missingFields = getMissingRequiredFields(nextFormData);
    if (missingFields.length > 0) {
      toast.error(`Complete all required fields: ${missingFields.join(', ')}`);
      onProfileStatusChange?.({ isComplete: false, missingFields });
      return;
    }

    setIsSaving(true);
    
    // Log the form data being submitted
    console.log('ProfileTab - Submitting form data:', JSON.stringify(nextFormData, null, 2));
    
    try {
      const updated = await updateDoulaProfile(nextFormData);
      console.log('ProfileTab - Update response received:', JSON.stringify(updated, null, 2));
      
      // Update profile state - this will trigger the useEffect to sync formData
      setProfile(updated);
      cachedProfile = updated;
      
      // Also update form data directly with the response to ensure consistency
      const updatedFormData = profileToFormData(updated);
      
      console.log('ProfileTab - Setting form data to:', JSON.stringify(updatedFormData, null, 2));
      setFormData(updatedFormData);
      const stillMissing = getMissingRequiredFields(updatedFormData);
      onProfileStatusChange?.({
        isComplete: stillMissing.length === 0,
        missingFields: stillMissing,
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('ProfileTab - Failed to update profile:', error);
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

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <label
              htmlFor='profile-picture-upload'
              className='relative flex flex-col items-center gap-2 cursor-pointer group'
            >
              <div className='relative rounded-full ring-2 ring-border group-hover:ring-primary transition-all'>
                <UserAvatar
                  fullName={`${profile.firstname} ${profile.lastname}`}
                  className='h-24 w-24'
                  profile_picture={profile.profile_picture || undefined}
                />
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-full transition-colors ${
                    profile.profile_picture
                      ? 'bg-transparent group-hover:bg-black/50'
                      : 'bg-black/30 group-hover:bg-black/40'
                  }`}
                >
                  {isUploadingPicture ? (
                    <span className='text-white text-xs font-medium'>Uploading...</span>
                  ) : (
                    <Camera
                      className={`h-8 w-8 text-white ${
                        profile.profile_picture ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                      }`}
                    />
                  )}
                </div>
              </div>
              <span className='text-sm font-medium text-primary group-hover:underline'>
                {profile.profile_picture ? 'Change photo' : 'Click to upload photo'}
              </span>
              <input
                id='profile-picture-upload'
                type='file'
                accept='image/jpeg,image/jpg,image/png,image/webp'
                className='sr-only'
                onChange={handleProfilePictureChange}
                disabled={isUploadingPicture}
              />
            </label>
            <div>
              <CardTitle className='text-2xl'>
                {profile.firstname} {profile.lastname}
              </CardTitle>
              <p className='text-sm text-gray-600 mt-1'>{profile.email}</p>
              <p className='text-xs text-gray-500 mt-1'>
                Account Status: <span className='font-medium'>{profile.account_status}</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstname'>First Name</Label>
                <Input
                  id='firstname'
                  name='firstname'
                  value={formData.firstname || ''}
                  onChange={handleInputChange}
                  required
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
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Input
                id='address'
                name='address'
                value={formData.address || ''}
                onChange={handleInputChange}
                required
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
              />
            </div>

            <div className='space-y-4 rounded-lg border border-border bg-muted/30 p-4'>
              <div>
                <h3 className='text-sm font-semibold text-foreground'>Demographics</h3>
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
                  Add at least one language. Press Enter or click Add after typing.
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
                  {(formData.languages_other_than_english ?? []).map((lang) => (
                    <Badge key={lang} variant='secondary' className='flex items-center gap-1'>
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
                  ))}
                </div>
              </div>

              <div className='space-y-3'>
                <Label className='text-base'>
                  {RACE_ETHNICITY_FIELD_LABEL}
                  <span className='text-destructive'> *</span>
                </Label>
                <p className='text-xs text-muted-foreground'>Select all that apply.</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {DOULA_RACE_ETHNICITY_OPTIONS.map((opt) => {
                    const checked = (formData.race_ethnicity ?? []).includes(opt.value);
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
                        <span className='text-sm leading-tight'>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
                {(formData.race_ethnicity ?? []).includes(ANOTHER_RACE_ETHNICITY) && (
                  <div className='space-y-2 pt-1'>
                    <Label htmlFor='race_ethnicity_other'>Please specify</Label>
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
                <Label htmlFor='other_demographic_details'>Other demographic details</Label>
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

            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                name='bio'
                value={formData.bio || ''}
                onChange={handleInputChange}
                rows={6}
                placeholder='Tell us about yourself...'
                required
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => void fetchProfile(false)}>
                Cancel
              </Button>
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
