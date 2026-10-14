import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import type { Certification } from '@/api/doulas/doulaService';

export default function CertificationsFields({
  value,
  onChange,
}: {
  value: Certification[];
  onChange: (value: Certification[]) => void;
}) {
  return (
    <section
      aria-labelledby='certifications-heading'
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
          {(['name', 'issuingOrganization', 'year'] as const).map((field) => (
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
                required={field === 'name'}
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
          ))}
          <Button
            type='button'
            variant='outline'
            aria-label={`Remove certification ${index + 1}`}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        disabled={value.length >= 20}
        onClick={() =>
          onChange([...value, { name: '', issuingOrganization: '', year: '' }])
        }
      >
        Add certification
      </Button>
    </section>
  );
}
