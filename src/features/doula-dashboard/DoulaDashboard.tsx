import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import ProfileTab from './components/ProfileTab';
import DocumentsTab from './components/DocumentsTab';
import ClientsTab from './components/ClientsTab';
import HoursTab from './components/HoursTab';
import ActivitiesTab from './components/ActivitiesTab';

export default function DoulaDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex-1 overflow-auto p-6'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Doula Dashboard</h1>
            <p className='text-gray-600 mt-1'>
              Manage your profile, documents, clients, and hours
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-5 mb-6'>
              <TabsTrigger value='profile'>Profile</TabsTrigger>
              <TabsTrigger value='documents'>Documents</TabsTrigger>
              <TabsTrigger value='clients'>Clients</TabsTrigger>
              <TabsTrigger value='hours'>Hours</TabsTrigger>
              <TabsTrigger value='activities'>Activities</TabsTrigger>
            </TabsList>

            <TabsContent value='profile' className='mt-6'>
              <ProfileTab />
            </TabsContent>

            <TabsContent value='documents' className='mt-6'>
              <DocumentsTab />
            </TabsContent>

            <TabsContent value='clients' className='mt-6'>
              <ClientsTab
                onClientSelect={(clientId) => {
                  setSelectedClientId(clientId);
                  setActiveTab('activities');
                }}
              />
            </TabsContent>

            <TabsContent value='hours' className='mt-6'>
              <HoursTab />
            </TabsContent>

            <TabsContent value='activities' className='mt-6'>
              <ActivitiesTab
                clientId={selectedClientId}
                onBack={() => {
                  setSelectedClientId(null);
                  setActiveTab('clients');
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  );
}

