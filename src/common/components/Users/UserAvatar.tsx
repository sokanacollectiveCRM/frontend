import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"

export default function UserAvatar( {profile_picture, fullName}: {profile_picture: File, fullName: string} ) {

  // not sure how to correctly handle profile picture data, will keep at input but will ignore for now

  return (
    <div className="flex items-center justify-center py-6">
      <Avatar className="h-24 w-24">
        {/* commented to ignore profile picture for now */}
        {/* <AvatarImage 
          src={"imageUrl"} 
          alt={`${fullName}'s profile`} 
        /> */}
        <AvatarFallback className="text-lg">
          {/* display just the initials */}
          {fullName.split(' ').map(name => name[0]).join('')} 
        </AvatarFallback>
      </Avatar>
    </div>  
  )
}
