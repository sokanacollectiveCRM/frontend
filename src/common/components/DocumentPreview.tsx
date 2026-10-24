import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';

export interface DocumentPreviewSource {
  url: string;
  fileName: string;
}

/** Signed private storage URLs stay inside the browser; no third-party viewer. */
export function DocumentPreview({
  source,
  onClose,
}: {
  source: DocumentPreviewSource | null;
  onClose: () => void;
}) {
  const isImage = /\.(jpe?g|png)$/i.test(source?.fileName ?? '');
  return (
    <Dialog
      open={Boolean(source)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='max-w-4xl' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{source?.fileName || 'Document preview'}</DialogTitle>
        </DialogHeader>
        {source &&
          (isImage ? (
            <img
              src={source.url}
              alt={source.fileName}
              className='max-h-[70vh] w-full object-contain'
            />
          ) : (
            <iframe
              title='PDF document preview'
              src={source.url}
              className='h-[70vh] w-full'
            />
          ))}
        {source && (
          <a
            href={source.url}
            target='_blank'
            rel='noopener noreferrer'
            className='underline'
          >
            Open document in a new tab
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}
