import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/common/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  profile_picture?: string | null;
  fullName: string;
  className?: string;
  large?: boolean;
  onLoadingStatusChange?: (
    status: 'idle' | 'loading' | 'loaded' | 'error'
  ) => void;
}

export function preloadProfileImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to load profile picture'));
    image.src = src;
  });
}

export default function UserAvatar({
  profile_picture,
  fullName,
  className,
  large = false,
  onLoadingStatusChange,
}: UserAvatarProps) {
  // Handle undefined/null fullName
  const safeFullName = fullName || '';
  const initials = safeFullName
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word[0]?.toUpperCase())
    .join('')
    || '?';

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Avatar
        className={cn(
          'rounded-full overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105',
          className || (large ? 'h-28 w-28' : 'h-10 w-10')
        )}
      >
        <AvatarImage
          src={profile_picture || ''}
          alt={`${fullName}'s profile`}
          className='size-full object-cover object-center'
          onLoadingStatusChange={onLoadingStatusChange}
        />
        <AvatarFallback
          className={cn(
            'w-full h-full flex items-center justify-center font-semibold',
            large ? 'text-4xl' : 'text-sm'
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
