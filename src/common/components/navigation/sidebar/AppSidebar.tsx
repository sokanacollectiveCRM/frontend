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
import { UserContext } from '@/common/contexts/UserContext';
import { sidebarSections } from '@/common/data/sidebar-data';
import { useContext } from 'react';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useContext(UserContext);

  // while we're still loading auth, render nothing or a spinner
  if (isLoading) {
    return null;
  }

  const isAdmin = user?.role === 'admin';

  // filter out "Integrations" unless admin
  const visible = sidebarSections
    .filter((section) => section.label !== 'Integrations' || isAdmin)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Admin-only items
        if (item.adminOnly === true) {
          return isAdmin;
        }
        // Non-admin items (like Payments)
        if (item.adminOnly === false) {
          return !isAdmin;
        }
        // Legacy admin filtering for specific items
        if (
          item.title === 'Invoices' ||
          item.title === 'New Client' ||
          item.title === 'Clients'
        ) {
          return isAdmin;
        }
        // Show all other items
        return true;
      }),
    }));

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
