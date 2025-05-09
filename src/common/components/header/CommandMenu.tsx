import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/common/components/ui/command'
import { ScrollArea } from '@/common/components/ui/scroll-area'
import { useSearch } from '@/common/contexts/search-context'
import { SidebarItem, SidebarSection, sidebarSections } from '@/common/data/sidebar-data'
import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export function CommandMenu() {
  const navigate = useNavigate()
  const { open, setOpen } = useSearch()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pr-1">
          <CommandEmpty>No results found.</CommandEmpty>
          {sidebarSections.map((section: SidebarSection, index) => (
            <CommandGroup key={`${section.label}-${index}`} heading={section.label}>
              {section.items.map((item: SidebarItem) => (
                <CommandItem
                  key={item.url}
                  value={item.title}
                  onSelect={() => runCommand(() => navigate(item.url))}
                >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    <ArrowRight className="size-2 text-muted-foreground/80" />
                  </div>
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}