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
import { useClients } from "@/common/hooks/clients/useClients"
import { User } from "@/common/types/user"
import { cn } from "@/lib/utils"

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

export function ClientsPicker() {
  const [clients, setClients] = React.useState<User[]>([]);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const { clients: hookClients, isLoading, error, getClients } = useClients();

  React.useEffect(() => {
    getClients();
  }, []);

  React.useEffect(() => {
    if (hookClients && hookClients.length > 0) {
      setClients(hookClients);
    }
  }, [hookClients]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? value : "Select clients..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search clients..." />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={`${client.firstname} ${client.lastname}`}
                  value={`${client.firstname} ${client.lastname}`}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {`${client.firstname} ${client.lastname}`}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === `${client.firstname} ${client.lastname}` ? "opacity-100" : "opacity-0"
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