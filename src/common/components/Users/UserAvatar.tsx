import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"

export default function UserAvatar( {profile_picture, fullName}: {profile_picture: Buffer, fullName: string} ) {
  // Convert Buffer to data URL if it exists
  const imageUrl = profile_picture 
    ? `data:image/jpeg;base64,${Buffer.from(profile_picture).toString('base64')}`
    : '';

  return (
    <div className="flex items-center justify-center py-6">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={imageUrl} 
          alt={`${fullName}'s profile`} 
        />
        <AvatarFallback className="text-lg">
          {/* display just the initials */}
          {fullName.split(' ').map(name => name[0]).join('')} 
        </AvatarFallback>
      </Avatar>
    </div>  
  )
}
