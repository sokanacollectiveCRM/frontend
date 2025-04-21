import { Button } from '@/common/components/ui/button'
import { MailPlus, UserPlus, SquarePlus } from 'lucide-react'
import * as React from 'react'
import { useUsers } from '../context/clients-context'
import { useUser } from '@/common/hooks/useUser';
import useWorkLog from '@/common/hooks/useWorkLog';

export function UsersPrimaryButtons() {
  const { user, isLoading } = useUser();


  const printUserStuff = () => {
    console.log(user.id);
    const data = useWorkLog(user.id);
    console.log(data);
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={printUserStuff}>
        <span>Add Hours</span> <SquarePlus size={18} />
      </Button>
    </div>
  )
}
