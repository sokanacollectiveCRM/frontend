import type { Certification } from '@/api/doulas/doulaService';

export default function CertificationsList({
  certifications,
}: {
  certifications: Certification[];
}) {
  if (!certifications.length) {
    return <p className='text-sm text-muted-foreground'>None listed</p>;
  }

  return (
    <ul aria-label='Certifications' className='space-y-2 text-sm'>
      {certifications.map((certification, index) => (
        <li key={index} className='min-w-0 break-words'>
          <span className='font-medium'>{certification.name}</span>
          {(certification.issuingOrganization || certification.year) && (
            <p className='text-muted-foreground'>
              {[certification.issuingOrganization, certification.year]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
