import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Separator } from "@/common/components/ui/separator";
import { Textarea } from "@/common/components/ui/textarea";
import { useUser } from '@/common/hooks/user/useUser';
import saveUser from '@/common/utils/saveUser';
import { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import UserAvatar from "../../../common/components/user/UserAvatar";

interface ProfileFormValues {
  bio?: string;
  profile_picture?: File;
}

export const Profile = () => {
  const { user, isLoading } = useUser();

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      bio: "",
    },
  });

  const submitProfileForm = async (values: ProfileFormValues) => {
    if (!user?.id) return;

    const formData = new FormData();
    formData.append('id', user.id);
    formData.append('bio', values.bio ?? '');
    formData.append('profile_picture', values.profile_picture ?? '');

    try {
      const savedUser = await saveUser(formData);
      console.log("User saved successfully:", savedUser);
    } catch (err) {
      console.error("User NOT saved successfully:", err);
    }
  };

  // might need to add an error check here if user context isn't working
  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="min-h-96 py-5">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>This is how others see you</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <Card>
          <CardContent>
            <UserAvatar 
              profile_picture={user?.profile_picture}
              fullName={`${user?.firstname || ''} ${user?.lastname || ''}`}
              className={'h-35 w-35'}
            />
          </CardContent>
          <CardHeader>
            <CardTitle>{`${user?.firstname || ''} ${user?.lastname || ''}`}</CardTitle>
            <CardDescription>{user?.email || ''}</CardDescription>
          </CardHeader>
        </Card>
        <Separator />

        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(submitProfileForm)} className="flex flex-col flex-1 py-5 space-y-4">
            <FormField 
              control={profileForm.control}
              name="profile_picture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <FormControl>
                    <Input 
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        field.onChange(file || undefined);
                      }}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pb-1">Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder={`Current: ${user?.bio || ''}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="cursor-pointer mt-10">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};