import { UserStatus, UserSummary } from '@/features/pipeline/data/schema'
import { useDroppable } from '@dnd-kit/core'
import { UserCard } from './UserCard'

type Props = {
  id: UserStatus
  users: UserSummary[]
}

export function UserColumn({ id, users }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[250px] flex-1 rounded-lg border p-4 transition-colors ${
        isOver ? 'bg-accent/30' : 'bg-muted'
      }`}
    >
      <h3 className='mb-2 text-lg font-semibold'>{id}</h3>
      <div className='flex flex-col gap-3'>
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}