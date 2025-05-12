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
import { ContractTemplate } from '@/features/clients/data/schema'
import { CommandGroup } from 'cmdk'
import { SquarePlus } from 'lucide-react'
import { useState } from 'react'
import { DraggableTemplate, mockTemplates } from './DraggableTemplate'

export function UsersPrimaryButtons( { draggedTemplate }: { draggedTemplate: ContractTemplate | null}) {
  const templates = mockTemplates;
  const [search, setSearch] = useState<string>('');

  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(search.toLowerCase())
  )

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
          {draggedTemplate ? (
            <div className="p-4 text-sm text-muted-foreground">
              Drag a template onto a user to initiate a contract.
            </div>
          ) : (
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search templates..."
                onValueChange={setSearch}
              />
              <CommandList>
                {filteredTemplates.length === 0 ? (
                  <CommandEmpty>No templates found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filteredTemplates.map((template) => (
                      <DraggableTemplate
                        key={template.id}
                        template={template}
                      />
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}