import { Button } from '@/common/components/ui/button'
import { SquarePlus } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
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
import ChooseDate from './add-date-dialog'

export function UsersPrimaryButtons() {
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [endTime, setEndTime] = useState<string | undefined>(undefined);

  const printUserStuff = () => {
    console.log("ADD HOURS BUTTON CLICKED");
  }

  return (
    <div className='flex gap-2'>
    <Sheet>
      <SheetTrigger asChild>
        <Button className='space-x-1' onClick={printUserStuff}>
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
            <ChooseDate 
              trigger_text="Select start date"
              dialog_title="When did you START work?"
              date={startDate}
              setDate={setStartDate}
            />
          </div>
          <div className="items-center flex items-center justify-center">
          </div>
          <div className="items-center flex items-center justify-center">
            <ChooseDate 
              trigger_text="Select end date"
              dialog_title="When did you END work?"
              date={endDate}
              setDate={setEndDate}
            />

          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={() => {console.log("start time", startDate); console.log("end time", endDate);}}>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    </div>
  )
}
