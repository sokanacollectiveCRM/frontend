import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Badge } from '@/common/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import {
  getDoulaDocuments,
  uploadDocument,
  deleteDoulaDocument,
  updateDoulaDocumentMetadata,
  REQUIRED_DOULA_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  type DoulaDocument,
  type DocumentType,
  type DocumentCompleteness,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import { FileText, Upload, Trash2, Download, AlertCircle, CheckCircle2, Pencil } from 'lucide-react';
import { format } from 'date-fns';

type RequiredDocType = (typeof REQUIRED_DOULA_DOCUMENT_TYPES)[number];

interface DocItemState {
  documentType: RequiredDocType;
  status: string;
  documentId?: string;
  fileName?: string;
  uploadedAt?: string;
  rejectionReason?: string;
  fileUrl?: string | null;
}

export default function DocumentsTab() {
  const [items, setItems] = useState<DocItemState[]>([]);
  const [completeness, setCompleteness] = useState<DocumentCompleteness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadingForType, setUploadingForType] = useState<RequiredDocType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<DocItemState | null>(null);
  const [editForm, setEditForm] = useState<{
    fileName: string;
    documentType: RequiredDocType;
  }>({
    fileName: '',
    documentType: 'background_check',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocItemState | null>(null);
  const [uploadForm, setUploadForm] = useState<{
    file: File | null;
    documentType: RequiredDocType;
  }>({
    file: null,
    documentType: 'background_check',
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getDoulaDocuments();
      const comp = data.completeness;
      setCompleteness(comp ?? null);

      const docMap = new Map<string, DoulaDocument>();
      for (const doc of data.documents) {
        const type = doc.documentType;
        if (REQUIRED_DOULA_DOCUMENT_TYPES.includes(type as RequiredDocType)) {
          docMap.set(type, doc);
        }
      }

      const built: DocItemState[] = REQUIRED_DOULA_DOCUMENT_TYPES.map((type) => {
        const doc = docMap.get(type);
        const item = comp?.items?.find((i) => i.document_type === type);
        if (doc) {
          return {
            documentType: type,
            status: doc.status ?? item?.status ?? 'uploaded',
            documentId: doc.id,
            fileName: doc.fileName,
            uploadedAt: doc.uploadedAt,
            rejectionReason: doc.rejectionReason ?? item?.rejection_reason,
            fileUrl: doc.fileUrl,
          };
        }
        return {
          documentType: type,
          status: item?.status ?? 'missing',
          documentId: item?.document_id,
          fileName: item?.file_name,
          uploadedAt: item?.uploaded_at,
          rejectionReason: item?.rejection_reason,
        };
      });
      setItems(built);
    } catch (error: unknown) {
      setItems(
        REQUIRED_DOULA_DOCUMENT_TYPES.map((type) => ({
          documentType: type,
          status: 'missing',
        }))
      );
      toast.error(error instanceof Error ? error.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadForm((prev) => ({ ...prev, file }));
  };

  const openUploadFor = (type: RequiredDocType) => {
    setUploadForm({ file: null, documentType: type });
    setUploadingForType(type);
    setUploadDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      await uploadDocument(uploadForm.file, uploadForm.documentType as DocumentType);
      toast.success('Document uploaded successfully');
      setUploadDialogOpen(false);
      setUploadingForType(null);
      setUploadForm({ file: null, documentType: 'background_check' });
      fetchDocuments();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (item: DocItemState) => {
    if (!item.documentId) return;
    setDocumentToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (item: DocItemState) => {
    if (!item.documentId) return;
    setDocumentToEdit(item);
    setEditForm({
      fileName: item.fileName ?? '',
      documentType: item.documentType,
    });
    setEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!documentToEdit?.documentId) return;
    const trimmedName = editForm.fileName.trim();
    if (!trimmedName) {
      toast.error('Please enter a file name');
      return;
    }

    const updateData: { fileName?: string; documentType?: DocumentType } = {};
    if (trimmedName !== (documentToEdit.fileName ?? '').trim()) {
      updateData.fileName = trimmedName;
    }
    if (editForm.documentType !== documentToEdit.documentType) {
      updateData.documentType = editForm.documentType;
    }
    if (!updateData.fileName && !updateData.documentType) {
      toast.error('No changes to save');
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = await updateDoulaDocumentMetadata(documentToEdit.documentId, updateData);
      const updatedType = updated.documentType as RequiredDocType;
      const originalType = documentToEdit.documentType;

      setItems((prev) =>
        prev.map((entry) => {
          if (entry.documentType === updatedType) {
            return {
              ...entry,
              status: updated.status,
              documentId: updated.id,
              fileName: updated.fileName,
              uploadedAt: updated.uploadedAt,
              rejectionReason: updated.rejectionReason ?? undefined,
              fileUrl: updated.fileUrl,
            };
          }
          if (originalType !== updatedType && entry.documentType === originalType) {
            return {
              ...entry,
              status: 'missing',
              documentId: undefined,
              fileName: undefined,
              uploadedAt: undefined,
              rejectionReason: undefined,
              fileUrl: undefined,
            };
          }
          return entry;
        })
      );

      toast.success('Document updated successfully');
      setEditDialogOpen(false);
      setDocumentToEdit(null);
      setEditForm({
        fileName: '',
        documentType: 'background_check',
      });
      void fetchDocuments();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update document');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete?.documentId) return;
    try {
      await deleteDoulaDocument(documentToDelete.documentId);
      toast.success('Document deleted successfully');
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'uploaded':
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const totalComplete = completeness?.total_complete ?? 0;
  const totalRequired = completeness?.total_required ?? 5;
  const canBeActive = completeness?.can_be_active ?? false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Required Documents</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload all 5 required documents to be eligible for active status. Max 10MB per file (PDF, PNG, JPG).
          </p>
        </div>
      </div>

      {completeness && (
        <Card className={canBeActive ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {canBeActive ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-amber-600" />
              )}
              <div>
                <p className="font-medium">
                  {canBeActive
                    ? 'All required documents are complete and approved.'
                    : `${totalComplete} of ${totalRequired} documents approved.`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {canBeActive
                    ? 'You are eligible to be active.'
                    : completeness.missing_types?.length
                    ? `Missing: ${completeness.missing_types.join(', ')}`
                    : 'Some documents are pending review.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading documents...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item.documentType}
              className={
                item.status === 'missing' || item.status === 'rejected'
                  ? 'border-l-4 border-l-amber-500'
                  : ''
              }
            >
              <CardHeader className="pb-2">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">
                        {DOCUMENT_TYPE_LABELS[item.documentType] ?? item.documentType}
                      </CardTitle>
                      <Badge className={`mt-1 text-xs ${getStatusBadgeVariant(item.status)}`}>
                        {DOCUMENT_STATUS_LABELS[item.status] ?? item.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={item.status === 'missing' ? 'default' : 'outline'}
                    onClick={() => openUploadFor(item.documentType)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {item.status === 'missing' ? 'Upload' : 'Replace'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.fileName && (
                  <p className="text-sm text-gray-600">File: {item.fileName}</p>
                )}
                {item.uploadedAt && (
                  <p className="text-xs text-gray-500">
                    Uploaded: {format(new Date(item.uploadedAt), 'MMM dd, yyyy')}
                  </p>
                )}
                {item.status === 'rejected' && item.rejectionReason && (
                  <p className="text-sm text-red-600">Reason: {item.rejectionReason}</p>
                )}
                {item.documentId && (
                  <div className="flex gap-2 pt-2">
                    {item.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(item.fileUrl ?? undefined, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(item)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {uploadingForType ? 'Upload' : 'Replace'}{' '}
              {DOCUMENT_TYPE_LABELS[uploadForm.documentType] ?? uploadForm.documentType}
            </DialogTitle>
            <DialogDescription>
              PDF, PNG, or JPG — max 10MB
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>File</Label>
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-primary/40 transition-colors"
              >
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadForm.file ? (
                  <div className="flex flex-col items-center gap-2 p-4">
                    <FileText className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                      {uploadForm.file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(uploadForm.file.size)}
                    </span>
                    <span className="text-xs text-primary">Click to choose a different file</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to browse or drag and drop
                    </span>
                    <span className="text-xs text-gray-500">PDF, PNG, or JPG (max 10MB)</span>
                  </div>
                )}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !uploadForm.file}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setDocumentToEdit(null);
            setEditForm({
              fileName: '',
              documentType: 'background_check',
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the file name and document type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="edit-file-name">File name</Label>
            <Input
              id="edit-file-name"
              value={editForm.fileName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, fileName: e.target.value }))}
              placeholder="Enter file name"
            />
            <div className="pt-2 space-y-2">
              <Label htmlFor="edit-document-type">Document type</Label>
              <Select
                value={editForm.documentType}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, documentType: value as RequiredDocType }))
                }
              >
                <SelectTrigger id="edit-document-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUIRED_DOULA_DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {DOCUMENT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditConfirm} disabled={isSavingEdit || !editForm.fileName.trim()}>
              {isSavingEdit ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? You will need to upload a new one.
            </DialogDescription>
          </DialogHeader>
          {documentToDelete && (
            <div className="py-4">
              <p className="text-sm font-medium">{documentToDelete.fileName}</p>
              <p className="text-xs text-gray-500 mt-1">
                {DOCUMENT_TYPE_LABELS[documentToDelete.documentType]}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
