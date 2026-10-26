// src/common/components/navigation/sidebar/AppSidebar.tsx
import { BusinessCard } from '@/common/components/navigation/sidebar/BusinessCard';
import { NavUser } from '@/common/components/navigation/sidebar/NavUser';
import { SidebarSection } from '@/common/components/navigation/sidebar/SidebarSection';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/common/components/ui/sidebar';
import {
  isAdminRole,
  isBillingOnlyRole,
  isDoulaRole,
} from '@/common/auth/roles';
import { UserContext } from '@/common/contexts/UserContext';
import { getVisibleSidebarSections } from '@/common/data/sidebar-data';
import { useIsClientPortalUser } from '@/common/hooks/auth/useIsClientPortalUser';
import { useContext, useEffect, useState } from 'react';
import { staffRequest } from '@/features/staff-permissions/staffPermissionsApi';
import { Link } from 'react-router-dom';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useContext(UserContext);
  const { isClientPortalUser, isLoading: isPortalLoading } =
    useIsClientPortalUser();

  const [canManageStaff, setCanManageStaff] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (user?.role !== 'admin') {
        setCanManageStaff(false);
        return;
      }
      staffRequest('/access')
        .then(() => {
          if (active) setCanManageStaff(true);
        })
        .catch(() => {
          if (active) setCanManageStaff(false);
        });
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.removeEventListener('focus', refresh);
    };
  }, [user?.id, user?.role]);

  // while we're still loading auth, render nothing or a spinner
  if (isLoading || isPortalLoading) {
    return null;
  }

  if (user?.organizationAccess === 'none') return null;
  const isAdmin = isAdminRole(user?.role);
  const isDoula = isDoulaRole(user?.role);
  const isClient = isClientPortalUser;
  const isBillingOnly = isBillingOnlyRole(user?.role);

  const visible = getVisibleSidebarSections({
    isAdmin,
    isHr: user?.role === 'hr',
    isDoula,
    isClient,
    isBillingOnly,
    showIntakeForm: (isAdmin || user?.platformSupport === true) && !isClient,
  });

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <BusinessCard />
      </SidebarHeader>

      <SidebarContent>
        {canManageStaff && !isClient && (
          <div className='px-4 py-2'>
            <span className='text-xs'>Settings</span>
            <Link className='block py-2' to='/settings/staff-permissions'>
              Staff permissions
            </Link>
          </div>
        )}
        {visible.map((section) => (
          <SidebarSection
            key={section.label}
            label={section.label}
            items={section.items}
          />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
