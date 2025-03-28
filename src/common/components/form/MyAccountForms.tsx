import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "../../../components/ui/textarea";
import { profileFormSchema, accountFormSchema } from '../../utils/ZodSchemas';

export const Profile = () => {
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: "",
    },
  });
  
  function submitProfileForm(values: z.infer<typeof profileFormSchema>) {
    console.log(values); //for now just prints to console
  }
  
  return (
    <Card className="min-h-96 py-5">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>This is how others see you</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <Separator />
        <Form {...profileForm} className="flex-1">
          <form onSubmit={profileForm.handleSubmit(submitProfileForm)} className='flex flex-col flex-1 py-5 space-y-4'>
            <FormField 
              control={profileForm.control}
              name="profilePicture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <FormControl>
                    <Input 
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        console.log(e);
                        const file: File | undefined = e.target.files?.[0];
                        field.onChange(file || undefined);
                      }}
                      className="cursor-pointer"
                      />
                  </FormControl>
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
                    <Textarea placeholder="Tell us a little bit about yourself" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />
            <Button type="submit" className='cursor-pointer mt-10'>Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};