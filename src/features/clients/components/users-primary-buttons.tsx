import { Button } from '@/common/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList
} from '@/common/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover'
import { CommandGroup } from 'cmdk'
import { SquarePlus } from 'lucide-react'
import { DraggableTemplate, mockTemplates } from './TemplateSidebar'

export function UsersPrimaryButtons() {
  const templates = mockTemplates; // assume it returns a list of { id, title }

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="space-x-1">
            <span>Create Contract</span>
            <SquarePlus size={18} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search templates..." />
            <CommandList>
              <CommandEmpty>No templates found.</CommandEmpty>
              <CommandGroup>
                {templates.map((template) => (
                  <DraggableTemplate template={template}/>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}