import { certificationExpiration } from '@/features/doula-dashboard/certifications';
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
      {certifications
        .filter((entry) => entry.name.trim())
        .map((certification, index) => {
          const expiration = certificationExpiration(certification);
          return (
            <li key={index} className='min-w-0 break-words'>
              <span className='font-medium'>{certification.name}</span>
              <p className='text-muted-foreground'>
                {[certification.issuingOrganization, expiration.text]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {expiration.expired && (
                <span className='inline-flex rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800'>
                  Expired
                </span>
              )}
            </li>
          );
        })}
    </ul>
  );
}
