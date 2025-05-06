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
        <div className="mb-2 flex flex-col space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">My Account</h2>
          <p className="text-muted-foreground">Manage your account and profile settings.</p>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <MyAccountForms />
        </div>
      </Main>
    </>
  )
}