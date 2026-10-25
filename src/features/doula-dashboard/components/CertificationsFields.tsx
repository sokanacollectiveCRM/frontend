import { hasCertificationDetails } from '@/features/doula-dashboard/certifications';
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
  onOpenDocuments,
}: {
  onOpenDocuments?: () => void;
  value: Certification[];
  savedValue: Certification[] | undefined;
  onChange: (value: Certification[]) => void;
}) {
  const [editing, setEditing] = useState<Record<number, Certification | null>>(
    {}
  );
  useEffect(() => setEditing({}), [savedValue]);
  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setEditing((originals) =>
      Object.fromEntries(
        Object.entries(originals)
          .filter(([key]) => Number(key) !== index)
          .map(([key, entry]) => [
            Number(key) > index ? Number(key) - 1 : Number(key),
            entry,
          ])
      )
    );
  };
  const cancel = (index: number) => {
    const original = editing[index];
    if (!original) {
      remove(index);
      return;
    }
    onChange(value.map((entry, i) => (i === index ? original : entry)));
    setEditing((originals) => {
      const next = { ...originals };
      delete next[index];
      return next;
    });
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
        <a
          className='underline'
          href='/doula-dashboard/profile?step=documents'
          onClick={
            onOpenDocuments
              ? (event) => {
                  event.preventDefault();
                  onOpenDocuments();
                }
              : undefined
          }
        >
          Upload your Doula training certificate in Documents.
        </a>
      </p>
      {value.map((certification, index) => (
        <div
          key={index}
          className='grid gap-3 rounded-md border p-3 md:grid-cols-3'
        >
          {!(index in editing) ? (
            <div className='flex items-start justify-between gap-3 md:col-span-3'>
              <CertificationsList certifications={[certification]} />
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  aria-label={`Edit certification ${index + 1}`}
                  onClick={() =>
                    setEditing((originals) => ({
                      ...originals,
                      [index]: { ...certification },
                    }))
                  }
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
              {(
                ['name', 'issuingOrganization', 'expiration_date'] as const
              ).map((field) => (
                <div key={field} className='space-y-2'>
                  <Label
                    htmlFor={`cert-${index}-${field}`}
                    className={
                      field === 'name' &&
                      hasCertificationDetails(certification) &&
                      !certification.name.trim()
                        ? 'text-red-600'
                        : ''
                    }
                  >
                    {field === 'name'
                      ? 'Certification name'
                      : field === 'issuingOrganization'
                        ? 'Issuing organization'
                        : 'Expiration date'}
                  </Label>
                  <Input
                    id={`cert-${index}-${field}`}
                    aria-invalid={
                      field === 'name' &&
                      hasCertificationDetails(certification) &&
                      !certification.name.trim()
                    }
                    aria-describedby={
                      field === 'name' &&
                      hasCertificationDetails(certification) &&
                      !certification.name.trim()
                        ? `cert-${index}-name-required`
                        : undefined
                    }
                    className={
                      field === 'name' &&
                      hasCertificationDetails(certification) &&
                      !certification.name.trim()
                        ? 'border-red-600 focus-visible:ring-red-600'
                        : ''
                    }
                    value={certification[field] ?? ''}
                    type={field === 'expiration_date' ? 'date' : 'text'}
                    disabled={
                      field === 'expiration_date' && certification.no_expiration
                    }
                    maxLength={120}
                    autoFocus={field === 'name'}
                    required={
                      field === 'name' && hasCertificationDetails(certification)
                    }
                    onChange={(event) =>
                      onChange(
                        value.map((entry, i) =>
                          i === index
                            ? {
                                ...entry,
                                [field]:
                                  field === 'expiration_date'
                                    ? event.target.value || null
                                    : event.target.value,
                              }
                            : entry
                        )
                      )
                    }
                  />
                  {field === 'name' &&
                    hasCertificationDetails(certification) &&
                    !certification.name.trim() && (
                      <p
                        id={`cert-${index}-name-required`}
                        className='text-sm text-red-600'
                      >
                        Certification name is required
                      </p>
                    )}
                </div>
              ))}
              <div className='flex items-center gap-2 md:col-span-3'>
                <input
                  id={`cert-${index}-no-expiration`}
                  type='checkbox'
                  checked={certification.no_expiration === true}
                  onChange={(event) =>
                    onChange(
                      value.map((entry, i) =>
                        i === index
                          ? {
                              ...entry,
                              no_expiration: event.target.checked,
                              expiration_date: null,
                            }
                          : entry
                      )
                    )
                  }
                />
                <Label htmlFor={`cert-${index}-no-expiration`}>
                  No expiration
                </Label>
              </div>
              <div className='flex gap-2 md:col-span-3'>
                <Button
                  type='button'
                  variant='outline'
                  aria-label={`Cancel certification ${index + 1}`}
                  onClick={() => cancel(index)}
                >
                  Cancel
                </Button>
                {hasCertificationDetails(certification) && (
                  <Button
                    type='button'
                    variant='outline'
                    aria-label={`Remove certification ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
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
          setEditing((originals) => ({ ...originals, [value.length]: null }));
          onChange([
            ...value,
            {
              name: '',
              issuingOrganization: '',
              expiration_date: null,
              no_expiration: false,
            },
          ]);
        }}
      >
        Add certification
      </Button>
      {Object.keys(editing).length > 0 && (
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
