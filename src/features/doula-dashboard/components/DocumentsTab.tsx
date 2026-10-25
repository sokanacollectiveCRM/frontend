import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
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
  DOULA_DOCUMENT_META,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  PORTAL_DOULA_DOCUMENT_TYPES,
  type DoulaDocument,
  type DocumentType,
  type DocumentCompleteness,
  type PortalDocumentType,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Pencil,
} from 'lucide-react';
import { format } from 'date-fns';

const DEFAULT_DOCUMENT_TYPE: PortalDocumentType = 'training_certificate';

interface DocFileState {
  documentId: string;
  fileName?: string;
  uploadedAt?: string;
  status: string;
  rejectionReason?: string;
  fileUrl?: string | null;
}

interface DocItemState {
  documentType: PortalDocumentType;
  files: DocFileState[];
}

function toFileState(doc: DoulaDocument): DocFileState {
  return {
    documentId: doc.id,
    fileName: doc.fileName,
    uploadedAt: doc.uploadedAt,
    status: doc.status ?? 'uploaded',
    rejectionReason: doc.rejectionReason ?? undefined,
    fileUrl: doc.fileUrl,
  };
}

export default function DocumentsTab({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [items, setItems] = useState<DocItemState[]>([]);
  const [completeness, setCompleteness] = useState<DocumentCompleteness | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadingForType, setUploadingForType] =
    useState<PortalDocumentType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<{
    documentType: PortalDocumentType;
    file: DocFileState;
  } | null>(null);
  const [editForm, setEditForm] = useState<{
    fileName: string;
    documentType: PortalDocumentType;
  }>({
    fileName: '',
    documentType: DEFAULT_DOCUMENT_TYPE,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{
    documentType: PortalDocumentType;
    file: DocFileState;
  } | null>(null);
  const [uploadForm, setUploadForm] = useState<{
    file: File | null;
    documentType: PortalDocumentType;
  }>({
    file: null,
    documentType: DEFAULT_DOCUMENT_TYPE,
  });
  const [uploadError, setUploadError] = useState('');
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

      const docsByType = new Map<string, DoulaDocument[]>();
      for (const doc of data.documents) {
        const type = doc.documentType;
        const existing = docsByType.get(type) ?? [];
        existing.push(doc);
        docsByType.set(type, existing);
      }

      setItems(
        PORTAL_DOULA_DOCUMENT_TYPES.map((type) => {
          const meta = DOULA_DOCUMENT_META[type];
          const docs = docsByType.get(type) ?? [];
          const files = meta.multiple
            ? docs.map(toFileState)
            : docs.slice(0, 1).map(toFileState);
          return { documentType: type, files };
        })
      );
    } catch (error: unknown) {
      setItems(
        PORTAL_DOULA_DOCUMENT_TYPES.map((type) => ({
          documentType: type,
          files: [],
        }))
      );
      toast.error(
        error instanceof Error ? error.message : 'Failed to load documents'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (file) setUploadForm((prev) => ({ ...prev, file }));
  };

  const openUploadFor = (type: PortalDocumentType) => {
    setUploadError('');
    setUploadForm({ file: null, documentType: type });
    setUploadingForType(type);
    setUploadDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file');
      return;
    }

    setUploadError('');
    setIsUploading(true);
    try {
      await uploadDocument(
        uploadForm.file,
        uploadForm.documentType as DocumentType
      );
      window.dispatchEvent(new Event('doula-documents-changed'));
      toast.success('Document uploaded successfully');
      setUploadDialogOpen(false);
      setUploadingForType(null);
      setUploadForm({ file: null, documentType: DEFAULT_DOCUMENT_TYPE });
      fetchDocuments();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload document';
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (
    documentType: PortalDocumentType,
    file: DocFileState
  ) => {
    setDocumentToDelete({ documentType, file });
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (
    documentType: PortalDocumentType,
    file: DocFileState
  ) => {
    setDocumentToEdit({ documentType, file });
    setEditForm({
      fileName: file.fileName ?? '',
      documentType,
    });
    setEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!documentToEdit?.file.documentId) return;
    const trimmedName = editForm.fileName.trim();
    if (!trimmedName) {
      toast.error('Please enter a file name');
      return;
    }

    const updateData: { fileName?: string; documentType?: DocumentType } = {};
    if (trimmedName !== (documentToEdit.file.fileName ?? '').trim()) {
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
      await updateDoulaDocumentMetadata(
        documentToEdit.file.documentId,
        updateData
      );
      window.dispatchEvent(new Event('doula-documents-changed'));
      toast.success('Document updated successfully');
      setEditDialogOpen(false);
      setDocumentToEdit(null);
      setEditForm({
        fileName: '',
        documentType: DEFAULT_DOCUMENT_TYPE,
      });
      void fetchDocuments();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update document'
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete?.file.documentId) return;
    try {
      await deleteDoulaDocument(documentToDelete.file.documentId);
      window.dispatchEvent(new Event('doula-documents-changed'));
      toast.success('Document deleted successfully');
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete document'
      );
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
  const totalRequired = completeness?.total_required ?? 1;
  const canBeActive = completeness?.can_be_active ?? false;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-start'>
        <div>
          {!embedded && (
            <h2 className='text-xl font-semibold text-gray-900'>Documents</h2>
          )}
          <p className='text-sm text-gray-600 mt-1'>
            The doula training certificate is required. An admin must approve it
            for full profile completion. Your dashboard tools remain available
            while documents are incomplete or pending review. Max 10MB per file
            (PDF, PNG, JPG).
          </p>
        </div>
      </div>

      {completeness && (
        <Card
          className={
            canBeActive
              ? 'border-green-200 bg-green-50/50'
              : 'border-amber-200 bg-amber-50/50'
          }
        >
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              {canBeActive ? (
                <CheckCircle2 className='h-8 w-8 text-green-600' />
              ) : (
                <AlertCircle className='h-8 w-8 text-amber-600' />
              )}
              <div>
                <p className='font-medium'>
                  {canBeActive
                    ? 'All required documents are complete and approved.'
                    : `${totalComplete} of ${totalRequired} documents approved.`}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {canBeActive
                    ? 'Required documents are approved for profile completion.'
                    : completeness.missing_types?.length
                      ? `Missing: ${completeness.missing_types
                          .map(
                            (type) =>
                              DOCUMENT_TYPE_LABELS[type as DocumentType] ?? type
                          )
                          .join(', ')}`
                      : 'Some documents are pending review.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className='text-center py-12'>
          <p className='text-gray-500'>Loading documents...</p>
        </div>
      ) : (
        <div
          data-testid='profile-documents-grid'
          className='grid grid-cols-1 items-start gap-4 md:grid-cols-2'
        >
          {items.map((item) => {
            const meta = DOULA_DOCUMENT_META[item.documentType];
            const primary = item.files[0];
            const slotStatus = primary?.status ?? 'missing';
            return (
              <Card
                key={item.documentType}
                data-testid={`document-slot-${item.documentType}`}
                className={
                  meta.required &&
                  !meta.multiple &&
                  (slotStatus === 'missing' || slotStatus === 'rejected')
                    ? 'border-l-4 border-l-amber-500'
                    : ''
                }
              >
                <CardHeader className='pb-2'>
                  <div className='flex flex-row items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <FileText className='h-5 w-5 text-blue-600' />
                      <div>
                        <CardTitle
                          className={
                            meta.required &&
                            (slotStatus === 'missing' ||
                              slotStatus === 'rejected')
                              ? 'text-base text-red-600'
                              : 'text-base'
                          }
                        >
                          {meta.label}
                        </CardTitle>
                        <div className='mt-1 flex flex-wrap items-center gap-2'>
                          <Badge
                            className={
                              meta.required
                                ? 'text-xs bg-red-50 text-red-600 border border-red-200'
                                : 'text-xs bg-white text-gray-700 border border-gray-200'
                            }
                          >
                            {meta.required ? 'Required' : 'Optional'}
                          </Badge>
                          {!meta.multiple && (
                            <Badge
                              className={`text-xs ${getStatusBadgeVariant(slotStatus)}`}
                            >
                              {DOCUMENT_STATUS_LABELS[slotStatus] ?? slotStatus}
                            </Badge>
                          )}
                        </div>
                        {meta.helperText && (
                          <p className='text-xs text-muted-foreground mt-1'>
                            {meta.helperText}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type='button'
                      size='sm'
                      variant={item.files.length === 0 ? 'default' : 'outline'}
                      onClick={() => openUploadFor(item.documentType)}
                    >
                      <Upload className='h-4 w-4 mr-1' />
                      {meta.multiple || item.files.length === 0
                        ? 'Upload'
                        : 'Replace'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {item.files.map((file) => (
                    <div
                      key={file.documentId}
                      className='space-y-1 border-t border-gray-100 pt-2'
                    >
                      {meta.multiple && (
                        <Badge
                          className={`text-xs ${getStatusBadgeVariant(file.status)}`}
                        >
                          {DOCUMENT_STATUS_LABELS[file.status] ?? file.status}
                        </Badge>
                      )}
                      {file.fileName && (
                        <p className='text-sm text-gray-600'>
                          File: {file.fileName}
                        </p>
                      )}
                      {file.uploadedAt && (
                        <p className='text-xs text-gray-500'>
                          Uploaded:{' '}
                          {format(new Date(file.uploadedAt), 'MMM dd, yyyy')}
                        </p>
                      )}
                      {file.status === 'rejected' && file.rejectionReason && (
                        <p className='text-sm text-red-600'>
                          Reason: {file.rejectionReason}
                        </p>
                      )}
                      <div className='flex gap-2 pt-2'>
                        {file.fileUrl && (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              window.open(file.fileUrl ?? undefined, '_blank')
                            }
                          >
                            <Download className='h-4 w-4 mr-1' />
                            View
                          </Button>
                        )}
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handleEditClick(item.documentType, file)
                          }
                        >
                          <Pencil className='h-4 w-4 mr-1' />
                          Edit
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                          onClick={() =>
                            handleDeleteClick(item.documentType, file)
                          }
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Upload{' '}
              {DOCUMENT_TYPE_LABELS[
                uploadingForType ?? uploadForm.documentType
              ] ?? uploadForm.documentType}
            </DialogTitle>
            <DialogDescription>PDF, PNG, or JPG — max 10MB</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>File</Label>
              <label
                htmlFor='file'
                className='flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-primary/40 transition-colors'
              >
                <input
                  id='file'
                  type='file'
                  accept='.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
                  aria-describedby='document-upload-error'
                  aria-invalid={Boolean(uploadError)}
                  onChange={handleFileSelect}
                  className='hidden'
                />
                {uploadForm.file ? (
                  <div className='flex flex-col items-center gap-2 p-4'>
                    <FileText className='h-10 w-10 text-primary' />
                    <span className='text-sm font-medium text-gray-700 truncate max-w-[200px]'>
                      {uploadForm.file.name}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {formatFileSize(uploadForm.file.size)}
                    </span>
                    <span className='text-xs text-primary'>
                      Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-2 p-4'>
                    <Upload className='h-10 w-10 text-gray-400' />
                    <span className='text-sm font-medium text-gray-700'>
                      Click to browse or drag and drop
                    </span>
                    <span className='text-xs text-gray-500'>
                      PDF, PNG, or JPG (max 10MB)
                    </span>
                  </div>
                )}
              </label>
              {uploadError && (
                <p
                  id='document-upload-error'
                  role='alert'
                  className='text-sm text-red-600'
                >
                  {uploadError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleUpload}
              disabled={isUploading || !uploadForm.file}
            >
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
              documentType: DEFAULT_DOCUMENT_TYPE,
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
          <div className='space-y-2 py-4'>
            <Label htmlFor='edit-file-name'>File name</Label>
            <Input
              id='edit-file-name'
              value={editForm.fileName}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, fileName: e.target.value }))
              }
              placeholder='Enter file name'
            />
            <div className='pt-2 space-y-2'>
              <Label htmlFor='edit-document-type'>Document type</Label>
              <Select
                value={editForm.documentType}
                onValueChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    documentType: value as PortalDocumentType,
                  }))
                }
              >
                <SelectTrigger id='edit-document-type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PORTAL_DOULA_DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {DOCUMENT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleEditConfirm}
              disabled={isSavingEdit || !editForm.fileName.trim()}
            >
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
              Are you sure you want to delete this document? You will need to
              upload a new one.
            </DialogDescription>
          </DialogHeader>
          {documentToDelete && (
            <div className='py-4'>
              <p className='text-sm font-medium'>
                {documentToDelete.file.fileName}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {DOCUMENT_TYPE_LABELS[documentToDelete.documentType]}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
