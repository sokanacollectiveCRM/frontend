import { Search } from '@/common/components/header/Search';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { useUser } from '@/common/hooks/user/useUser';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { Viewport } from './components/common/Viewport';
import { TemplatesProvider } from './contexts/TemplatesContext';

export default function EditTemplate() {
  const { isLoading: userLoading } = useUser();

  return (
    <TemplatesProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <LoadingOverlay isLoading={userLoading} />

      <Main>
        <div className='flex-1 overflow-auto p-4'>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Contracts</h2>
              <p className='text-muted-foreground'>
                Create or edit a template below.
              </p>
            </div>
          </div>

          <Viewport />
        </div>
      </Main>
    </TemplatesProvider>
  );
}
