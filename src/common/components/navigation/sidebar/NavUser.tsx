'use client';

import { Building2, ChevronsUpDown, LogOut, User } from 'lucide-react';
import { logFailure } from '@/utils/safeLog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/common/components/ui/sidebar';
import UserAvatar from '@/common/components/user/UserAvatar';
import { buildUrl } from '@/api/http';
import { setSelectedOrganization } from '@/api/organizationContext';
import { useUser } from '@/common/hooks/user/useUser';
import { getFirebaseAuth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { Link } from 'react-router-dom';
import { useDoulaIdentity } from '@/features/doula-dashboard/useDoulaIdentity';

//
// This is the user profile card at the footer of the sidebar
//
export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useUser();
  const doulaIdentity = useDoulaIdentity();
  const { client } = useClientAuth();

  const handleClientLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      await fetch(buildUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      logFailure('ui', 'client_logout_error');
    } finally {
      setSelectedOrganization(null);
      window.location.href = '/auth/client-login';
    }
  };

  // Show for backend users (admin/doula)
  if (user) {
    const name = doulaIdentity.name;
    const profilePicture = doulaIdentity.profilePicture;

    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <UserAvatar
                  profile_picture={profilePicture}
                  fullName={name}
                  className='h-8 w-8'
                />
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{name}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
                <ChevronsUpDown className='ml-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                  <UserAvatar
                    profile_picture={profilePicture}
                    fullName={name}
                    className='h-8 w-8'
                  />
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>{name}</span>
                    <span className='truncate text-xs'>{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link to='my-account'>
                    <User />
                    Account
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
              <DropdownMenuItem className='cursor-pointer' onClick={logout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Show for Supabase clients
  if (client) {
    const name =
      `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim() ||
      client.email ||
      'Client';

    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <UserAvatar fullName={name} className='h-8 w-8' />
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{name}</span>
                  <span className='truncate text-xs'>{client.email}</span>
                </div>
                <ChevronsUpDown className='ml-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                  <UserAvatar fullName={name} className='h-8 w-8' />
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>{name}</span>
                    <span className='truncate text-xs'>{client.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={handleClientLogout}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Don't show anything if neither user nor client
  return null;
}
