import { describe, expect, it } from 'vitest';
import {
  buildClientProfileUpdatePayload,
  getInsuranceCardDocumentForSide,
} from '@/features/client-dashboard/components/ClientProfileTab';

describe('buildClientProfileUpdatePayload', () => {
  it('sends a numeric ZIP as a string', () => {
    const payload = buildClientProfileUpdatePayload({
      firstname: 'Jane',
      lastname: 'Doe',
      phone: '555-555-5555',
      address: '123 Main St',
      city: 'Chicago',
      state: 'IL',
      zip_code: 60601,
      bio: 'hello',
    });

    expect(payload.zip_code).toBe('60601');
  });

  it('preserves leading zeros in ZIP codes', () => {
    const payload = buildClientProfileUpdatePayload({
      firstname: 'Jane',
      lastname: 'Doe',
      phone: '555-555-5555',
      address: '123 Main St',
      city: 'Chicago',
      state: 'IL',
      zip_code: ' 01234 ',
      bio: 'hello',
    });

    expect(payload.zip_code).toBe('01234');
  });
});

describe('getInsuranceCardDocumentForSide', () => {
  it('does not fall back to a generic card when a side-specific card exists', () => {
    const documents = [
      {
        id: 'back',
        documentType: 'insurance_card',
        fileName: 'insurance-card-back.png',
      },
    ];

    expect(getInsuranceCardDocumentForSide(documents, 'front')).toBeNull();
    expect(getInsuranceCardDocumentForSide(documents, 'back')).toEqual(documents[0]);
  });

  it('uses a generic insurance card only when no side-tagged cards exist', () => {
    const documents = [
      {
        id: 'legacy',
        documentType: 'insurance_card',
        fileName: 'insurance-card.png',
      },
    ];

    expect(getInsuranceCardDocumentForSide(documents, 'front')).toEqual(documents[0]);
    expect(getInsuranceCardDocumentForSide(documents, 'back')).toBeNull();
  });
});
