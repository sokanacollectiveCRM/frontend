import { Search } from '@/common/components/header/Search'
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay'
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown'
import useWorkLog from "@/common/hooks/hours/useWorkLog"
import { useUser } from "@/common/hooks/user/useUser"
import { Header } from '@/common/layouts/Header'
import { Main } from '@/common/layouts/Main'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/clients-context'
import DateTimePicker from './components/time-date-picker'

import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover"

const PopoverDemo = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">demo popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}



export default function Hours() {
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


  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <LoadingOverlay isLoading={userLoading || hoursLoading} />

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Your Hours</h2>
          </div>
          <UsersPrimaryButtons />
          <DateTimePicker />
          {PopoverDemo()}
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <UsersTable data={transformedData} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
