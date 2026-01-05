import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import ClientProfileTab from './components/ClientProfileTab';
import ClientPaymentHistoryTab from './components/ClientPaymentHistoryTab';
import ClientContractsTab from './components/ClientContractsTab';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ClientDashboard() {
  const { client, isLoading } = useClientAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Header fixed>
          <div className='ml-auto flex items-center space-x-4'></div>
        </Header>
        <Main>
          <div className='flex-1 overflow-auto p-6'>
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
            </div>
          </div>
        </Main>
      </>
    );
  }

  // Show error if no client session
  if (!client) {
    return (
      <>
        <Header fixed>
          <div className='ml-auto flex items-center space-x-4'></div>
        </Header>
        <Main>
          <div className='flex-1 overflow-auto p-6'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                You must be logged in to view the client portal. Please log in again.
              </AlertDescription>
            </Alert>
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'></div>
      </Header>

      <Main>
        <div className='flex-1 overflow-auto p-6'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Client Portal</h1>
            <p className='text-gray-600 mt-1'>
              Welcome, {client?.firstname || client?.email || 'Client'}! Manage your profile, view
              contracts, and track payments.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-3 mb-6'>
              <TabsTrigger value='profile'>Profile</TabsTrigger>
              <TabsTrigger value='contracts'>Contracts</TabsTrigger>
              <TabsTrigger value='payments'>Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value='profile' className='mt-6'>
              <ClientProfileTab />
            </TabsContent>

            <TabsContent value='contracts' className='mt-6'>
              <ClientContractsTab />
            </TabsContent>

            <TabsContent value='payments' className='mt-6'>
              <ClientPaymentHistoryTab />
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  );
}

