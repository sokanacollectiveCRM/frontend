import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { ScrollArea, ScrollBar } from "@/common/components/ui/scroll-area";
import { Separator } from "@/common/components/ui/separator";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TemplateItem } from "./TemplateItem";

const dummyTemplates = [
  { id: 1, name: 'NDA Template' },
  { id: 2, name: 'Employment Offer' },
  { id: 3, name: 'Freelancer Agreement' },
  { id: 4, name: 'Partnership Terms' },
  { id: 5, name: 'Contractor Agreement' },
  { id: 6, name: 'Internship Offer' },
  { id: 7, name: 'Consulting Agreement' },
]

export function Viewport() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)

  return (
    <div className="flex flex-row lg:flex-row w-full flex-1 overflow-hidden px-4 py-10 gap-6">
      <div className="flex-1 overflow-y-auto">
        {selectedTemplateId ? (
          <>
            <h2 className="text-xl font-bold mb-2">
              Preview: {dummyTemplates.find(t => t.id === selectedTemplateId)?.name}
            </h2>
            <Separator className="my-4" />
            <div className="min-h-[500px] p-4 border rounded-lg">
              <p className="text-muted-foreground">Template content would be shown here.</p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[500px] border rounded-lg">
            <p className="text-muted-foreground">Select a template to preview.</p>
          </div>
        )}
      </div>

      <Card className="w-60 flex-shrink-0">
        <CardHeader className="flex flex-row items-center justify-between  pb-2">
          <div>
            <CardTitle className='text-l pb-1'> Templates </CardTitle>
            <CardDescription> Click on a template to view or edit </CardDescription>
          </div>
          <Button size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <ScrollArea className="pr-2">
            <div className="flex flex-col gap-2">
              {dummyTemplates.map((template) => (
                <TemplateItem
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === template.id}
                  onSelect={() => setSelectedTemplateId(template.id)}
                />
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}