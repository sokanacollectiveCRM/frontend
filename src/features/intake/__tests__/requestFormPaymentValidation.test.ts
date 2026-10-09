import { describe, expect, it } from 'vitest';
import {
  fullSchema,
  type RequestFormValues,
} from 'features/intake/useRequestForm';

function buildMinimalValidRequest(
  overrides: Partial<RequestFormValues> = {}
): RequestFormValues {
  return {
    services_interested: ['Labor Support'],
    service_support_details: 'Support details',
    firstname: 'Test',
    lastname: 'User',
    email: 'test.user@example.com',
    phone_number: '555-555-5555',
    pronouns: 'They/Them',
    pronouns_other: '',
    preferred_contact_method: 'Email',
    preferred_name: '',
    age: 28,
    children_expected: '',
    address: '123 Main St',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    home_phone: '',
    home_type: [],
    home_type_other: '',
    home_access: '',
    pets: 'None',
    home_adults_count: '1',
    home_youth_count: '0',
    relationship_status: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    family_email: '',
    mobile_phone: '',
    work_phone: '',
    family_pronouns: '',
    referral_source: 'Google',
    referral_source_other: '',
    referral_name: '',
    referral_email: '',
    health_history: '',
    allergies: '',
    health_notes: '',
    due_date: '2027-01-01',
    birth_location: 'Home',
    birth_hospital: '123 Main St',
    number_of_babies: 'Singleton',
    baby_name: '',
    provider_type: 'Midwife',
    pregnancy_number: 1,
    hospital: '',
    had_previous_pregnancies: false,
    previous_pregnancies_count: 0,
    living_children_count: 0,
    past_pregnancy_experience: '',
    payment_method: 'Not sure / Need help figuring this out',
    insurance_policy_holder_name: '',
    insurance_policy_holder_dob: '',
    insurance_policy_holder_relationship: '',
    insurance_provider: '',
    insurance_member_id: '',
    policy_number: '',
    insurance_plan_type: '',
    insurance_phone_number: '',
    has_secondary_insurance: false,
    secondary_insurance_provider: '',
    secondary_insurance_member_id: '',
    secondary_policy_number: '',
    annual_income: '',
    service_specifics: '',
    self_pay_sliding_support_type: '',
    self_pay_sliding_tier: '',
    race_ethnicity: '',
    primary_language: '',
    primary_language_other: '',
    client_age_range: '',
    insurance: '',
    demographics_multi: [],
    demographics_annual_income: '',
    ...overrides,
  };
}

describe('Request form payment validation (schema)', () => {
  it('allows submitting without a payment method', () => {
    const data = buildMinimalValidRequest({ payment_method: '' });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('Not sure / Need help does not require insurance details', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Not sure / Need help figuring this out',
      insurance_provider: '',
      insurance_member_id: '',
      policy_number: '',
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('Self-Pay, Sliding Scale Available does not require support type and tier', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Self-Pay, Sliding Scale Available',
      self_pay_sliding_support_type: '',
      self_pay_sliding_tier: '',
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('Private/Commercial Insurance does not require insurance details', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Private/Commercial Insurance',
      insurance_policy_holder_name: '',
      insurance_policy_holder_dob: '',
      insurance_policy_holder_relationship: '',
      insurance_provider: '',
      insurance_member_id: '',
      policy_number: '',
      insurance_plan_type: '',
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects Medicaid on the public request form while it is hidden', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Medicaid' as RequestFormValues['payment_method'],
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('Secondary insurance fields stay optional when has_secondary_insurance is true', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Private/Commercial Insurance',
      has_secondary_insurance: true,
      secondary_insurance_provider: '',
      secondary_insurance_member_id: '',
      secondary_policy_number: '',
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
