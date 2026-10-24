import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import CertificationsList from '@/features/doula-dashboard/components/CertificationsList';
import {
  certificationExpiration,
  isValidExpirationDate,
} from '@/features/doula-dashboard/certifications';

const entry = {
  name: 'Fictional training',
  issuingOrganization: 'Example Academy',
  expiration_date: '2028-03-31',
  no_expiration: false,
};
afterEach(cleanup);
describe('certification expiration displays', () => {
  it('uses the same month format for every display surface', () => {
    render(<CertificationsList certifications={[entry]} />);
    expect(
      screen.getByText('Example Academy · Expires Mar 31, 2028')
    ).toBeInTheDocument();
  });
  it('shows an Expired label for past dates', () => {
    render(
      <CertificationsList
        certifications={[{ ...entry, expiration_date: '2000-03-31' }]}
      />
    );
    expect(screen.getByText('Expired')).toBeVisible();
  });
  it('keeps a certification valid through its expiration day', () => {
    expect(
      certificationExpiration(entry, new Date(2028, 2, 31, 23, 59)).expired
    ).toBe(false);
    expect(certificationExpiration(entry, new Date(2028, 3, 1)).expired).toBe(
      true
    );
  });
  it('distinguishes no expiration from missing legacy data', () => {
    expect(
      certificationExpiration({
        ...entry,
        expiration_date: null,
        no_expiration: true,
      }).text
    ).toBe('No expiration');
    expect(
      certificationExpiration({ ...entry, expiration_date: null }).text
    ).toBe('Expiration not provided');
  });
  it.each([
    '2028-02-30',
    '2027-02-29',
    '03/31/2028',
    'not-a-date',
    '0000-01-01',
  ])('rejects invalid dates %s', (date) => {
    expect(isValidExpirationDate(date)).toBe(false);
  });
  it('accepts a real leap day', () =>
    expect(isValidExpirationDate('2028-02-29')).toBe(true));
});
