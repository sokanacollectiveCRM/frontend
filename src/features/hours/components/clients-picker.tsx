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

export function ClientsPicker({client, setClient}: { client: User | undefined; setClient: (client: User) => void }) {
  const [clients, setClients] = React.useState<User[]>([]);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const { clients: hookClients, getClients } = useClients();

  React.useEffect(() => {
    getClients();
  }, []);

  React.useEffect(() => {
    if (hookClients && hookClients.length > 0) {
      setClients(hookClients);
    }
  }, [hookClients]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {client ? `${client.firstname} ${client.lastname}` : "Select clients..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search clients..." />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              {clients.map((listClient) => (
                <CommandItem
                  key={`${listClient.firstname} ${listClient.lastname}`}
                  value={`${listClient.firstname} ${listClient.lastname}`}
                  onSelect={() => {
                    setOpen(false)
                    setClient(listClient)
                    console.log("onSelect clicked");
                  }}
                >
                  {`${listClient.firstname} ${listClient.lastname}`}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === `${listClient.firstname} ${listClient.lastname}` ? "opacity-100" : "opacity-0"
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