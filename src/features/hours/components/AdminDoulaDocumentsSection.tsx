import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import {
  getAdminDoulaDocuments,
  reviewDoulaDocument,
  getDoulaDocumentUrl,
  REQUIRED_DOULA_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  type DocumentCompletenessItem,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import { FileText, Download, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface AdminDoulaDocumentsSectionProps {
  doulaId: string;
  doulaEmail?: string;
}

export function AdminDoulaDocumentsSection({
  doulaId,
  doulaEmail,
}: AdminDoulaDocumentsSectionProps) {
  const [items, setItems] = useState<DocumentCompletenessItem[]>([]);
  const [canBeActive, setCanBeActive] = useState(false);
  const [totalComplete, setTotalComplete] = useState(0);
  const [totalRequired, setTotalRequired] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<DocumentCompletenessItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    if (doulaId) fetchDocuments();
  }, [doulaId]);

  const fetchDocuments = async () => {
    if (!doulaId) return;
    setIsLoading(true);
    try {
      const data = await getAdminDoulaDocuments(doulaId);
      const rawItems = (data.completeness?.items ?? []) as unknown[];
      const completenessItems: DocumentCompletenessItem[] = rawItems.map((raw) => {
        const item = (raw ?? {}) as Record<string, unknown>;
        const documentId = item.document_id ?? item.documentId;
        const fileName = item.file_name ?? item.fileName;
        const uploadedAt = item.uploaded_at ?? item.uploadedAt;
        const rejectionReason = item.rejection_reason ?? item.rejectionReason;

        return {
          document_type: String(item.document_type ?? item.documentType ?? ''),
          status: String(item.status ?? 'missing'),
          document_id: typeof documentId === 'string' ? documentId : undefined,
          file_name: typeof fileName === 'string' ? fileName : undefined,
          uploaded_at: typeof uploadedAt === 'string' ? uploadedAt : undefined,
          rejection_reason:
            typeof rejectionReason === 'string' ? rejectionReason : undefined,
        };
      });
      const completenessByType = new Map<string, DocumentCompletenessItem>(
        completenessItems.map((item) => [item.document_type, item])
      );
      const documentsByType = new Map<
        string,
        { id?: string; fileName?: string; uploadedAt?: string; status?: string; rejectionReason?: string }
      >();

      for (const raw of (data.documents ?? []) as unknown[]) {
        const doc = (raw ?? {}) as Record<string, unknown>;
        const type = doc.document_type ?? doc.documentType;
        if (typeof type !== 'string' || !type) continue;
        documentsByType.set(type, {
          id:
            typeof (doc.id ?? doc.document_id ?? doc.documentId) === 'string'
              ? String(doc.id ?? doc.document_id ?? doc.documentId)
              : undefined,
          fileName:
            typeof (doc.file_name ?? doc.fileName) === 'string'
              ? String(doc.file_name ?? doc.fileName)
              : undefined,
          uploadedAt:
            typeof (doc.uploaded_at ?? doc.uploadedAt ?? doc.created_at) === 'string'
              ? String(doc.uploaded_at ?? doc.uploadedAt ?? doc.created_at)
              : undefined,
          status: typeof doc.status === 'string' ? doc.status : undefined,
          rejectionReason:
            typeof (doc.rejection_reason ?? doc.rejectionReason) === 'string'
              ? String(doc.rejection_reason ?? doc.rejectionReason)
              : undefined,
        });
      }

      const mergedItems: DocumentCompletenessItem[] =
        REQUIRED_DOULA_DOCUMENT_TYPES.map((type) => {
          const completeness = completenessByType.get(type);
          const document = documentsByType.get(type);
          if (document) {
            return {
              document_type: type,
              status: document.status ?? completeness?.status ?? 'uploaded',
              document_id: document.id ?? completeness?.document_id,
              file_name: document.fileName ?? completeness?.file_name,
              uploaded_at: document.uploadedAt ?? completeness?.uploaded_at,
              rejection_reason:
                document.rejectionReason ?? completeness?.rejection_reason,
            };
          }
          return (
            completeness ?? {
              document_type: type,
              status: 'missing',
            }
          );
        });

      setItems(mergedItems);
      setCanBeActive(data.completeness?.can_be_active ?? false);
      setTotalComplete(data.completeness?.total_complete ?? 0);
      setTotalRequired(data.completeness?.total_required ?? 5);
    } catch (error) {
      setItems([]);
      toast.error(error instanceof Error ? error.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const openReview = (item: DocumentCompletenessItem) => {
    setReviewingItem(item);
    setRejectReason('');
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!reviewingItem?.document_id) return;
    setIsReviewing(true);
    try {
      await reviewDoulaDocument(doulaId, reviewingItem.document_id, 'approved');
      toast.success('Document approved');
      setReviewDialogOpen(false);
      setReviewingItem(null);
      fetchDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewingItem?.document_id) return;
    setIsReviewing(true);
    try {
      await reviewDoulaDocument(doulaId, reviewingItem.document_id, 'rejected', rejectReason);
      toast.success('Document rejected');
      setReviewDialogOpen(false);
      setReviewingItem(null);
      setRejectReason('');
      fetchDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      const url = await getDoulaDocumentUrl(doulaId, documentId);
      window.open(url, '_blank');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open document');
    }
  };

  const handleDownloadDocument = async (documentId: string, fileName?: string) => {
    try {
      const url = await getDoulaDocumentUrl(doulaId, documentId);
      const response = await fetch(url, {
        credentials: 'omit',
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName?.trim() || 'doula-document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
      toast.success('Document downloaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download document');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'uploaded':
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending Review</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Missing</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardContent className="py-8 text-center text-gray-500">
          Loading required documents...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={`rounded-xl border shadow-sm ${
          canBeActive ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/30'
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Required Documents
            </CardTitle>
            <div className="flex items-center gap-2">
              {canBeActive ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              )}
              <span className="text-sm text-gray-600">
                {totalComplete}/{totalRequired} approved
              </span>
            </div>
          </div>
          {doulaEmail && (
            <p className="text-xs text-muted-foreground">
              Documents for: <strong>{doulaEmail}</strong>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {canBeActive
              ? 'All required documents are approved. Doula is eligible to be active.'
              : 'Some documents are missing or pending review. Doula cannot be activated until all are approved.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No document status available.</p>
          ) : (
            items.map((item) => (
              <div
                key={String(item.document_type)}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">
                      {(DOCUMENT_TYPE_LABELS as Record<string, string>)[item.document_type] ?? item.document_type}
                    </p>
                    {item.file_name && (
                      <p className="text-xs text-gray-500">{item.file_name}</p>
                    )}
                    {item.uploaded_at && (
                      <p className="text-xs text-gray-500">
                        Uploaded: {format(new Date(item.uploaded_at), 'MMM dd, yyyy')}
                      </p>
                    )}
                    {item.status === 'rejected' && item.rejection_reason && (
                      <p className="text-xs text-red-600">Reason: {item.rejection_reason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(item.status)}
                  {item.document_id && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(item.document_id!, item.file_name)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(item.document_id!)}
                      >
                        View
                      </Button>
                      {(item.status === 'uploaded' || item.status === 'pending') && (
                        <Button size="sm" onClick={() => openReview(item)}>
                          Review
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              {reviewingItem && (
                <>
                  {(DOCUMENT_TYPE_LABELS as Record<string, string>)[reviewingItem.document_type] ?? reviewingItem.document_type}
                  {reviewingItem.file_name && ` — ${reviewingItem.file_name}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rejection reason (if rejecting)</Label>
              <Textarea
                placeholder="Optional: Provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className='flex-row flex-wrap justify-end gap-2 sm:flex-nowrap'>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={isReviewing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={isReviewing}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              type="button"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={isReviewing}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
