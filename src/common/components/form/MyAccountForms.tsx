import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { profileFormSchema, accountFormSchema } from '../../utils/ZodSchemas';
import styled from 'styled-components';

const TwoInputs = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  
`

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

export const Account = () => {
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      state: ""    
    },
  });

  function submitAccountForm(values: z.infer<typeof accountFormSchema>) {
    console.log(values); //for now just prints to console
  }

  return (
    <Card className="min-h-96 py-5">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <Separator />
        <Form {...accountForm} classname="flex-1">
          <form onSubmit={accountForm.handleSubmit(submitAccountForm)} className="flex flex-col flex-1 py-5 space-y-4">
            <TwoInputs>
              <FormField
                control={accountForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane" {...field} />
                    </FormControl>
                    <FormMessage /> 
                  </FormItem>
                )}
              />  
              <FormField
                control={accountForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage /> 
                  </FormItem>
                )}
              />  
            </TwoInputs>
            <FormField 
              control={accountForm.control}
              name="email"
              render={({ field }) => (
                <FormItem >
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="janeSmith@example.com" {...field} />
                  </FormControl>
                  <FormMessage /> 
                </FormItem>
              )}
            />
            <TwoInputs>
              <FormField
                control={accountForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage /> 
                  </FormItem>
                )}
              />  
              <FormField
                control={accountForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage /> 
                  </FormItem>
                )}
              />  
            </TwoInputs>
            <FormField 
              control={accountForm.control}
              name="state"
              render={({ field }) => (
                <FormItem >
                  <FormLabel>State</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};