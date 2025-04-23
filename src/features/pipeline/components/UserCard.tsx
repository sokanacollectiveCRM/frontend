import { useDraggable } from '@dnd-kit/core'
import { User } from '../data/schema'


export function UserCard({ user }: { user: User }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: user.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-md border bg-white p-3 shadow transition-opacity ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="font-medium">
        {user.firstname} {user.lastname}
      </div>
      <div className="text-sm text-muted-foreground">{user.serviceNeeded}</div>
    </div>
  )
}