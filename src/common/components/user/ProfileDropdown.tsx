import { Button } from '@/common/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import UserAvatar from '@/common/components/user/UserAvatar';
import { useUser } from '@/common/hooks/user/useUser';
import { Building2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDoulaIdentity } from '@/features/doula-dashboard/useDoulaIdentity';

export function ProfileDropdown() {
  const { user, logout } = useUser();
  const doulaIdentity = useDoulaIdentity();

  if (!user) return null;
  const name = doulaIdentity.name;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <UserAvatar
            profile_picture={doulaIdentity.profilePicture}
            fullName={name}
            className='h-8 w-8'
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-full' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{name}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/my-account'>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to='/choose-organization'>
            <Building2 />
            Switch organization
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <LogOut />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
