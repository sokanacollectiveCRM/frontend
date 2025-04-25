import { ProfileDropdown } from '@/common/components/profile-dropdown'
import { Search } from '@/common/components/Search'
import { useUser } from "@/common/hooks/useUser"
import useWorkLog from "@/common/hooks/useWorkLog"
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import { useEffect, useState } from "react"
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/clients-context'
import { userListSchema } from './data/schema'
import { users } from './data/users'

export default function Hours() {
  // Parse user list

  //  CURRENTLY HAVE BACKEND WORKING FOR GETTING HOURS, useUser() gets the userID and calling useWorkLog() gets the information.
  // to do now is parsing the returned data type thing of useWorkLog and displaying that information based on if it's finished loading or not 
  // const [hoursData, setHoursData] = useState<any[]>();

  const userList = userListSchema.parse(users);
  const { user, isLoading: userLoading } = useUser();
  const { hours, isLoading: hoursLoading } = useWorkLog(user?.id);

  const transformedData = hours?.map(session => ({
    id: session.id,
    // Client fields
    client: {
      firstName: session.client.firstname,
      lastName: session.client.lastname
    },
    // Doula fields
    doula: {
      firstName: session.doula.firstname,
      lastName: session.doula.lastname
    },
    // Time fields
    start_time: new Date(session.start_time).toLocaleString(),
    end_time: new Date(session.end_time).toLocaleString(),
      // Add any other fields your table might need
  })) || [];

  // Log directly when hours change
  useEffect(() => {
    if (hours) {
      console.log("Transformed hours data:", transformedData);
    }
  }, [transformedData]);

  // if(hours) {
  //   return (
  //     <div>
  //       {hours.map(session => (
  //         <div>
  //           <h1>Doula: {session.doula.firstname}, {session.doula.lastname}</h1>
  //           <h1>Client: {session.client.firstname}, {session.client.lastname}</h1>
  //           <p>Start: {session.start_time}</p>
  //           <p>End: {session.end_time}</p>
  //         </div>
  //       ))}
  //     </div>
  //   )
  // }

  if (userLoading || hoursLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    )
  }

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
          <UsersTable data={transformedData} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
