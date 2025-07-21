import LongText from '@/common/components/ui/long-text';
import UserAvatar from '@/common/components/user/UserAvatar';
import { useDraggable } from '@dnd-kit/core';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Client } from 'features/pipeline/data/schema';

type Props = {
  client: Client;
  isOverlay?: boolean;
  className?: string;
};

export function UserCard({ client, isOverlay = false, className = '' }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: client.id,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOverlay) {
      const timeout = setTimeout(() => setMounted(true), 20); // let DOM mount first
      return () => clearTimeout(timeout);
    }
  }, [isOverlay]);

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <div
        data-shadow-target
        className={clsx(
          'w-full rounded-md border bg-white p-3 transition-all duration-200 ease-[cubic-bezier(0.18,0.67,0.6,1.22)]',
          isOverlay &&
            (mounted ? 'scale-110 shadow-xl opacity-90' : 'scale-100 shadow'),
          !isOverlay && 'shadow',
          className
        )}
      >
        {/* <div className="font-medium">
          {user.firstname} {user.lastname}
        </div> */}
        <div className='flex items-center gap-2 max-w-36 h-10'>
          <UserAvatar
            fullName={`${client.user.firstname} ${client.user.lastname}`}
            className='h-10 w-10'
          />

          <div>
            <LongText className='max-w-36'>
              {`${client.user.firstname} ${client.user.lastname}`}
            </LongText>
            <div className='text-sm text-muted-foreground'>
              {client.serviceNeeded}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
