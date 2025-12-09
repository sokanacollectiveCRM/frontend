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
  type DoulaProfile,
  type UpdateProfileData,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import UserAvatar from '@/common/components/user/UserAvatar';

export default function ProfileTab() {
  const [profile, setProfile] = useState<DoulaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstname: '',
    lastname: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    business: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  // Sync form data when profile changes
  useEffect(() => {
    if (profile) {
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
        business: profile.business || '',
        bio: profile.bio || '',
      };
      setFormData(newFormData);
    }
  }, [profile]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getDoulaProfile();
      
      if (!data) {
        toast.error('No profile data found');
        setIsLoading(false);
        return;
      }
      
      // Set profile - this will trigger the useEffect to update formData
      setProfile(data);
      
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
        business: data.business || '',
        bio: data.bio || '',
      };
      setFormData(newFormData);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateDoulaProfile(formData);
      setProfile(updated);
      // Update form data with the response
      setFormData({
        firstname: updated.firstname || '',
        lastname: updated.lastname || '',
        address: updated.address || '',
        city: updated.city || '',
        state: updated.state || '',
        country: updated.country || '',
        zip_code: updated.zip_code !== undefined && updated.zip_code !== null && updated.zip_code !== -1
          ? (typeof updated.zip_code === 'number' ? updated.zip_code.toString() : String(updated.zip_code))
          : '',
        business: updated.business || '',
        bio: updated.bio || '',
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
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
        <Button onClick={fetchProfile} className='mt-4'>
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
            <UserAvatar
              fullName={`${profile.firstname} ${profile.lastname}`}
              className='h-20 w-20'
              src={profile.profile_picture || undefined}
            />
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
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='state'>State</Label>
                <Input
                  id='state'
                  name='state'
                  value={formData.state || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='zip_code'>Zip Code</Label>
                <Input
                  id='zip_code'
                  name='zip_code'
                  value={formData.zip_code || ''}
                  onChange={handleInputChange}
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
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='business'>Business Name</Label>
              <Input
                id='business'
                name='business'
                value={formData.business || ''}
                onChange={handleInputChange}
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
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={fetchProfile}>
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

