import { Button } from '@/common/components/ui/button'
import { SquarePlus } from 'lucide-react'
import * as React from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/common/components/ui/sheet"
import { DateTimePicker } from './time-date-pick'
import { ClientsPicker } from './clients-picker'
import { User } from '@/common/types/user';
import { useClients } from '@/common/hooks/clients/useClients'

export function UsersPrimaryButtons() {
  // const [startDate, setStartDate] = React.useState<Date | undefined>(new Date());
  // const [startTime, setStartTime] = useState<string | undefined>(undefined);
  // const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  // const [endTime, setEndTime] = useState<string | undefined>(undefined);

  
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [client, setClients] = React.useState<User[]>([]);

  const { clients, isLoading, error, getClients} = useClients();

  React.useEffect(() => {
    getClients();
  }, []);

  React.useEffect(() => {
    if (clients && clients.length > 0) {
      setClients(clients);
    }
  }, [clients]);


  function handleSave() {
    console.log("start time", startDate); 
    console.log("end time", endDate);
    console.log("selected client", client);
  }

  return (
    <div className='flex gap-2'>
      <Sheet>
        <SheetTrigger asChild>
          <Button className='space-x-1'>
            <span>Add Hours</span> <SquarePlus size={18} />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className='text-2xl font-bold'>Add Hours</SheetTitle>
            <SheetDescription>
              Please enter your start and end time 
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-10 justify-center items-center mt-10">
            <div className="items-center flex items-center justify-center">
              <div className='flex flex-col gap-10'>
                <div>
                  <h1 className='text-lg'>When did you <span className='font-bold'>start</span> work?</h1>
                  <DateTimePicker 
                    date={startDate}
                    setDate={setStartDate}
                  />
                </div>
                <div>
                  <h1 className='text-lg'>When did you <span className='font-bold'>end</span> work?</h1>
                  <DateTimePicker 
                    date={endDate}
                    setDate={setEndDate}
                  />
                </div>
                <ClientsPicker />
              </div>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit" onClick={handleSave}>Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
