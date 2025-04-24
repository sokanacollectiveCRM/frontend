import { useDraggable } from '@dnd-kit/core';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { User } from '../data/schema';

type Props = {
  user: User
  isOverlay?: boolean
  className?: string
}

export function UserCard({ user, isOverlay = false, className = '' }: Props) {
  const { attributes, listeners, setNodeRef, isDragging, } = useDraggable({
    id: user.id,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOverlay) {
      const timeout = setTimeout(() => setMounted(true), 10) // let DOM mount first
      return () => clearTimeout(timeout)
    }
  }, [isOverlay])

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >

      <div
        data-shadow-target
        className={clsx(
          'rounded-md border bg-white p-3 transition-all duration-200 ease-[cubic-bezier(0.18,0.67,0.6,1.22)]',
          isOverlay && (mounted ? 'scale-110 shadow-xl opacity-90' : 'scale-100 shadow'),
          !isOverlay && 'shadow',
          className
        )}
      >
        <div className="font-medium">
          {user.firstname} {user.lastname}
        </div>
        <div className="text-sm text-muted-foreground">{user.serviceNeeded}</div>
      </div>

    </div>
  )
}