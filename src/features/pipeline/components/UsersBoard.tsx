import { UserCard } from '@/features/pipeline/components/UserCard';
import { UserColumn } from '@/features/pipeline/components/UserColumn';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DropAnimation,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import { USER_STATUSES, UserStatus, UserSummary } from '../data/schema';

type Props = {
  usersByStatus: Record<UserStatus, UserSummary[]>;
  onStatusChange: (userId: string, newStatus: UserStatus) => void;
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    const scale = 0.91;
    return [
      { transform: CSS.Transform.toString(transform.initial) },
      {
        transform: CSS.Transform.toString({
          ...transform.final,
          scaleX: scale,
          scaleY: scale,
        }),
      },
    ];
  },
  sideEffects({ active, dragOverlay }) {
    active.node.style.opacity = '0';

    const shadowTarget = dragOverlay.node.querySelector('[data-shadow-target]') as HTMLElement;
    if (shadowTarget) {
      shadowTarget.animate(
        [
          {
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)', // lifted shadow
          },
          {
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // resting shadow
          },
        ],
        {
          duration: 250,
          easing: 'ease-in-out',
          fill: 'forwards',
        }
      );
    }

    return () => {
      active.node.style.opacity = '';
    };
  },
};

export function UsersBoard({ usersByStatus, onStatusChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const activeUser = useMemo(() => {
    return Object.values(usersByStatus).flat().find(u => u.id === activeId) ?? null;
  }, [activeId, usersByStatus]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        distance: 3,
        tolerance: 8,
      },
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        setActiveId(event.active.id.toString());
        setShowOverlay(true);
      }}
      onDragEnd={(event: DragEndEvent) => {
        const { active, over } = event;

        if (active && over) {
          const userId = active.id.toString();
          const newStatus = over.id.toString() as UserStatus;
          onStatusChange(userId, newStatus);
        }
      
        setActiveId(null);
        setShowOverlay(false);
      }}
      onDragCancel={() => {
        setActiveId(null);
        setShowOverlay(false);
      }}
    >

      <div className="flex gap-4 overflow-x-auto min-h-[800px]">
        {USER_STATUSES.map((status) => (
          <UserColumn key={status} id={status} users={usersByStatus[status]} />
        ))}
      </div>

      <DragOverlay
        dropAnimation={dropAnimationConfig}
        style={{ transformOrigin: 'center' }}
        >
        {showOverlay && activeUser ? (
          <UserCard
          user={activeUser}
          isOverlay={true}
          className="transition-transform duration-200 ease-out opacity-90"
          />
        ) : null}
      </DragOverlay>

    </DndContext>
  );
}