import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { Button } from '@/common/components/ui/button';
import { getDoulaProfile } from '@/api/doulas/doulaService';
import { AlertTriangle } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import {
  isDoulaRaceEthnicityComplete,
  RACE_ETHNICITY_FIELD_LABEL,
} from './doulaDemographics';
import { DoulaDashboardSidebar } from './DoulaDashboardSidebar';
import { useEffect, useState } from 'react';
import { DoulaDashboardOutletContext } from './doulaDashboardTypes';

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
      if (!isDoulaRaceEthnicityComplete(profile?.race_ethnicity, profile?.race_ethnicity_other)) {
        if (!Array.isArray(profile?.race_ethnicity) || profile.race_ethnicity.length === 0) {
          incompleteFields.push(RACE_ETHNICITY_FIELD_LABEL);
        } else {
          incompleteFields.push('Another race or ethnicity (please specify)');
        }
      }
      setMissingFields(incompleteFields);
      setIsProfileComplete(incompleteFields.length === 0);
    } catch {
      // Keep dashboard usable when profile check fails.
      setMissingFields([]);
      setIsProfileComplete(true);
    }
  };

  const outletContext: DoulaDashboardOutletContext = {
    onProfileStatusChange: ({ isComplete, missingFields: updatedMissingFields }) => {
      setIsProfileComplete(isComplete);
      setMissingFields(updatedMissingFields);
    },
  };

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-4'>
          <div className='min-w-0'>
            <h1 className='text-lg font-semibold text-slate-900'>Doula Dashboard</h1>
            <p className='text-sm text-slate-500'>
              Manage your profile, documents, clients, hours, and activities
            </p>
          </div>
          <div className='ml-auto flex items-center gap-4'>
            <ProfileDropdown />
          </div>
        </div>
      </Header>

      <Main fixed>
        <div className='flex h-full min-h-0 gap-6 p-6'>
          <DoulaDashboardSidebar />

          <section className='min-w-0 flex-1 overflow-y-auto'>
            {!isProfileComplete && (
              <div className='mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4'>
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
                    asChild
                    size='sm'
                    className='bg-amber-600 hover:bg-amber-700'
                  >
                    <Link to='/doula-dashboard/profile'>Complete Profile</Link>
                  </Button>
                </div>
              </div>
            )}

            <Outlet context={outletContext} />
          </section>
        </div>
      </Main>
    </>
  );
}
