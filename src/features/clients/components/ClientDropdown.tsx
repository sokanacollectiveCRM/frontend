"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

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
import { cn } from "@/lib/utils"

type Client = {
  id: string
  name: string
}

const dummyClients: Client[] = [
  { id: "1", name: "Jane Smith" },
  { id: "2", name: "John Doe" },
  { id: "3", name: "Alice Johnson" },
  { id: "4", name: "Bob Lee" },
  { id: "5", name: "Maria Garcia" },
]

export const ClientDropdown = React.forwardRef<
  HTMLButtonElement,
  {
    value: string
    onChange: (value: string) => void
  }
>(({ value, onChange }, ref) => {
  const [open, setOpen] = React.useState(false)

  const selectedLabel = dummyClients.find((c) => c.id === value)?.name

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedLabel || "Select a client..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[9999]">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              {dummyClients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onChange(client.id)
                    setOpen(false)
                  }}
                >
                  {client.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === client.id ? "opacity-100" : "opacity-0"
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
})

ClientDropdown.displayName = "ClientDropdown"