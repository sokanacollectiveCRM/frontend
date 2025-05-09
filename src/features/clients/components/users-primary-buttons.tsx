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

  const fetchCSV = async() => {
    const token = localStorage.getItem('authToken');
    try {
      const data = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}clients/fetchCSV`,{
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const csvData = await data.text();
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "demographics.csv"; 
      document.body.appendChild(a);
      a.click();
      a.remove();


    } catch (error) {
      throw new Error(`Error Retrieving CSV${error}`)
    }
  }
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
      <Button className="space-x-1" onClick={fetchCSV}>
            <span>Export Demographics</span>
            <SquarePlus size={18} />
      </Button>
    </div>
  )
}