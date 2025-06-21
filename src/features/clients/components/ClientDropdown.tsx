"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { Button } from "@/common/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/common/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover"
import { useClients } from '@/common/hooks/clients/useClients'
import { Client } from "@/common/types/client"
import { cn } from "@/lib/utils"

interface Props {
  value?: Client
  onChange: (value: Client) => void
}

export function ClientDropdown({ value, onChange }: Props) {
  const { clients, isLoading } = useClients()
  const [open, setOpen] = useState(false)

  const clientName = value
    ? `${value.firstName} ${value.lastName}`
    : 'Select a client'

  const handleSelect = (client: Client) => {
    onChange(client)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {clientName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`${client.firstName} ${client.lastName}`}
                  onSelect={() => handleSelect(client)}
                  className='flex flex-col items-start'
                >
                  <div>
                    {client.firstName} {client.lastName}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {client.email}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value?.id === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

ClientDropdown.displayName = "ClientDropdown"