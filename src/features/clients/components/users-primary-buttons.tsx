import { Button } from '@/common/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/common/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { Template } from '@/common/types/template';
import { useTemplatesContext } from '@/features/clients/contexts/TemplatesContext';
import { CommandGroup } from 'cmdk';
import { SquarePlus } from 'lucide-react';
import { useState } from 'react';
import { DraggableTemplate } from './DraggableTemplate';

export function UsersPrimaryButtons({
  draggedTemplate,
}: {
  draggedTemplate: Template | null;
}) {
  const { templates } = useTemplatesContext();

  const [search, setSearch] = useState<string>('');

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase())
  );

  const fetchCSV = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const data = await fetch(
        `http://localhost:5050/clients/fetchCSV`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const csvData = await data.text();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'demographics.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      throw new Error(`Error Retrieving CSV${error}`);
    }
  };
  return (
    <div className='flex gap-2'>
      <Button variant='outline' className='space-x-1' onClick={fetchCSV}>
        <span>Export</span>
        <SquarePlus size={18} />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button className='space-x-1'>
            <span>Create Contract</span>
            <SquarePlus size={18} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-64 p-0' align='start'>
          {draggedTemplate ? (
            <div className='p-4 text-sm text-muted-foreground'>
              Drag a template onto a user to initiate a contract.
            </div>
          ) : (
            <Command shouldFilter={false}>
              <CommandInput
                placeholder='Search templates...'
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
  );
}
