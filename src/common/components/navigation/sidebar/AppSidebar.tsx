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
import { sidebarSections, type SidebarItem } from '@/common/data/sidebar-data';
import { useClientAuth } from '@/common/hooks/auth/useClientAuth';
import { useContext } from 'react';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useContext(UserContext);
  const { client, isLoading: isClientLoading } = useClientAuth();

  // while we're still loading auth, render nothing or a spinner
  if (isLoading || isClientLoading) {
    return null;
  }

  const isAdmin = user?.role === 'admin';
  const isDoula = user?.role === 'doula';
  const isClient = !!client;

  // Filter sections and items based on role
  const visible = sidebarSections
    .map((section) => {
      // Filter items based on role
      const filteredItems = section.items.filter((item: SidebarItem) => {
        // Client-only items - only show to clients
        if (item.clientOnly === true) {
          return isClient;
        }
        // Admin-only items - only show to admins (and not clients)
        if (item.adminOnly === true) {
          return isAdmin && !isClient;
        }
        // Doula-only items - only show to doulas (and not clients)
        if (item.doulaOnly === true) {
          return isDoula && !isClient;
        }
        // Non-admin items (like Payments) - show to non-admins (but not clients)
        if (item.adminOnly === false) {
          return !isAdmin && !isClient;
        }
        // Legacy admin filtering for specific items
        if (
          item.title === 'Invoices' ||
          item.title === 'Customers' ||
          item.title === 'Leads'
        ) {
          return isAdmin && !isClient;
        }
        // Show all other items to everyone (except clients, who should only see client-only items)
        return !isClient;
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
