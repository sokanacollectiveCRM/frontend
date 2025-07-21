'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/common/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/common/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { cn } from '@/lib/utils';
import { useClientsContext } from 'features/clients/contexts/ClientsContext';
import { Client } from 'features/clients/data/schema';

export const ClientDropdown = React.forwardRef<
  HTMLButtonElement,
  {
    value: Client | null;
    onChange: (client: Client) => void;
  }
>(({ value, onChange }, ref) => {
  const [open, setOpen] = React.useState(false);
  const { clients } = useClientsContext();

  const selectedLabel = value
    ? `${value.firstname} ${value.lastname}`
    : 'Select a client...';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
        >
          {selectedLabel || 'Select a client...'}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-110 p-0 z-[9999]'>
        <Command>
          <CommandInput placeholder='Search client...' />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`${client.firstname} ${client.lastname}`}
                  onSelect={() => {
                    onChange(client);
                    setOpen(false);
                  }}
                >
                  {client.firstname} {client.lastname}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value?.id === client.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

ClientDropdown.displayName = 'ClientDropdown';
