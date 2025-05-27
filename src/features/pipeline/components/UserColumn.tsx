import { Client, STATUS_LABELS, UserStatus } from '@/features/pipeline/data/schema'
import { useDroppable } from '@dnd-kit/core'
import { clsx } from 'clsx'
import { UserCard } from './UserCard'
type Props = {
  id: UserStatus
  users: Client[]
}

export function UserColumn({ id, users }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[300px] h-full h-min-[200px] rounded-lg border-2 border-double p-2 transition-colors 
        duration-300 ease-in-out ${isOver ? 'bg-muted bg-accent/10 ring-2 ring-accent/40' : ''
        }`}
    >
      <div
        className={clsx(
          'flex flex-col gap-2 transition-transform duration-300 ease-in-out',
          isOver && 'scale-[.97]'
        )}
      >
        <h3 className='mb-2 text-lg font-semibold'>{STATUS_LABELS[id]}</h3>
        <div className='flex flex-col gap-2'>
          {users.map((user) => (
            <UserCard key={user.id} client={user} isOverlay={false} />
          ))}
        </div>
      </div>

    </div>
  )
}