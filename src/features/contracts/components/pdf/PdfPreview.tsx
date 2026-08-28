import { useTemplatesContext } from '@/features/contracts/contexts/TemplatesContext';
import { buildUrl, fetchWithAuth } from '@/api/http';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Separator } from '@/common/components/ui/separator';
import { ExternalLink } from 'lucide-react';

type PreviewSource = {
  /** URL usable in <a href> / iframe (signed GCS or blob:) */
  openUrl: string;
  /** Optional Office Online / public-style URL for DOCX embed */
  embedUrl: string | null;
  revoke?: () => void;
};

export function PdfPreview() {
  const { selectedTemplateName, templates } = useTemplatesContext();
  const [embedFailed, setEmbedFailed] = useState(false);
  const [source, setSource] = useState<PreviewSource | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const selected = useMemo(
    () => templates.find((t) => t.name === selectedTemplateName) ?? null,
    [templates, selectedTemplateName]
  );

  const storagePath =
    selected?.storagePath ||
    (selectedTemplateName ? `${selectedTemplateName}.docx` : null);

  const isPdf = !!storagePath?.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    let cancelled = false;
    let revoke: (() => void) | undefined;
    setEmbedFailed(false);
    setSource(null);
    setUrlError(null);

    if (!storagePath) return;

    (async () => {
      setLoadingUrl(true);
      try {
        const encoded = encodeURIComponent(storagePath);

        // Prefer short-lived GCS signed URL (Office Online can embed DOCX).
        const signedRes = await fetchWithAuth(
          buildUrl(`/contracts/templates/${encoded}/signed-url`),
          { cache: 'no-store', headers: {} }
        );
        if (signedRes.ok) {
          const data = (await signedRes.json()) as { url?: string };
          if (data.url && !cancelled) {
            setSource({
              openUrl: data.url,
              embedUrl: isPdf
                ? data.url
                : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(data.url)}`,
            });
            return;
          }
        }

        // Fallback: authenticated download → blob URL (works without SA signing).
        const dlRes = await fetchWithAuth(
          buildUrl(`/contracts/templates/${encoded}/download`),
          { cache: 'no-store', headers: {} }
        );
        if (!dlRes.ok) {
          throw new Error(`Could not load template (${dlRes.status})`);
        }
        const blob = await dlRes.blob();
        const blobUrl = URL.createObjectURL(blob);
        revoke = () => URL.revokeObjectURL(blobUrl);
        if (!cancelled) {
          setSource({
            openUrl: blobUrl,
            // Office Online cannot fetch blob: URLs
            embedUrl: isPdf ? blobUrl : null,
            revoke,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setUrlError(
            err instanceof Error ? err.message : 'Failed to load template'
          );
        }
      } finally {
        if (!cancelled) setLoadingUrl(false);
      }
    })();

    return () => {
      cancelled = true;
      revoke?.();
    };
  }, [storagePath, isPdf]);

  if (!selectedTemplateName) {
    return (
      <div className='flex items-center justify-center h-[min(70vh,720px)] border rounded-lg'>
        <p className='text-muted-foreground'>Select a template to preview.</p>
      </div>
    );
  }

  if (loadingUrl) {
    return (
      <div className='flex items-center justify-center h-[min(70vh,720px)] border rounded-lg'>
        <p className='text-muted-foreground'>Loading template preview…</p>
      </div>
    );
  }

  if (urlError || !source) {
    return (
      <div className='flex items-center justify-center h-[min(70vh,720px)] border rounded-lg'>
        <p className='text-muted-foreground'>
          {urlError ?? 'Select a template to preview.'}
        </p>
      </div>
    );
  }

  const viewerUrl = !embedFailed ? source.embedUrl : null;

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
          <a href={source.openUrl} target='_blank' rel='noreferrer'>
            <ExternalLink className='h-4 w-4 mr-2' />
            Open file
          </a>
        </Button>
      </div>

      <Separator />

      <div className='border border-t-0 rounded-b-md h-[min(70vh,720px)] w-full overflow-hidden bg-muted'>
        {viewerUrl ? (
          <iframe
            key={viewerUrl}
            title={`Preview ${selectedTemplateName}`}
            src={viewerUrl}
            className='h-full w-full bg-white'
            onError={() => setEmbedFailed(true)}
          />
        ) : (
          <div className='flex flex-col items-center justify-center h-full gap-3 px-6 text-center'>
            <p className='text-sm text-muted-foreground'>
              Inline preview is unavailable for this file. Open it in a new tab
              instead.
            </p>
            <Button asChild>
              <a href={source.openUrl} target='_blank' rel='noreferrer'>
                Open template
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
