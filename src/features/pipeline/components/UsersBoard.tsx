import { UserCard } from '@/features/pipeline/components/UserCard';
import { UserColumn } from '@/features/pipeline/components/UserColumn';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { USER_STATUSES, UserStatus, UserSummary } from '../data/schema';

type Props = {
  usersByStatus: Record<UserStatus, UserSummary[]>;
  onStatusChange: (userId: string, newStatus: UserStatus) => void;
};

export function UsersBoard({ usersByStatus, onStatusChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeUser = useMemo(() => {
    return Object.values(usersByStatus).flat().find(u => u.id === activeId) ?? null;
    }, [activeId, usersByStatus]);


  return (
    
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id.toString())}
      onDragEnd={(event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || !over.id || !active.id) return;
        const userId = active.id.toString();
        const newStatus = over.id.toString() as UserStatus;
        onStatusChange(userId, newStatus);
      }}
      onDragCancel={() => setActiveId(null)}
    >

      <div className='flex gap-4 overflow-x-auto'>
        {USER_STATUSES.map((status) => (
          <UserColumn key={status} id={status} users={usersByStatus[status]} />
        ))}
      </div>

      <DragOverlay>
        {activeUser ? (
          <UserCard key={activeId} user={activeUser} />
        ) : null}
      </DragOverlay>

    </DndContext>
  );
}