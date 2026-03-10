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
  DOCUMENT_TYPE_LABELS,
  type DocumentCompletenessItem,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import { FileText, Download, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface AdminDoulaDocumentsSectionProps {
  doulaId: string;
}

export function AdminDoulaDocumentsSection({ doulaId }: AdminDoulaDocumentsSectionProps) {
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
      setItems(data.completeness?.items ?? []);
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
                key={item.document_type}
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
                        onClick={() => handleViewDocument(item.document_id!)}
                      >
                        <Download className="h-4 w-4 mr-1" />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} disabled={isReviewing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isReviewing}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={isReviewing}>
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
