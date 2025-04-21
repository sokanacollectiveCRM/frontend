import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { User, UserStatus } from '../data/schema'
import { UserColumn } from './user-column'

const statuses: UserStatus[] = ['In Progress', 'Active', 'Completed']

interface UsersBoardProps {
  users: User[]
  onStatusChange: (userId: string, newStatus: UserStatus) => void
}

export function UsersBoard({ users, onStatusChange }: UsersBoardProps) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!active || !over || active.id === over.id) return

    const userId = active.id as string
    const newStatus = over.id as UserStatus

    onStatusChange(userId, newStatus)
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto">
        {statuses.map((status) => (
          <UserColumn
            key={status}
            id={status}
            label={status}
            users={users.filter((user) => user.status === status)}
          />
        ))}
      </div>
    </DndContext>
  )
}