import { useDroppable } from '@dnd-kit/core'
import { User } from '../data/schema'
import { UserCard } from './user-card'

export function UserColumn({
  id,
  label,
  users,
}: {
  id: string
  label: string
  users: User[]
}) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className="w-80 flex-shrink-0 rounded-lg bg-muted p-4">
      <h3 className="mb-2 text-lg font-semibold">{label}</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}