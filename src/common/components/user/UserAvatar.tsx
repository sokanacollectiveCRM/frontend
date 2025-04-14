import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";

interface UserAvatarProps {
  profile_picture?: string;
  fullName: string;
  className?: string;
}

export default function UserAvatar({ profile_picture, fullName, className}: UserAvatarProps) {
  const initials = fullName
    .split(' ')
    .map((word) => word[0]?.toUpperCase())
    .join('');

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Avatar className="h-full w-full rounded-full overflow-hidden">
        <AvatarImage 
          src={profile_picture || ''} 
          alt={`${fullName}'s profile`} 
          className="object-cover"
        />
        <AvatarFallback className="text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>  
  );
}