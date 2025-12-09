import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Badge } from '@/common/components/ui/badge';
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
  type DoulaDocument,
  type DocumentType,
} from '@/api/doulas/doulaService';
import { toast } from 'sonner';
import { FileText, Upload, Trash2, Download, X } from 'lucide-react';
import { format } from 'date-fns';

export default function DocumentsTab() {
  const [documents, setDocuments] = useState<DoulaDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DoulaDocument | null>(null);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    documentType: 'other' as DocumentType,
    notes: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getDoulaDocuments();
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        console.error('Invalid response format:', data);
        setDocuments([]);
        toast.error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]); // Set empty array on error
      toast.error(error.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm((prev) => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      await uploadDocument(uploadForm.file, uploadForm.documentType, uploadForm.notes || undefined);
      toast.success('Document uploaded successfully');
      setUploadDialogOpen(false);
      setUploadForm({ file: null, documentType: 'other', notes: '' });
      fetchDocuments();
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (document: DoulaDocument) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDoulaDocument(documentToDelete.id);
      toast.success('Document deleted successfully');
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'background_check':
        return 'Background Check';
      case 'license':
        return 'License';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>My Documents</h2>
          <p className='text-sm text-gray-600 mt-1'>
            Upload and manage your documents (max 10MB per file)
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className='h-4 w-4 mr-2' />
          Upload Document
        </Button>
      </div>

      {isLoading ? (
        <div className='text-center py-12'>
          <p className='text-gray-500'>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className='text-center py-12'>
            <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500 mb-4'>No documents uploaded yet</p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className='h-4 w-4 mr-2' />
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='mb-4'>
            <p className='text-sm text-gray-600'>
              Found {documents.length} document{documents.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {documents.map((doc, index) => (
                <Card key={doc.id || index} className='hover:shadow-md transition-shadow'>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-2'>
                        <FileText className='h-5 w-5 text-blue-600' />
                        <div>
                          <CardTitle className='text-sm font-medium'>
                            {doc.fileName || doc.name || 'Untitled Document'}
                          </CardTitle>
                          <Badge
                            className={`mt-1 text-xs ${getStatusBadgeColor(doc.status || 'pending')}`}
                          >
                            {doc.status || 'pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <p className='text-xs text-gray-500'>Type</p>
                      <p className='text-sm font-medium'>
                        {getDocumentTypeLabel(doc.documentType || doc.type || 'other')}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Size</p>
                      <p className='text-sm'>
                        {formatFileSize(doc.fileSize || doc.size || 0)}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Uploaded</p>
                      <p className='text-sm'>
                        {doc.uploadedAt || doc.created_at || doc.uploaded_at
                          ? format(
                              new Date(doc.uploadedAt || doc.created_at || doc.uploaded_at),
                              'MMM dd, yyyy'
                            )
                          : 'Unknown'}
                      </p>
                    </div>
                    {doc.notes && (
                      <div>
                        <p className='text-xs text-gray-500'>Notes</p>
                        <p className='text-sm text-gray-700'>{doc.notes}</p>
                      </div>
                    )}
                    <div className='flex gap-2 pt-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          // Open the document URL directly
                          // Backend should provide signed URLs for private buckets
                          const url = doc.fileUrl || doc.url || doc.file_url;
                          if (!url) {
                            console.error('No URL found for document:', doc);
                            toast.error('Document URL not available');
                            return;
                          }

                          // Open the document in a new tab
                          // If the URL is invalid, the browser will show an error
                          const newWindow = window.open(url, '_blank');
                          
                          // Check if popup was blocked
                          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                            toast.error('Popup blocked. Please allow popups for this site.');
                          }
                        }}
                        className='flex-1'
                      >
                        <Download className='h-4 w-4 mr-1' />
                        View
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDeleteClick(doc)}
                        className='text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document (PDF, DOC, DOCX, JPG, PNG - max 10MB)
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='document-type'>Document Type</Label>
              <select
                id='document-type'
                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                value={uploadForm.documentType}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    documentType: e.target.value as DocumentType,
                  }))
                }
              >
                <option value='background_check'>Background Check</option>
                <option value='license'>License</option>
                <option value='other'>Other</option>
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='file'>File</Label>
              <Input
                id='file'
                type='file'
                accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                onChange={handleFileSelect}
              />
              {uploadForm.file && (
                <p className='text-sm text-gray-600'>
                  Selected: {uploadForm.file.name} (
                  {formatFileSize(uploadForm.file.size)})
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='notes'>Notes (Optional)</Label>
              <Input
                id='notes'
                value={uploadForm.notes}
                onChange={(e) =>
                  setUploadForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder='Add any notes about this document...'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setUploadDialogOpen(false);
                setUploadForm({ file: null, documentType: 'other', notes: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !uploadForm.file}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {documentToDelete && (
            <div className='py-4'>
              <p className='text-sm font-medium'>{documentToDelete.fileName}</p>
              <p className='text-xs text-gray-500 mt-1'>
                {getDocumentTypeLabel(documentToDelete.documentType)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
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

