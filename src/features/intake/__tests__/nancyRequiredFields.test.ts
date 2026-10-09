import { describe, expect, it } from 'vitest';
import { fullSchema } from 'features/intake/useRequestForm';
import {
  formatIntakeSubmitError,
  isBareFailedToFetch,
  NETWORK_SUBMIT_MESSAGE,
} from 'features/intake/domain/intakeSubmitErrors';
import { resolvePrimaryLanguageForSubmit } from 'features/intake/domain/intakePayload';

const nancyRequired = {
  firstname: 'Nancy',
  lastname: 'Cowans',
  email: 'nancy@example.com',
  phone_number: '312-555-0100',
  city: 'Chicago',
  zip_code: '60614',
  due_date: '2027-01-15',
  services_interested: ['Labor Support'],
  service_support_details: 'I want a doula for labor support.',
};

describe('Nancy required-field set', () => {
  it('accepts only name, email, phone, city/zip, due date, service, and why-doula', () => {
    const result = fullSchema.safeParse(nancyRequired);
    expect(result.success).toBe(true);
  });

  it('still requires first name, email, city, zip, due date, service, and why-doula', () => {
    for (const key of [
      'firstname',
      'email',
      'city',
      'zip_code',
      'due_date',
      'service_support_details',
    ] as const) {
      const result = fullSchema.safeParse({ ...nancyRequired, [key]: '' });
      expect(result.success, key).toBe(false);
    }
    const noService = fullSchema.safeParse({
      ...nancyRequired,
      services_interested: [],
    });
    expect(noService.success).toBe(false);
  });

  it('does not require pronouns, age, pets, payment, referral, or address', () => {
    const result = fullSchema.safeParse({
      ...nancyRequired,
      pronouns: '',
      age: '',
      pets: '',
      address: '',
      state: '',
      payment_method: '',
      referral_source: '',
      provider_type: '',
      birth_location: '',
      pregnancy_number: '',
    });
    expect(result.success).toBe(true);
  });

  it('requires Other language specify only when primary language is Other', () => {
    const missing = fullSchema.safeParse({
      ...nancyRequired,
      primary_language: 'Other',
      primary_language_other: '',
    });
    expect(missing.success).toBe(false);
    if (!missing.success) {
      expect(missing.error.issues.some((i) => i.path[0] === 'primary_language_other')).toBe(
        true
      );
    }

    const specified = fullSchema.safeParse({
      ...nancyRequired,
      primary_language: 'Other',
      primary_language_other: 'Yoruba',
    });
    expect(specified.success).toBe(true);
  });

  it('rejects 2nd pregnancy with zero prior pregnancies', () => {
    const result = fullSchema.safeParse({
      ...nancyRequired,
      pregnancy_number: '2',
      had_previous_pregnancies: true,
      previous_pregnancies_count: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path[0] === 'previous_pregnancies_count')
      ).toBe(true);
    }
  });

  it('maps Other language into primary_language for the existing backend column', () => {
    expect(resolvePrimaryLanguageForSubmit('Other', 'Yoruba')).toEqual({
      primary_language: 'Yoruba',
      primary_language_other: 'Yoruba',
    });
  });
});

describe('intake submit error copy', () => {
  it('never surfaces a bare Failed to fetch', () => {
    expect(isBareFailedToFetch('Failed to fetch')).toBe(true);
    expect(isBareFailedToFetch('Failed to fetch!')).toBe(true);
    const message = formatIntakeSubmitError(new TypeError('Failed to fetch'));
    expect(message.toLowerCase()).not.toContain('failed to fetch');
    expect(message).toBe(NETWORK_SUBMIT_MESSAGE);
  });
});
