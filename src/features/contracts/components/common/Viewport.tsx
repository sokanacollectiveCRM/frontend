import { LoadingOverlay } from "@/common/components/loading/LoadingOverlay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { useTemplates } from "@/common/hooks/contracts/useTemplates";
import { useEffect, useState } from "react";
import { NewTemplateDialog } from "../dialog/NewTemplateDialog";
import { PdfPreview } from "../pdf/PdfPreview";
import { TemplateItem } from "./TemplateItem";

export function Viewport() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const { templates, isLoading, getTemplates } = useTemplates();

  // grab templates
  useEffect(() => {
    getTemplates()
  }, []);

  return (
    <div>
      <LoadingOverlay isLoading={isLoading} />

      <div className="flex flex-row lg:flex-row w-full flex-1 overflow-hidden px-4 py-10 gap-6">
        <div className="flex-1 overflow-y-auto">
          {selectedTemplateId ? (
            <>
              <PdfPreview />
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
            <NewTemplateDialog onUploadSuccess={getTemplates} />
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <div className="flex flex-col gap-2">

              {templates.map((template) => (
                <TemplateItem
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === Number(template.id)}
                  onSelect={() => setSelectedTemplateId(Number(template.id))}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}