import { Button } from '@/common/components/ui/button'
import { SquarePlus } from 'lucide-react'
import { useUsers } from '../context/users-context'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Create Contract</span> <SquarePlus size={18} />
      </Button>
    </div>
  )
}
