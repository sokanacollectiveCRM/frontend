import styled from 'styled-components';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { imageSchema } from '../../common/utils/ZodSchemas';
import { Profile } from '../../common/components/form/MyAccountForms';

const profileFormSchema = z.object({
  profilePicture: imageSchema.optional(),
  bio: z.string().max(300).optional(),
});

const accountFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional()
});

export default function MyAccount() {
  const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 12vh 5vw 12vh 5vw;
    background-color: blue;
  `
  
  const ProfileAccountTabs = styled(Tabs).attrs({
    defaultValue: "profile"
  })`
    background-color: red;
    width: 400px;
  `

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: "",
    },
  });

  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      country: ""    
    },
  });

  function submitProfileForm(values: z.infer<typeof profileFormSchema>) {
    console.log(values); //for now just prints to console
  }

  function submitAccountForm(values: z.infer<typeof accountFormSchema>) {
    console.log(values); //for now just prints to console
  }

  return (
    // <ProfileAccountTabs>
    <Tabs defaultValue="profile" className="w-1/2">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Profile />
      </TabsContent>  
      <TabsContent value="account">

      </TabsContent>
    </Tabs>
  );
}