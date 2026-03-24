import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getClientDocumentLabel,
  getClientDocumentUrl,
  isInsuranceCardDocument,
  listClientDocuments,
  type ClientDocument,
} from '@/api/clients/clientDocuments';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { toast } from 'sonner';
import { Download, ExternalLink, FileImage, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentsProps {
  clientId: string;
}

function formatUploadedAt(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return format(parsed, 'MMM dd, yyyy');
}

export default function Documents({ clientId }: DocumentsProps) {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const insuranceCards = useMemo(
    () => documents.filter(isInsuranceCardDocument),
    [documents]
  );

  const loadDocuments = useCallback(async () => {
    if (!clientId) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await listClientDocuments('staff', clientId);
      setDocuments(result);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load client documents'
      );
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleView = async (documentItem: ClientDocument) => {
    setActiveDocumentId(documentItem.id);
    try {
      const url =
        documentItem.url ||
        (await getClientDocumentUrl('staff', documentItem.id, clientId));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open document');
    } finally {
      setActiveDocumentId(null);
    }
  };

  const handleDownload = async (documentItem: ClientDocument) => {
    setActiveDocumentId(documentItem.id);
    try {
      const url =
        documentItem.url ||
        (await getClientDocumentUrl('staff', documentItem.id, clientId));
      const response = await fetch(url, {
        credentials: 'omit',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = documentItem.fileName || 'client-document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      toast.success('Document downloaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download document');
    } finally {
      setActiveDocumentId(null);
    }
  };

  return (
    <Card className='border shadow-sm'>
      <CardHeader className='flex flex-row items-start justify-between gap-4'>
        <div>
          <CardTitle>Client Documents</CardTitle>
          <p className='mt-1 text-sm text-muted-foreground'>
            Insurance cards uploaded from billing appear here for staff review.
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={() => void loadDocuments()} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Loading client documents...
          </div>
        ) : insuranceCards.length === 0 ? (
          <div className='rounded-lg border border-dashed p-6 text-sm text-muted-foreground'>
            No insurance card has been uploaded yet.
          </div>
        ) : (
          <div className='space-y-3'>
            {insuranceCards.map((documentItem) => {
              const uploadedAt = formatUploadedAt(documentItem.uploadedAt);
              const isActive = activeDocumentId === documentItem.id;

              return (
                <div
                  key={documentItem.id}
                  className='flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between'
                >
                  <div className='min-w-0 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <FileImage className='h-4 w-4 text-primary' />
                      <p className='truncate text-sm font-medium'>
                        {documentItem.fileName}
                      </p>
                      <Badge variant='secondary'>
                        {getClientDocumentLabel(documentItem.documentType)}
                      </Badge>
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {uploadedAt ? `Uploaded ${uploadedAt}` : 'Upload date unavailable'}
                    </div>
                    {documentItem.status ? (
                      <div className='text-xs text-muted-foreground capitalize'>
                        Status: {documentItem.status}
                      </div>
                    ) : null}
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => void handleView(documentItem)}
                      disabled={isActive}
                    >
                      <ExternalLink className='mr-1 h-4 w-4' />
                      {isActive ? 'Opening...' : 'View'}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => void handleDownload(documentItem)}
                      disabled={isActive}
                    >
                      <Download className='mr-1 h-4 w-4' />
                      {isActive ? 'Working...' : 'Download'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
