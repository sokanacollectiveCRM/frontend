import { useState, useEffect, useRef } from 'react';
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
  getDoulaProfile,
  uploadDocument,
  deleteDoulaDocument,
  updateDoulaDocumentMetadata,
  REQUIRED_DOULA_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  type DoulaDocument,
  type DocumentType,
  type DocumentCompleteness,
  type DoulaProfile,
} from '@/api/doulas/doulaService';
import { isDoulaRaceEthnicityComplete, RACE_ETHNICITY_FIELD_LABEL } from '@/features/doula-dashboard/doulaDemographics';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Upload,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Pencil,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';

type RequiredDocType = (typeof REQUIRED_DOULA_DOCUMENT_TYPES)[number];

interface DocItemState {
  documentType: RequiredDocType;
  status: string;
  documentId?: string;
  fileName?: string;
  uploadedAt?: string;
  rejectionReason?: string;
  fileUrl?: string | null;
  notes?: string | null;
  expirationDate?: string | null;
}

export default function DocumentsTab() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedDocumentType = REQUIRED_DOULA_DOCUMENT_TYPES.find(
    (type) => type === searchParams.get('documentType')
  );
  const [items, setItems] = useState<DocItemState[]>([]);
  const [completeness, setCompleteness] = useState<DocumentCompleteness | null>(
    null
  );
  const [profileMissingFields, setProfileMissingFields] = useState<string[] | null>(null);
  const [profileSummaryUnavailable, setProfileSummaryUnavailable] = useState(false);
  const [backgroundCheckGuidance, setBackgroundCheckGuidance] = useState('');
  const [backgroundCheckFormUrl, setBackgroundCheckFormUrl] = useState('');
  const [backgroundCheckRequired, setBackgroundCheckRequired] = useState(false);
  const documentsHeadingRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadingForType, setUploadingForType] =
    useState<RequiredDocType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<DocItemState | null>(
    null
  );
  const [editForm, setEditForm] = useState<{
    fileName: string;
    documentType: RequiredDocType;
  }>({
    fileName: '',
    documentType: 'background_check',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocItemState | null>(
    null
  );
  const [uploadForm, setUploadForm] = useState<{
    file: File | null;
    documentType: RequiredDocType;
    expirationDate: string;
  }>({
    file: null,
    documentType: 'background_check',
    expirationDate: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [documentsResult, profileResult] = await Promise.allSettled([
        getDoulaDocuments(),
        getDoulaProfile(),
      ]);
      if (documentsResult.status === 'rejected') throw documentsResult.reason;
      const data = documentsResult.value;
      if (profileResult.status === 'fulfilled') {
        const profile: DoulaProfile = profileResult.value;
        const missing = [
          ['First Name', profile.firstname],
          ['Last Name', profile.lastname],
          ['Phone', profile.phone ?? profile.phone_number],
          ['Address', profile.address],
          ['City', profile.city],
          ['State', profile.state],
          ['Zip Code', profile.zip_code],
          ['Country', profile.country],
          ['Bio', profile.bio],
          ['Pronouns', profile.pronouns],
        ]
          .filter(([, value]) => !String(value ?? '').trim())
          .map(([label]) => String(label));
        if (!profile.languages_other_than_english?.some((language) => language.trim())) {
          missing.push('Languages spoken (other than English)');
        }
        if (!isDoulaRaceEthnicityComplete(profile.race_ethnicity, profile.race_ethnicity_other)) {
          missing.push(RACE_ETHNICITY_FIELD_LABEL);
        }
        setProfileMissingFields(missing);
        setProfileSummaryUnavailable(false);
      } else {
        setProfileMissingFields(null);
        setProfileSummaryUnavailable(true);
      }
      const comp = data.completeness;
      setCompleteness(comp ?? null);
      setBackgroundCheckGuidance(
        data.onboarding?.background_check_guidance ?? ''
      );
      setBackgroundCheckFormUrl(
        data.onboarding?.background_check_form_url ?? ''
      );
      setBackgroundCheckRequired(
        data.onboarding?.background_check_required ??
          Boolean(data.onboarding?.background_check_form_url)
      );

      const docMap = new Map<string, DoulaDocument>();
      for (const doc of data.documents) {
        const type = doc.documentType;
        if (REQUIRED_DOULA_DOCUMENT_TYPES.includes(type as RequiredDocType)) {
          docMap.set(type, doc);
        }
      }

      const built: DocItemState[] = REQUIRED_DOULA_DOCUMENT_TYPES.map(
        (type) => {
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
              notes: doc.notes,
              expirationDate: doc.expirationDate,
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
        }
      );
      setItems(built);
    } catch (error: unknown) {
      setItems([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : 'We couldn’t load your documents. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadForm((prev) => ({ ...prev, file }));
  };

  const openUploadFor = (type: RequiredDocType) => {
    const previous = items.find((item) => item.documentType === type);
    const expirationDate =
      previous?.notes?.match(/Expiration date:\s*(\d{4}-\d{2}-\d{2})/i)?.[1] ??
      '';
    setUploadForm({ file: null, documentType: type, expirationDate });
    setUploadingForType(type);
    setUploadDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file');
      return;
    }
    if (
      uploadForm.documentType.includes('certificate') &&
      !uploadForm.expirationDate
    ) {
      toast.error('Enter the certificate expiration date');
      return;
    }

    setIsUploading(true);
    try {
      const notes = uploadForm.expirationDate
        ? `Expiration date: ${uploadForm.expirationDate}`
        : undefined;
      await uploadDocument(
        uploadForm.file,
        uploadForm.documentType as DocumentType,
        notes,
        uploadForm.expirationDate || undefined
      );
      setUploadDialogOpen(false);
      setUploadingForType(null);
      setUploadForm({
        file: null,
        documentType: 'background_check',
        expirationDate: '',
      });
      await fetchDocuments();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload document'
      );
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
      const updated = await updateDoulaDocumentMetadata(
        documentToEdit.documentId,
        updateData
      );
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
          if (
            originalType !== updatedType &&
            entry.documentType === originalType
          ) {
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
      toast.error(
        error instanceof Error ? error.message : 'Failed to update document'
      );
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
  const totalRequired = completeness?.total_required ?? 5;
  const canBeActive = completeness?.can_be_active ?? false;
  const missingItems = items.filter(
    (item) => item.status === 'missing' || item.status === 'rejected'
  );
  const userMissingItems = missingItems.filter(
    (item) =>
      item.documentType !== 'background_check' ||
      backgroundCheckRequired ||
      item.status === 'rejected'
  );
  const backgroundCheck = items.find(
    (item) => item.documentType === 'background_check'
  );
  const backgroundCheckPending = backgroundCheckRequired
    ? Boolean(backgroundCheck && backgroundCheck.status !== 'approved')
    : Boolean(
        backgroundCheck &&
          backgroundCheck.status !== 'approved' &&
          backgroundCheck.status !== 'missing'
      );

  useEffect(() => {
    if (isLoading) return;
    window.requestAnimationFrame(() => {
      const target = requestedDocumentType
        ? document.getElementById(`required-document-${requestedDocumentType}`)
        : null;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.focus({ preventScroll: true });
      } else if (window.location.hash === '#required-documents') {
        documentsHeadingRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        documentsHeadingRef.current?.focus({ preventScroll: true });
      }
    });
  }, [isLoading, items, requestedDocumentType]);

  return (
    <div className='w-full min-w-0 max-w-full space-y-6'>
      <div
        id='required-documents'
        ref={documentsHeadingRef}
        tabIndex={-1}
        className='scroll-mt-6 flex justify-between items-start outline-none'
      >
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>
            Required Documents
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            Upload required documents and credentials. JPEG, PNG, or PDF; max
            10MB per file.
          </p>
        </div>
      </div>

      <Card className='border-slate-200 bg-slate-50/70'>
        <CardContent className='space-y-4 p-4 sm:p-5'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <p className='font-semibold text-slate-900'>Profile setup</p>
              <div className='mt-1 flex flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  className={
                    profileMissingFields?.length || userMissingItems.length
                      ? 'border-amber-200 bg-amber-50 text-amber-900'
                      : canBeActive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-blue-200 bg-blue-50 text-blue-800'
                  }
                >
                  {isLoading
                    ? 'Loading progress…'
                    : loadError || profileSummaryUnavailable
                      ? 'Status unavailable'
                    : (profileMissingFields?.length ?? 0) || userMissingItems.length
                      ? 'In progress'
                      : canBeActive
                        ? 'Active'
                        : 'Waiting for HR review'}
                </Badge>
                {completeness && !canBeActive && !userMissingItems.length && (
                  <span className='text-xs text-slate-600'>
                    Documents are under review
                  </span>
                )}
              </div>
            </div>
            <p className='text-xs text-slate-500'>
              Progress is saved as you update each section.
            </p>
          </div>
          <div className='grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2'>
            <section aria-label='Profile details remaining'>
              <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Profile details
                {profileMissingFields !== null &&
                  ` · ${profileMissingFields.length} left`}
              </p>
              {profileMissingFields === null ? (
                profileSummaryUnavailable ? (
                  <p className='text-sm text-slate-600'>Couldn’t load profile progress.</p>
                ) : (
                  <div className='h-8 w-2/3 animate-pulse rounded bg-slate-100' />
                )
              ) : profileMissingFields.length ? (
                <div className='flex flex-wrap gap-1.5'>
                  {profileMissingFields.map((field) => (
                    <Badge
                      key={field}
                      variant='outline'
                      className='border-slate-200 bg-white font-normal text-slate-700'
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-emerald-700'>Profile details complete</p>
              )}
            </section>
            <section aria-label='Required documents remaining'>
              <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Documents
                {isLoading || loadError
                  ? ''
                  : ` · ${userMissingItems.length} to upload`}
              </p>
              {isLoading ? (
                <div className='h-8 w-2/3 animate-pulse rounded bg-slate-100' />
              ) : loadError ? (
                <p className='text-sm text-slate-600'>Couldn’t load document progress.</p>
              ) : userMissingItems.length ? (
                <div className='flex flex-wrap gap-1.5'>
                  {userMissingItems.map((item) => (
                    <Badge
                      key={item.documentType}
                      variant='outline'
                      className='border-slate-200 bg-white font-normal text-slate-700'
                    >
                      {DOCUMENT_TYPE_LABELS[item.documentType]}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-slate-700'>
                  {completeness && !canBeActive
                    ? 'Uploaded · awaiting review'
                    : 'Required documents complete'}
                </p>
              )}
            </section>
          </div>
        </CardContent>
      </Card>

      {userMissingItems.length > 0 && (
        <Card role='status' className='border-amber-200 bg-amber-50/60'>
          <CardContent className='pt-5'>
            <p className='font-medium text-amber-950'>Documents still needed</p>
            <ul className='mt-2 list-disc pl-5 text-sm text-amber-900'>
              {userMissingItems.map((item) => (
                <li key={item.documentType}>
                  {DOCUMENT_TYPE_LABELS[item.documentType]}
                  {item.status === 'rejected'
                    ? ` — resubmit${item.rejectionReason ? `: ${item.rejectionReason}` : ''}`
                    : ''}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

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
                    ? 'All required documents are approved.'
                    : userMissingItems.length === 0
                      ? 'Submitted — waiting on HR review.'
                      : `${totalComplete} of ${totalRequired} documents approved.`}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {canBeActive
                    ? 'No documents are waiting for review.'
                    : userMissingItems.length === 0
                      ? backgroundCheckPending
                        ? 'Background check is pending review.'
                        : 'Your required items are under review.'
                      : 'Upload the listed items to submit your profile for review.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <section
          aria-label='Loading required documents'
          aria-live='polite'
          className='space-y-3'
        >
          <div className='flex items-center gap-2 text-sm font-medium text-slate-600'>
            <LoaderCircle className='h-4 w-4 animate-spin' />
            Loading your required documents
          </div>
          {REQUIRED_DOULA_DOCUMENT_TYPES.map((type) => (
            <Card key={type} className='animate-pulse border-slate-200'>
              <CardContent className='flex items-center justify-between gap-4 py-5'>
                <div className='flex min-w-0 items-center gap-3'>
                  <div className='h-9 w-9 shrink-0 rounded-lg bg-slate-100' />
                  <div className='space-y-2'>
                    <div className='h-4 w-48 max-w-[55vw] rounded bg-slate-100' />
                    <div className='h-3 w-24 rounded bg-slate-100' />
                  </div>
                </div>
                <div className='h-9 w-24 shrink-0 rounded-md bg-slate-100' />
              </CardContent>
            </Card>
          ))}
        </section>
      ) : loadError ? (
        <Card role='alert' className='border-red-200 bg-red-50/50'>
          <CardContent className='flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='font-medium text-slate-900'>Documents couldn’t load</p>
              <p className='mt-1 text-sm text-slate-600'>{loadError}</p>
            </div>
            <Button variant='outline' onClick={() => void fetchDocuments()}>
              <RefreshCw className='mr-2 h-4 w-4' /> Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {items.map((item) => (
            <Card
              key={item.documentType}
              id={`required-document-${item.documentType}`}
              tabIndex={-1}
              className={`outline-none ${
                requestedDocumentType === item.documentType
                  ? 'ring-2 ring-amber-400 bg-amber-50/40'
                  : item.status === 'missing' || item.status === 'rejected'
                    ? 'border-l-4 border-l-amber-500'
                    : ''
              }`}
            >
              <CardHeader className='pb-2'>
                <div className='flex flex-row items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <FileText className='h-5 w-5 text-blue-600' />
                    <div>
                      <CardTitle className='text-base'>
                        {DOCUMENT_TYPE_LABELS[item.documentType] ??
                          item.documentType}
                      </CardTitle>
                      <Badge
                        className={`mt-1 text-xs ${getStatusBadgeVariant(item.status)}`}
                      >
                        {item.documentType === 'background_check' &&
                        !backgroundCheckRequired &&
                        item.status === 'missing'
                          ? 'HR managed'
                          : (DOCUMENT_STATUS_LABELS[item.status] ??
                            item.status)}
                      </Badge>
                      {!(
                        item.documentType === 'background_check' &&
                        !backgroundCheckRequired
                      ) && (
                        <Badge variant='outline' className='ml-2 mt-1 text-xs'>
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.status === 'rejected' ? null : item.documentType !== 'background_check' ||
                    backgroundCheckRequired ||
                    item.status !== 'missing' ? (
                    <Button
                      size='sm'
                      variant={
                        item.status === 'missing' ? 'default' : 'outline'
                      }
                      onClick={() => openUploadFor(item.documentType)}
                    >
                      <Upload className='h-4 w-4 mr-1' />
                      {item.status === 'missing' ? 'Upload' : 'Replace'}
                    </Button>
                  ) : (
                    <Badge className='bg-slate-100 text-slate-700'>
                      HR managed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                {item.fileName && (
                  <p className='text-sm text-gray-600'>File: {item.fileName}</p>
                )}
                {item.uploadedAt && (
                  <p className='text-xs text-gray-500'>
                    Uploaded:{' '}
                    {format(new Date(item.uploadedAt), 'MMM dd, yyyy')}
                  </p>
                )}
                {item.documentType.includes('certificate') && (
                  <p className='text-sm text-gray-600'>
                    Expiration:{' '}
                    {item.expirationDate ||
                      item.notes?.match(
                        /Expiration date:\s*(\d{4}-\d{2}-\d{2})/i
                      )?.[1] ||
                      'Add expiration date when uploading'}
                  </p>
                )}
                {item.documentType === 'background_check' &&
                  item.status !== 'approved' && (
                    <div className='rounded-md bg-slate-50 p-3 text-sm text-slate-700'>
                      {backgroundCheckGuidance ||
                        (backgroundCheckRequired
                          ? 'Upload the requested background check form for review.'
                          : 'No action needed. HR will update this after your documents are reviewed.')}
                      {backgroundCheckFormUrl && (
                        <a
                          className='ml-1 font-medium text-primary underline'
                          href={backgroundCheckFormUrl}
                          target='_blank'
                          rel='noreferrer'
                        >
                          Download the required form
                        </a>
                      )}
                    </div>
                  )}
                {item.status === 'rejected' && (
                  <div className='flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                      <p className='font-semibold text-red-900'>
                        This document needs an update
                      </p>
                      <p className='text-sm text-red-800'>
                        Reason: {item.rejectionReason || 'Upload an updated document for review.'}
                      </p>
                    </div>
                    <Button
                      size='sm'
                      className='min-h-10 w-full shrink-0 sm:w-auto'
                      onClick={() => openUploadFor(item.documentType)}
                    >
                      <Upload className='mr-2 h-4 w-4' />
                      Replace rejected document
                    </Button>
                  </div>
                )}
                {item.documentId && (
                  <div className='flex gap-2 pt-2'>
                    {item.fileUrl && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          window.open(item.fileUrl ?? undefined, '_blank')
                        }
                      >
                        <Download className='h-4 w-4 mr-1' />
                        View
                      </Button>
                    )}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleEditClick(item)}
                    >
                      <Pencil className='h-4 w-4 mr-1' />
                      Edit
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-red-600 hover:text-red-700'
                      onClick={() => handleDeleteClick(item)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className='flex justify-between gap-3 pt-2'>
        <Button
          variant='outline'
          className='min-h-11'
          onClick={() => navigate('/doula-dashboard/profile?step=address')}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Address
        </Button>
        <Button
          className='min-h-11'
          onClick={() => navigate('/doula-dashboard/profile?step=scheduling')}
          disabled={isLoading || Boolean(loadError) || isUploading}
        >
          Continue to Scheduling
          <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {uploadingForType ? 'Upload' : 'Replace'}{' '}
              {DOCUMENT_TYPE_LABELS[uploadForm.documentType] ??
                uploadForm.documentType}
            </DialogTitle>
            <DialogDescription>Choose the file to upload.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {uploadForm.documentType.includes('certificate') && (
              <div className='space-y-2'>
                <Label htmlFor='document-expiration'>Expiration date</Label>
                <Input
                  id='document-expiration'
                  type='date'
                  value={uploadForm.expirationDate}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      expirationDate: e.target.value,
                    }))
                  }
                />
                <p className='text-xs text-muted-foreground'>
                  Add the date printed on the certificate.
                </p>
              </div>
            )}
            <div className='space-y-2'>
              <Label>File</Label>
              <label
                htmlFor='file'
                className='flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-primary/40 transition-colors'
              >
                <input
                  id='file'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
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
                  </div>
                )}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                isUploading ||
                !uploadForm.file ||
                (uploadForm.documentType.includes('certificate') &&
                  !uploadForm.expirationDate)
              }
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
                    documentType: value as RequiredDocType,
                  }))
                }
              >
                <SelectTrigger id='edit-document-type'>
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
            <Button variant='outline' onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
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
              <p className='text-sm font-medium'>{documentToDelete.fileName}</p>
              <p className='text-xs text-gray-500 mt-1'>
                {DOCUMENT_TYPE_LABELS[documentToDelete.documentType]}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
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
