import { Button } from '@/common/components/ui/button'
import { MailPlus, UserPlus, SquarePlus } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { useUsers } from '../context/clients-context'
import { useUser } from '@/common/hooks/useUser';
import useWorkLog from '@/common/hooks/useWorkLog';
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
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
import { Calendar } from "@/common/components/ui/calendar"
import { workLogSchema } from '@/common/utils/ZodSchemas';


export function UsersPrimaryButtons() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<string | undefined>(undefined);


  
  // CURRENT STATE: CREATED AND IMPORTED ZODSCHEMA FOR THE 'ADD HOURS' FEATURE, CURRENTLY MODIFYING THE INSIDE OF SHEETCONTENT TO ACTUALLY CONTAIN THE FORMS (THE 4 USESTATES ABOVE)
  // USE Shadcn's Calendar, maybe Form? idk, so figure that out

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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            {/* <Label htmlFor="name" className="text-right">
              Date
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" /> */}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            {/* <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" /> */}
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>

    </div>
  )
}
