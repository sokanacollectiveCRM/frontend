import { Search } from '@/common/components/header/Search';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import InboxPage from './components/InboxPage';

export default function Inbox() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex-1 overflow-auto p-4'>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Inbox</h2>
            </div>
          </div>

          <InboxPage />
        </div>
      </Main>
    </>
  );
}
