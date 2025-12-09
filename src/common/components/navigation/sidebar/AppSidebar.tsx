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
  const isDoula = user?.role === 'doula';

  // Filter sections and items based on role
  const visible = sidebarSections
    .map((section) => {
      // Filter items based on role
      const filteredItems = section.items.filter((item) => {
        // Admin-only items - only show to admins
        if (item.adminOnly === true) {
          return isAdmin;
        }
        // Doula-only items - only show to doulas
        if (item.doulaOnly === true) {
          return isDoula;
        }
        // Non-admin items (like Payments) - show to non-admins
        if (item.adminOnly === false) {
          return !isAdmin;
        }
        // Legacy admin filtering for specific items
        if (
          item.title === 'Invoices' ||
          item.title === 'Customers' ||
          item.title === 'Leads'
        ) {
          return isAdmin;
        }
        // Show all other items to everyone
        return true;
      });

      // Return section with filtered items
      return {
        ...section,
        items: filteredItems,
      };
    })
    // Filter out empty sections
    .filter((section) => section.items.length > 0)
    // Filter out "Integrations" section unless admin
    .filter((section) => section.label !== 'Integrations' || isAdmin);

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
