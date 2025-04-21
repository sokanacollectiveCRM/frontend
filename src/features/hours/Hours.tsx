import React from "react"
import { ProfileDropdown } from '@/common/components/profile-dropdown'
import { Search } from '@/common/components/Search'
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/clients-context'
import { userListSchema } from './data/schema'
import { users } from './data/users'
import useWorkLog from "@/common/hooks/useWorkLog"

export default function Hours() {
  // Parse user list
  const userList = userListSchema.parse(users);
  
  const hours_data = useWorkLog()  

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Your Hours</h2>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
    {}
  )
}
