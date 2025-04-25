import { Button } from '@/common/components/ui/button'
import { MailPlus, UserPlus, SquarePlus } from 'lucide-react'
import * as React from 'react'
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


export function UsersPrimaryButtons() {
  const { user, isLoading } = useUser();
  const data = useWorkLog(user?.id);


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
        {/* <Button variant="outline">Open</Button> */}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
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
