import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  profile_picture?: string | null;
  fullName: string;
  className?: string;
  large?: boolean;
}

export default function UserAvatar({ profile_picture, fullName, className, large = false }: UserAvatarProps) {
  const initials = fullName
    .split(' ')
    .map((word) => word[0]?.toUpperCase())
    .join('');

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Avatar
        className={cn(
          "rounded-full overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105",
          large ? "h-28 w-28" : "h-10 w-10"
        )}
      >
        <AvatarImage
          src={profile_picture || ''}
          alt={`${fullName}'s profile`}
          className="object-cover"
        />
        <AvatarFallback
          className={cn(
            "w-full h-full flex items-center justify-center font-semibold",
            large ? "text-4xl" : "text-sm"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}