import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { Button } from '@/common/components/ui/button';
import ProfileTab from './components/ProfileTab';
import DocumentsTab from './components/DocumentsTab';
import ClientsTab from './components/ClientsTab';
import HoursTab from './components/HoursTab';
import ActivitiesTab from './components/ActivitiesTab';
import { getDoulaProfile } from '@/api/doulas/doulaService';
import { AlertTriangle } from 'lucide-react';

const REQUIRED_PROFILE_FIELDS = [
  'firstname',
  'lastname',
  'address',
  'city',
  'state',
  'country',
  'zip_code',
  'bio',
] as const;

const FIELD_LABELS: Record<(typeof REQUIRED_PROFILE_FIELDS)[number], string> = {
  firstname: 'First Name',
  lastname: 'Last Name',
  address: 'Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  zip_code: 'Zip Code',
  bio: 'Bio',
};

export default function DoulaDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    fetchProfileCompletion();
  }, []);

  const fetchProfileCompletion = async () => {
    try {
      const profile = await getDoulaProfile();
      const incompleteFields = REQUIRED_PROFILE_FIELDS.filter(
        (field) => !String(profile?.[field] ?? '').trim()
      ).map((field) => FIELD_LABELS[field]);
      setMissingFields(incompleteFields);
      setIsProfileComplete(incompleteFields.length === 0);
    } catch {
      // Keep dashboard usable when profile check fails.
      setMissingFields([]);
      setIsProfileComplete(true);
    }
  };

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

          {!isProfileComplete && (
            <div className='mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4'>
              <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='mt-0.5 h-5 w-5 text-amber-700' />
                  <div>
                    <p className='font-medium text-amber-900'>
                      Complete your profile to finish account setup.
                    </p>
                    <p className='text-sm text-amber-800'>
                      Missing required fields: {missingFields.join(', ')}
                    </p>
                  </div>
                </div>
                <Button
                  size='sm'
                  className='bg-amber-600 hover:bg-amber-700'
                  onClick={() => setActiveTab('profile')}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-5 mb-6'>
              <TabsTrigger value='profile'>Profile</TabsTrigger>
              <TabsTrigger value='documents'>Documents</TabsTrigger>
              <TabsTrigger value='clients'>Clients</TabsTrigger>
              <TabsTrigger value='hours'>Hours</TabsTrigger>
              <TabsTrigger value='activities'>Activities</TabsTrigger>
            </TabsList>

            <TabsContent value='profile' className='mt-6'>
              <ProfileTab
                onProfileStatusChange={({ isComplete, missingFields: updatedMissingFields }) => {
                  setIsProfileComplete(isComplete);
                  setMissingFields(updatedMissingFields);
                }}
              />
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

