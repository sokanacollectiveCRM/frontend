import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/common/components/ui/command';
import { ScrollArea } from '@/common/components/ui/scroll-area';
import { useSearch } from '@/common/contexts/SearchContext';
import { UserContext } from '@/common/contexts/UserContext';
import {
  SidebarItem,
  SidebarSection,
  sidebarSections,
} from '@/common/data/sidebar-data';
import { ArrowRight } from 'lucide-react';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export function CommandMenu() {
  const navigate = useNavigate();
  const { open, setOpen } = useSearch();
  const { user } = useContext(UserContext);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  const isAdmin = user?.role === 'admin';
  const isDoula = user?.role === 'doula';

  // Filter sidebar sections based on user role (same logic as AppSidebar)
  const filteredSections = sidebarSections
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
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pr-1'>
          <CommandEmpty>No results found.</CommandEmpty>
          {filteredSections.map((section: SidebarSection, index) => (
            <CommandGroup
              key={`${section.label}-${index}`}
              heading={section.label}
            >
              {section.items.map((item: SidebarItem) => (
                <CommandItem
                  key={item.url}
                  value={item.title}
                  onSelect={() => runCommand(() => navigate(item.url))}
                >
                  <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                    <ArrowRight className='size-2 text-muted-foreground/80' />
                  </div>
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
