import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { NewTemplateDialog } from '@/features/contracts/components/dialog/NewTemplateDialog';
import { PdfPreview } from '@/features/contracts/components/pdf/PdfPreview';
import { useTemplatesContext } from '@/features/contracts/contexts/TemplatesContext';
import { useEffect } from 'react';
import { TemplateItem } from './TemplateItem';

export function Viewport() {
  const {
    templates,
    isLoading,
    error,
    getTemplates,
    selectedTemplateName,
    setSelectedTemplateName,
  } = useTemplatesContext();

  useEffect(() => {
    getTemplates();
  }, []);

  return (
    <div>
      <LoadingOverlay isLoading={isLoading} />

      <div className='flex flex-col-reverse xl:flex-row w-full flex-1 overflow-hidden px-2 sm:px-4 py-6 gap-6'>
        <div className='flex-1 min-w-0 overflow-y-auto'>
          {selectedTemplateName ? (
            <PdfPreview />
          ) : (
            <div className='flex items-center justify-center h-[min(70vh,720px)] border rounded-lg bg-muted/20'>
              <p className='text-muted-foreground'>
                Select a template to preview.
              </p>
            </div>
          )}
        </div>

        <Card className='w-full xl:w-[22rem] 2xl:w-96 shrink-0'>
          <CardHeader className='flex flex-row items-start justify-between gap-3 pb-3'>
            <div className='min-w-0'>
              <CardTitle className='text-lg pb-1'>Templates</CardTitle>
              <CardDescription>
                Click a template to preview or edit.
              </CardDescription>
            </div>
            <NewTemplateDialog onUploadSuccess={getTemplates} />
          </CardHeader>

          <CardContent className='p-4 pt-0'>
            <div className='flex flex-col gap-3'>
              {error && <p className='text-sm text-destructive'>{error}</p>}
              {!isLoading && !error && templates.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No templates found.
                </p>
              )}
              {templates.map((template) => (
                <TemplateItem
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateName === template.name}
                  onSelect={() => setSelectedTemplateName(template.name)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
