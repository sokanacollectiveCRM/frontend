import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { User } from '../data/schema'


export function UserCard({ user }: { user: User }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: user.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform)
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="rounded-md bg-white p-3 shadow-sm cursor-move"
    >
      <div className="font-medium">
        {user.firstName} {user.lastName}
      </div>
      <div className="text-sm text-muted-foreground">{user.serviceNeeded}</div>
    </div>
  )
}