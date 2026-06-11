import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/common/components/ui/command';
import { ScrollArea } from '@/common/components/ui/scroll-area';
import { isAdminRole, isBillingOnlyRole, isDoulaRole } from '@/common/auth/roles';
import { useSearch } from '@/common/contexts/SearchContext';
import { UserContext } from '@/common/contexts/UserContext';
import {
  SidebarSection,
  SidebarItem,
  getVisibleSidebarSections,
} from '@/common/data/sidebar-data';
import { useIsClientPortalUser } from '@/common/hooks/auth/useIsClientPortalUser';
import { ArrowRight } from 'lucide-react';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export function CommandMenu() {
  const navigate = useNavigate();
  const { open, setOpen } = useSearch();
  const { user } = useContext(UserContext);
  const { isClientPortalUser } = useIsClientPortalUser();

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  const filteredSections = getVisibleSidebarSections({
    isAdmin: isAdminRole(user?.role),
    isDoula: isDoulaRole(user?.role),
    isClient: isClientPortalUser,
    isBillingOnly: isBillingOnlyRole(user?.role),
  });

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
