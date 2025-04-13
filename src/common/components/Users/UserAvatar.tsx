import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";

interface UserAvatarProps {
  profile_picture?: string;
  fullName: string;
}

export default function UserAvatar({ profile_picture, fullName }: UserAvatarProps) {
  const initials = fullName
    .split(' ')
    .map((word) => word[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex items-center justify-center py-6">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={profile_picture || ''} 
          alt={`${fullName}'s profile`} 
        />
        <AvatarFallback className="text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>  
  );
}