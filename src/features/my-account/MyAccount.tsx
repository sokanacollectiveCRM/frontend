import { Search } from '@/common/components/header/Search'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import MyAccountForms from '@/features/my-account/components/MyAccountForms'

export default function MyAccount() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="flex-1 overflow-auto p-4">
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Account</h2>
              <p className='text-muted-foreground'>
                Make changes to your profile.
              </p>
            </div>
          </div>

          <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
            <MyAccountForms />
          </div>
        </div>
      </Main>
    </>
  )
}