import { validateDocumentFile } from '@/common/utils/documentUpload';
import { useState, useEffect } from 'react';
import { logFailure } from '@/utils/safeLog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { Badge } from '@/common/components/ui/badge';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import type { Doula } from '@/features/hours/types/doula';
import { toast } from 'sonner';
import { fetchWithAuth, buildUrl } from '@/api/http';

interface EditDoulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doula: Doula | null;
  onUpdateSuccess: () => void;
}

export function EditDoulaDialog({
  open,
  onOpenChange,
  doula,
  onUpdateSuccess,
}: EditDoulaDialogProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    unit_number: '',
    years_experience: '',
    bio: '',
    specialties: [] as string[],
    certifications: [] as string[], // Existing certification file URLs/names
    contract_status: 'not_sent' as 'pending' | 'signed' | 'not_sent',
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [certificationError, setCertificationError] = useState('');
  const [certificationFiles, setCertificationFiles] = useState<File[]>([]); // New files to upload
  const [existingCertifications, setExistingCertifications] = useState<
    string[]
  >([]); // Existing file URLs/names
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (doula && open) {
      const existingCerts = doula.certifications || [];
      setFormData({
        first_name: doula.first_name || '',
        last_name: doula.last_name || '',
        email: doula.email || '',
        phone: doula.phone || '',
        address: doula.address || '',
        unit_number: doula.unit_number || '',
        years_experience: doula.years_experience?.toString() || '',
        bio: doula.bio || '',
        specialties: doula.specialties || [],
        certifications: existingCerts,
        contract_status: doula.contract_status || 'not_sent',
      });
      setExistingCertifications(existingCerts);
      setCertificationError('');
      setCertificationFiles([]); // Reset new files when dialog opens
    }
  }, [doula, open]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSpecialty = () => {
    if (
      newSpecialty.trim() &&
      !formData.specialties.includes(newSpecialty.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }));
  };

  const handleCertificationFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    setCertificationError('');
    setCertificationFiles([]);
    try {
      await Promise.all(files.map(validateDocumentFile));
      setCertificationFiles(files.slice(0, 1));
    } catch (error) {
      setCertificationError(
        error instanceof Error ? error.message : 'Could not read that file.'
      );
    }
  };

  const removeCertificationFile = (index: number) => {
    setCertificationFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingCertification = (certUrl: string) => {
    setExistingCertifications((prev) => prev.filter((url) => url !== certUrl));
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((url) => url !== certUrl),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doula) return;

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        buildUrl(`/clients/team/${doula.id}`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstname: formData.first_name,
            lastname: formData.last_name,
            email: formData.email,
            phone: formData.phone || '',
            address: formData.address || '',
            unit_number: formData.unit_number || '',
            bio: formData.bio || '',
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to update doula';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const certificate = certificationFiles[0];
      if (certificate) {
        await validateDocumentFile(certificate);
        const upload = new FormData();
        upload.append('certification_files', certificate);
        const uploaded = await fetchWithAuth(
          buildUrl(`/clients/team/${doula.id}`),
          {
            method: 'PUT',
            body: upload,
          }
        );
        if (!uploaded.ok) {
          const error = await uploaded.json().catch(() => ({}));
          const message =
            error.error || 'Failed to upload certification document';
          setCertificationError(message);
          throw new Error(message);
        }
      }

      toast.success('Doula profile updated successfully');
      onOpenChange(false);
      onUpdateSuccess();
    } catch (error: any) {
      logFailure('hours', 'error_updating_doula');
      toast.error(error.message || 'Failed to update doula profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Doula Profile</DialogTitle>
          <DialogDescription>
            Update the doula's information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6 py-4'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-gray-700'>
              Basic Information
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='first_name'>First Name</Label>
                <Input
                  id='first_name'
                  name='first_name'
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='last_name'>Last Name</Label>
                <Input
                  id='last_name'
                  name='last_name'
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Input
                id='address'
                name='address'
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='unit_number'>Unit / Apt #</Label>
              <Input
                id='unit_number'
                name='unit_number'
                value={formData.unit_number}
                onChange={handleInputChange}
                maxLength={100}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-gray-700'>
              Professional Information
            </h3>

            <div className='space-y-2'>
              <Label htmlFor='years_experience'>Years of Experience</Label>
              <Input
                id='years_experience'
                name='years_experience'
                type='number'
                min='0'
                value={formData.years_experience}
                onChange={handleInputChange}
              />
            </div>

            <div className='space-y-2'>
              <Label>Specialties</Label>
              <div className='flex gap-2 mb-2'>
                <Input
                  placeholder='Add specialty (e.g., Labor Support)'
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={addSpecialty}
                  disabled={!newSpecialty.trim()}
                >
                  Add
                </Button>
              </div>
              {formData.specialties.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {formData.specialties.map((specialty, idx) => (
                    <Badge
                      key={idx}
                      variant='outline'
                      className='bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1'
                    >
                      {specialty}
                      <button
                        type='button'
                        onClick={() => removeSpecialty(specialty)}
                        className='ml-1 hover:text-red-600'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label>Certifications</Label>
              <p className='text-xs text-gray-500 mb-2'>
                Upload certification files (PDF, images, etc.)
              </p>

              {/* Existing Certifications */}
              {existingCertifications.length > 0 && (
                <div className='mb-4 space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>
                    Existing Certifications:
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                    {existingCertifications.map((certUrl, idx) => (
                      <div
                        key={idx}
                        className='flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50'
                      >
                        <FileText className='h-4 w-4 text-blue-600 flex-shrink-0' />
                        <span className='text-sm text-gray-700 truncate flex-1'>
                          {certUrl.split('/').pop() ||
                            `Certification ${idx + 1}`}
                        </span>
                        <button
                          type='button'
                          onClick={() => removeExistingCertification(certUrl)}
                          className='text-red-600 hover:text-red-700 flex-shrink-0'
                          title='Remove certification'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Certification Files */}
              {certificationFiles.length > 0 && (
                <div className='mb-4 space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>
                    New Files to Upload:
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                    {certificationFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className='flex items-center gap-2 p-2 border border-blue-200 rounded-lg bg-blue-50'
                      >
                        <FileText className='h-4 w-4 text-blue-600 flex-shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-700 truncate'>
                            {file.name}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type='button'
                          onClick={() => removeCertificationFile(idx)}
                          className='text-red-600 hover:text-red-700 flex-shrink-0'
                          title='Remove file'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {certificationError && (
                <p
                  id='certification-upload-error'
                  role='alert'
                  className='text-sm text-red-600'
                >
                  {certificationError}
                </p>
              )}
              <p className='text-sm text-muted-foreground'>
                JPEG, PNG or PDF, max 10MB. Uploading replaces the current
                training certificate and requires a new review.
              </p>
              {/* Upload Button */}
              <div className='flex justify-center'>
                <label
                  htmlFor='certification-upload'
                  className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
                >
                  <Upload className='h-4 w-4' />
                  Upload Training Certificate
                </label>
                <input
                  id='certification-upload'
                  type='file'
                  className='hidden'
                  accept='.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
                  aria-describedby='certification-upload-error'
                  aria-invalid={Boolean(certificationError)}
                  onChange={handleCertificationFileUpload}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio / About Me</Label>
              <Textarea
                id='bio'
                name='bio'
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder='Tell us about the doula...'
              />
            </div>
          </div>

          {/* Contract Status */}
          <div className='space-y-2'>
            <Label htmlFor='contract_status'>Contract Status</Label>
            <select
              id='contract_status'
              name='contract_status'
              value={formData.contract_status}
              onChange={handleInputChange}
              className='w-full rounded-md border border-input bg-background px-3 py-2'
            >
              <option value='not_sent'>Not Sent</option>
              <option value='pending'>Pending</option>
              <option value='signed'>Signed</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
