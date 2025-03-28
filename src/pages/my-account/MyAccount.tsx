import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { Profile, Account } from '../../common/components/form/MyAccountForms';

export default function MyAccount() {
  return (
    <Tabs defaultValue="profile" className="w-1/2">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Profile />
      </TabsContent>  
      <TabsContent value="account">
        <Account />
      </TabsContent>
    </Tabs>
  );
}