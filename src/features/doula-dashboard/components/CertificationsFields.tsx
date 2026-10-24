import { useEffect, useState } from 'react';
import CertificationsList from '@/features/doula-dashboard/components/CertificationsList';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import type { Certification } from '@/api/doulas/doulaService';

export default function CertificationsFields({
  value,
  savedValue,
  onChange,
}: {
  value: Certification[];
  savedValue: Certification[] | undefined;
  onChange: (value: Certification[]) => void;
}) {
  const [editing, setEditing] = useState<number[]>([]);
  useEffect(() => setEditing([]), [savedValue]);
  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setEditing((indices) =>
      indices.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
    );
  };
  const hasUnnamedCertification = value.some((entry) => !entry.name.trim());

  return (
    <section
      aria-label='Saved certifications'
      className='mt-5 space-y-4 rounded-lg border p-4'
    >
      <h3 id='certifications-heading' className='font-semibold'>
        Certifications &amp; training
      </h3>
      <p className='text-sm text-muted-foreground'>
        List your certifications here.{' '}
        <a className='underline' href='/doula-dashboard/documents'>
          Upload your Doula training certificate in Documents.
        </a>
      </p>
      {value.map((certification, index) => (
        <div
          key={index}
          className='grid gap-3 rounded-md border p-3 md:grid-cols-3'
        >
          {!editing.includes(index) ? (
            <div className='flex items-start justify-between gap-3 md:col-span-3'>
              <CertificationsList certifications={[certification]} />
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  aria-label={`Edit certification ${index + 1}`}
                  onClick={() => setEditing((indices) => [...indices, index])}
                >
                  Edit
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  aria-label={`Remove certification ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <>
              {(['name', 'issuingOrganization', 'year'] as const).map(
                (field) => (
                  <div key={field} className='space-y-2'>
                    <Label htmlFor={`cert-${index}-${field}`}>
                      {field === 'name'
                        ? 'Certification name'
                        : field === 'issuingOrganization'
                          ? 'Issuing organization'
                          : 'Year'}
                    </Label>
                    <Input
                      id={`cert-${index}-${field}`}
                      value={certification[field]}
                      maxLength={120}
                      autoFocus={field === 'name'}
                      required={
                        field === 'name' &&
                        Object.values(certification).some((value) =>
                          value.trim()
                        )
                      }
                      onChange={(event) =>
                        onChange(
                          value.map((entry, i) =>
                            i === index
                              ? { ...entry, [field]: event.target.value }
                              : entry
                          )
                        )
                      }
                    />
                  </div>
                )
              )}
              <Button
                type='button'
                variant='outline'
                aria-label={`${Object.values(certification).some((value) => value.trim()) ? 'Remove' : 'Cancel'} certification ${index + 1}`}
                onClick={() => remove(index)}
              >
                {Object.values(certification).some((value) => value.trim())
                  ? 'Remove'
                  : 'Cancel'}
              </Button>
            </>
          )}
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        disabled={value.length >= 20 || hasUnnamedCertification}
        onClick={() => {
          if (hasUnnamedCertification || value.length >= 20) return;
          setEditing((indices) => [...indices, value.length]);
          onChange([...value, { name: '', issuingOrganization: '', year: '' }]);
        }}
      >
        Add certification
      </Button>
      {editing.length > 0 && (
        <p className='text-sm text-muted-foreground'>
          Use Save Changes below to save your certifications.
        </p>
      )}
      {hasUnnamedCertification && (
        <p className='text-sm text-muted-foreground'>
          Enter a certification name before adding another. Untouched entries
          won’t be saved.
        </p>
      )}
    </section>
  );
}
