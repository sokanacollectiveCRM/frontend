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
import { isAdminRole, isBillingOnlyRole, isDoulaRole } from '@/common/auth/roles';
import { UserContext } from '@/common/contexts/UserContext';
import { getVisibleSidebarSections } from '@/common/data/sidebar-data';
import { useIsClientPortalUser } from '@/common/hooks/auth/useIsClientPortalUser';
import { useContext } from 'react';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useContext(UserContext);
  const { isClientPortalUser, isLoading: isPortalLoading } = useIsClientPortalUser();

  // while we're still loading auth, render nothing or a spinner
  if (isLoading || isPortalLoading) {
    return null;
  }

  const isAdmin = isAdminRole(user?.role);
  const isDoula = isDoulaRole(user?.role);
  const isClient = isClientPortalUser;
  const isBillingOnly = isBillingOnlyRole(user?.role);

  const visible = getVisibleSidebarSections({
    isAdmin,
    isDoula,
    isClient,
    isBillingOnly,
  });

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <BusinessCard />
      </SidebarHeader>

      <SidebarContent>
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
