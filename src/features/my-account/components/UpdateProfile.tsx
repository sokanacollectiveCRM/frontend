import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { logFailure } from '@/utils/safeLog';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/common/components/ui/form';
import { Separator } from '@/common/components/ui/separator';
import { Textarea } from '@/common/components/ui/textarea';
import UserAvatar, {
  preloadProfileImage,
} from '@/common/components/user/UserAvatar';
import { useUser } from '@/common/hooks/user/useUser';
import saveUser from '@/common/utils/saveUser';
import { ProfileImageInput } from '@/common/components/form/ProfileImageInput';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ProfileFormValues {
  bio?: string;
  profile_picture?: File;
}

export const Profile = () => {
  const { user, isLoading, checkAuth, setUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [heldPreviewUrl, setHeldPreviewUrl] = useState<string | null>(null);
  const [isWaitingForRemoteImage, setIsWaitingForRemoteImage] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      bio: '',
    },
  });
  const selectedPicture = profileForm.watch('profile_picture');
  const isUploadingPicture =
    isWaitingForRemoteImage ||
    (isSaving && selectedPicture instanceof File);
  const displayPicture = heldPreviewUrl || user?.profile_picture;

  useEffect(() => {
    if (!(selectedPicture instanceof File)) return;
    const previewUrl = URL.createObjectURL(selectedPicture);
    setHeldPreviewUrl(previewUrl);
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedPicture]);

  useEffect(() => {
    if (!user || isSaving || isWaitingForRemoteImage) return;
    profileForm.reset({
      bio: user.bio || '',
      profile_picture: undefined,
    });
  }, [user, profileForm, isSaving, isWaitingForRemoteImage]);

  const submitProfileForm = async (values: ProfileFormValues) => {
    if (!user?.id) return;

    const formData = new FormData();
    formData.append('id', user.id);
    formData.append('bio', values.bio ?? '');
    if (values.profile_picture instanceof File) {
      formData.append('profile_picture', values.profile_picture);
    }

    setIsSaving(true);
    try {
      const savedUser = await saveUser(formData);
      const uploadedPictureUrl =
        typeof savedUser?.profile_picture === 'string' &&
        savedUser.profile_picture.trim().length > 0
          ? savedUser.profile_picture
          : null;

      setUser((prev) => (prev ? { ...prev, ...savedUser } : savedUser));

      if (values.profile_picture instanceof File && uploadedPictureUrl) {
        setIsWaitingForRemoteImage(true);
        await preloadProfileImage(uploadedPictureUrl);
      }

      toast.success('Changes saved.');
      await checkAuth({ silent: true });
      if (uploadedPictureUrl) {
        setUser((prev) =>
          prev ? { ...prev, profile_picture: uploadedPictureUrl } : prev
        );
        setHeldPreviewUrl(null);
      }
      profileForm.reset({
        bio: values.bio ?? '',
        profile_picture: undefined,
      });
    } catch (err) {
      logFailure('my-account', 'user_not_saved_successfully');
      toast.error(
        err instanceof Error ? err.message : 'Could not save changes.'
      );
    } finally {
      setIsSaving(false);
      setIsWaitingForRemoteImage(false);
    }
  };

  return (
    <div>
      <LoadingOverlay isLoading={isLoading} />
      <Card className='min-h-96 py-5'>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how others see you</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col flex-1'>
          <Card>
            <CardContent>
              <div className='relative w-fit'>
                <UserAvatar
                  profile_picture={displayPicture}
                  fullName={`${user?.firstname || ''} ${user?.lastname || ''}`}
                  className={'h-35 w-35'}
                />
                {isUploadingPicture ? (
                  <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/50'>
                    <Loader2 className='h-8 w-8 animate-spin text-white' />
                  </div>
                ) : null}
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle>{`${user?.firstname || ''} ${user?.lastname || ''}`}</CardTitle>
              <CardDescription>{user?.email || ''}</CardDescription>
            </CardHeader>
          </Card>
          <Separator />

          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(submitProfileForm)}
              className='flex flex-col flex-1 py-5 space-y-4'
            >
              <FormField
                control={profileForm.control}
                name='profile_picture'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <ProfileImageInput
                        accept='image/jpeg,image/png,image/webp'
                        selectedFile={field.value}
                        currentImageUrl={user?.profile_picture}
                        isUploading={isUploadingPicture}
                        onFileChange={(file) => field.onChange(file)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name='bio'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='pb-1'>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Tell others a bit about yourself'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='cursor-pointer mt-10'
                disabled={isUploadingPicture}
              >
                {isSaving ? (
                  <Loader2 className='h-4 w-4 animate-spin mx-auto' />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
