import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
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
import { Camera } from 'lucide-react';

interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
}

interface ProfileTabProps {
  onProfileStatusChange?: (status: ProfileCompletionStatus) => void;
}

let cachedProfile: DoulaProfile | null = null;

const REQUIRED_PROFILE_FIELDS = [
  'firstname',
  'lastname',
  'address',
  'city',
  'state',
  'country',
  'zip_code',
  'bio',
] as const satisfies ReadonlyArray<keyof UpdateProfileData>;

type RequiredProfileField = (typeof REQUIRED_PROFILE_FIELDS)[number];

const FIELD_LABELS: Record<RequiredProfileField, string> = {
  firstname: 'First Name',
  lastname: 'Last Name',
  address: 'Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  zip_code: 'Zip Code',
  bio: 'Bio',
};

const getMissingRequiredFields = (data: Partial<UpdateProfileData>): string[] =>
  REQUIRED_PROFILE_FIELDS.filter((field) => !String(data[field] ?? '').trim()).map(
    (field) => FIELD_LABELS[field]
  );

export default function ProfileTab({ onProfileStatusChange }: ProfileTabProps) {
  const [profile, setProfile] = useState<DoulaProfile | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstname: '',
    lastname: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile(!cachedProfile);
  }, []);

  // Sync form data when profile changes (but only if formData hasn't been manually updated)
  // This prevents resetting form data immediately after a successful update
  useEffect(() => {
    if (profile && !isSaving) {
      const newFormData = {
        firstname: profile.firstname || '',
        lastname: profile.lastname || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        zip_code: profile.zip_code !== undefined && profile.zip_code !== null && profile.zip_code !== -1
          ? (typeof profile.zip_code === 'number' ? profile.zip_code.toString() : String(profile.zip_code))
          : '',
        bio: profile.bio || '',
      };
      // Only update if the form data is different (to avoid unnecessary re-renders)
      setFormData((prev) => {
        const hasChanges = Object.keys(newFormData).some(
          (key) => prev[key as keyof UpdateProfileData] !== newFormData[key as keyof typeof newFormData]
        );
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
      const newFormData = {
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        zip_code: data.zip_code !== undefined && data.zip_code !== null && data.zip_code !== -1
          ? (typeof data.zip_code === 'number' ? data.zip_code.toString() : String(data.zip_code))
          : '',
        bio: data.bio || '',
      };
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
    const missingFields = getMissingRequiredFields(formData);
    if (missingFields.length > 0) {
      toast.error(`Complete all required fields: ${missingFields.join(', ')}`);
      onProfileStatusChange?.({ isComplete: false, missingFields });
      return;
    }

    setIsSaving(true);
    
    // Log the form data being submitted
    console.log('ProfileTab - Submitting form data:', JSON.stringify(formData, null, 2));
    
    try {
      const updated = await updateDoulaProfile(formData);
      console.log('ProfileTab - Update response received:', JSON.stringify(updated, null, 2));
      
      // Update profile state - this will trigger the useEffect to sync formData
      setProfile(updated);
      cachedProfile = updated;
      
      // Also update form data directly with the response to ensure consistency
      const updatedFormData = {
        firstname: updated.firstname || '',
        lastname: updated.lastname || '',
        address: updated.address || '',
        city: updated.city || '',
        state: updated.state || '',
        country: updated.country || '',
        zip_code: updated.zip_code !== undefined && updated.zip_code !== null && updated.zip_code !== -1
          ? (typeof updated.zip_code === 'number' ? updated.zip_code.toString() : String(updated.zip_code))
          : '',
        bio: updated.bio || '',
      };
      
      console.log('ProfileTab - Setting form data to:', JSON.stringify(updatedFormData, null, 2));
      setFormData(updatedFormData);
      onProfileStatusChange?.({ isComplete: true, missingFields: [] });
      
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

