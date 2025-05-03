import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/common/components/ui/tabs";
import { Account } from './UpdateAccount';
import { Profile } from './UpdateProfile';

export default function MyAccount() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile" >Profile</TabsTrigger>
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


