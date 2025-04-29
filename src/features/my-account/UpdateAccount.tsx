import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Separator } from "@/common/components/ui/separator";
import { useUser } from '@/common/hooks/user/useUser';
import { STATES } from "@/common/utils/50States";
import { useForm } from "react-hook-form";
import styled from 'styled-components';

import saveUser from '@/common/utils/saveUser';

const TwoInputs = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;  
`

interface AccountFormValues {
  firstname?: string;
  lastname?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
}

export const Account = () => {
  const { user, isLoading } = useUser();

 const accountForm = useForm<AccountFormValues>({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      address: "",
      city: "",
      state: STATES[0].value,
    },
  });

  const submitAccountForm = async (values: AccountFormValues) => {
    if (!user?.id) return;

    const userFormData = new FormData();
    userFormData.append("id", user.id);
    userFormData.append("firstname", values.firstname ?? ''); // This just ensures that the value is '' if not filled in
    userFormData.append("lastname", values.lastname ?? '');
    userFormData.append("email", values.email ?? '');
    userFormData.append("address", values.address ?? '');
    userFormData.append("city", values.city ?? '');
    userFormData.append("state", values.state ?? '');

    try {
      const savedUser = await saveUser(userFormData);
      console.log("User saved successfully:", savedUser);
    }
    catch (err) {
      console.error("User NOT saved successfully: ", err);
    }
    
    console.log("inside submitAccountForm, userFormData is", userFormData);
    saveUser(userFormData)
      .then(savedUser => {
        console.log('User saved successfully:', savedUser);
      })
      .catch(error => {
        console.log("user NOT saved successfully :(", error);
      });
  }


  if(isLoading) return <div>Loading...</div>

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
                      <Input placeholder={user?.firstname || ''} {...field} />
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
                      <Input placeholder={user?.lastname || ''} {...field} />
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
                    <Input placeholder={user?.email || ''} {...field} />
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
                      <Input placeholder={user?.address || ''} {...field} />
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
                      <Input placeholder={user?.city || ''} {...field} />
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
                        <SelectValue placeholder={user?.state || ''} />
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
            <Button type="submit" className='cursor-pointer mt-10'>Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};