import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Separator } from "@/common/components/ui/separator";
import { Textarea } from "@/common/components/ui/textarea";
import { useUser } from '@/common/contexts/UserContext';
import useUserData from '@/common/hooks/useGetUserById';
import useSaveUser from "@/common/hooks/useSaveUser";
import { STATES } from "@/common/utils/50States";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import styled from 'styled-components';
import { z } from "zod";
import { accountFormSchema, profileFormSchema } from '../../utils/ZodSchemas';
import UserAvatar from "../Users/UserAvatar";
import { DatePicker } from "./DatePicker";

const TwoInputs = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;  
`

export const Profile = () => {

  const { user } = useUser();
  const { user: userDetails, isLoading, error } = useUserData(user?.id);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: "",
    },
  });
  
  function submitProfileForm(values: z.infer<typeof profileFormSchema>) {
    console.assert(user.id !== undefined, "the context has not provided this user's id");

    interface profileFormData {
      id: string; 
      bio?: string;
      profile_picture?: File | undefined;
    }    

    const userFormData: profileFormData = {
      id: user.id,
    };

    if(values.bio !== "") userFormData.bio = values.bio;
    if(values.profile_picture !== undefined) userFormData.profile_picture = values.profile_picture;

    useSaveUser(userFormData)
      .then(savedUser => {
        console.log('User saved successfully:', savedUser);
      })
      .catch(error => {
        console.log("user NOT saved successfully :(", error);
      });
  }

  if(isLoading) {
    return <div>Loading...</div>
  }

  if(error) {
    return <div>Error: {error}...</div>
  }

  console.log("MyAccountFormsLoaded", userDetails);
  
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
              profile_picture={userDetails?.profile_picture}
              fullName={`${userDetails?.firstname || ''} ${userDetails?.lastname || ''}`}
              />
          </CardContent>
          <CardHeader>
            <CardTitle>{`${userDetails?.firstname || ''} ${userDetails?.lastname || ''}`}</CardTitle>
            <CardDescription>{userDetails?.email || ''}</CardDescription>
          </CardHeader>
        </Card>
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
                    <Textarea placeholder={`Current: ${userDetails?.bio || ''}`} {...field} />
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

  const { user } = useUser();
  const { user: userDetails, isLoading, error } = useUserData(user?.id);

  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      dob: undefined,
    },
  });

  function submitAccountForm(values: z.infer<typeof accountFormSchema>) {
    console.assert(user.id !== undefined, "the context has not provided this user's id");

    interface accountFormData {
      id: string; 
      firstname?: string | undefined,
      lastname?: string | undefined,
      email?: string | undefined,
      address?: string | undefined,
      city?: string | undefined,
      state?: typeof STATES[0],
    }    

    const userFormData: accountFormData = {
      id: user.id,
    };

    console.log("inside submitAccountForm", values);
    if(values.firstname !== "") userFormData.firstname = values.firstname;
    if(values.lastname !== "") userFormData.lastname = values.lastname;
    if(values.email !== "") userFormData.email = values.email;
    if(values.address !== "") userFormData.address = values.address;
    if(values.city !== "") userFormData.city = values.city;
    // Complex code bc typescript but just saying if form's state is a valid state, add it to the form data to be updated on database
    if(STATES.some(state => state.value === values.state)) userFormData.state = STATES.find(state => state.value === values.state);
    
    console.log("inside submitAccountForm, userFormData is", userFormData);
    useSaveUser(userFormData)
      .then(savedUser => {
        console.log('User saved successfully:', savedUser);
      })
      .catch(error => {
        console.log("user NOT saved successfully :(", error);
      });
  }


  if(isLoading) {
    return <div>Loading...</div>
  }

  if(error) {
    return <div>Error: {error}...</div>
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
                name="firstname"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder={userDetails?.firstname || ''} {...field} />
                    </FormControl>
                    <FormMessage /> 
                  </FormItem>
                )}
              />  
              <FormField
                control={accountForm.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder={userDetails?.lastname || ''} {...field} />
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
                    <Input placeholder={userDetails?.email || ''} {...field} />
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
                      <Input placeholder={userDetails?.address || ''} {...field} />
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
                      <Input placeholder={userDetails?.city || ''} {...field} />
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
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={userDetails?.state || ''} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATES.map(state => (
                        <SelectItem key={state.value} value={state.label} className="cursor-pointer">
                          {state.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="dob"
              render={({ field }) => (
                <DatePicker
                  field={field}
                  label="Date of Birth"
                  placeholder="Select birth date"
                />
              )}
            />
            <Button type="submit" className='cursor-pointer mt-10'>Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};