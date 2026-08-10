import { useTemplatesContext } from '@/features/contracts/contexts/TemplatesContext';
import { useMemo, useState } from 'react';

import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Separator } from '@/common/components/ui/separator';
import { ExternalLink } from 'lucide-react';

function buildPublicStorageUrl(storagePath: string): string {
  const base = (
    import.meta.env.VITE_SUPABASE_URL as string | undefined
  )?.replace(/\/+$/, '');
  if (!base) {
    throw new Error('VITE_SUPABASE_URL is not configured');
  }
  const encodedPath = storagePath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${base}/storage/v1/object/public/contract-templates/${encodedPath}`;
}

export function PdfPreview() {
  const { selectedTemplateName, templates } = useTemplatesContext();
  const [embedFailed, setEmbedFailed] = useState(false);

  const selected = useMemo(
    () => templates.find((t) => t.name === selectedTemplateName) ?? null,
    [templates, selectedTemplateName]
  );

  const storagePath =
    selected?.storagePath ||
    (selectedTemplateName ? `${selectedTemplateName}.docx` : null);

  const publicUrl = useMemo(() => {
    if (!storagePath) return null;
    try {
      return buildPublicStorageUrl(storagePath);
    } catch {
      return null;
    }
  }, [storagePath]);

  const isPdf = !!storagePath?.toLowerCase().endsWith('.pdf');

  const viewerUrl = useMemo(() => {
    if (!publicUrl) return null;
    if (isPdf) return publicUrl;
    // Microsoft Office Online viewer for public DOCX URLs
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;
  }, [publicUrl, isPdf]);

  if (!selectedTemplateName || !viewerUrl || !publicUrl) {
    return (
      <div className='flex items-center justify-center h-[min(70vh,720px)] border rounded-lg'>
        <p className='text-muted-foreground'>Select a template to preview.</p>
      </div>
    );
  }

  return (
    <div className='relative w-full min-w-0'>
      <div className='flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border rounded-t-md'>
        <div className='flex items-center gap-2 text-sm font-medium min-w-0'>
          <span className='text-muted-foreground shrink-0'>Template:</span>
          <Badge variant='outline' className='truncate max-w-[min(100%,28rem)]'>
            {selectedTemplateName}
          </Badge>
        </div>
        <Button variant='outline' size='sm' asChild>
          <a href={publicUrl} target='_blank' rel='noreferrer'>
            <ExternalLink className='h-4 w-4 mr-2' />
            Open file
          </a>
        </Button>
      </div>

      <Separator />

      <div className='border border-t-0 rounded-b-md h-[min(70vh,720px)] w-full overflow-hidden bg-muted'>
        {embedFailed ? (
          <div className='flex flex-col items-center justify-center h-full gap-3 px-6 text-center'>
            <p className='text-sm text-muted-foreground'>
              Inline preview could not load. Open the file in a new tab instead.
            </p>
            <Button asChild>
              <a href={publicUrl} target='_blank' rel='noreferrer'>
                Open template
              </a>
            </Button>
          </div>
        ) : (
          <iframe
            key={viewerUrl}
            title={`Preview ${selectedTemplateName}`}
            src={viewerUrl}
            className='h-full w-full bg-white'
            onError={() => setEmbedFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
