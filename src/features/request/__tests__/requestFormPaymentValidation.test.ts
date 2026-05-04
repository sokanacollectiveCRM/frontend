import { describe, expect, it } from 'vitest';
import { fullSchema, type RequestFormValues } from '../useRequestForm';

function buildMinimalValidRequest(overrides: Partial<RequestFormValues> = {}): RequestFormValues {
  return {
    // Step 0 (services)
    services_interested: ['Labor Support'],
    service_support_details: 'Support details',
    service_needed: 'Labor support',

    // Step 1 (client)
    firstname: 'Test',
    lastname: 'User',
    email: 'test.user@example.com',
    phone_number: '555-555-5555',
    pronouns: 'They/Them',
    pronouns_other: '',
    preferred_contact_method: 'Email',
    preferred_name: '',
    children_expected: '',

    // Step 2 (home)
    address: '123 Main St',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    home_phone: '',
    home_type: '',
    home_access: '',
    pets: '',

    // Step 3 (family) optional
    relationship_status: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    family_email: '',
    mobile_phone: '',
    work_phone: '',
    family_pronouns: '',

    // Step 4 (referral) required
    referral_source: 'Google',
    referral_name: '',
    referral_email: '',

    // Step 5 (health) optional
    health_history: '',
    allergies: '',
    health_notes: '',

    // Step 6 (pregnancy) required subset
    due_date: '2027-01-01',
    birth_location: 'Home',
    birth_hospital: '',
    number_of_babies: 'Singleton',
    baby_name: '',
    provider_type: 'Midwife',
    pregnancy_number: 1,
    hospital: '',

    // Step 7 (past pregnancies) optional
    had_previous_pregnancies: false,
    previous_pregnancies_count: 0,
    living_children_count: 0,
    past_pregnancy_experience: '',

    // Step 9 (payment)
    payment_method: 'Self-Pay',
    insurance_provider: '',
    insurance_member_id: '',
    policy_number: '',
    insurance_phone_number: '',
    has_secondary_insurance: false,
    secondary_insurance_provider: '',
    secondary_insurance_member_id: '',
    secondary_policy_number: '',
    annual_income: '',
    service_specifics: '',

    // Step 10 (demographics) optional
    race_ethnicity: '',
    primary_language: '',
    client_age_range: '',
    insurance: '',
    demographics_multi: [],
    demographics_annual_income: '',

    ...overrides,
  };
}

describe('Request form payment validation (schema)', () => {
  it('requires payment_method', () => {
    const data = buildMinimalValidRequest({ payment_method: '' });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(' | ');
      expect(msg).toMatch(/plan to pay/i);
    }
  });

  it('Self-Pay does not require insurance details', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Self-Pay',
      insurance_provider: '',
      insurance_member_id: '',
      policy_number: '',
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('Commercial Insurance requires insurance provider, member id, and policy number', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Commercial Insurance',
      insurance_provider: '',
      insurance_member_id: '',
      policy_number: '',
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.join(' | ')).toMatch(/insurance provider/i);
      expect(messages.join(' | ')).toMatch(/member id/i);
      expect(messages.join(' | ')).toMatch(/policy number/i);
    }
  });

  it('Secondary insurance fields become required when has_secondary_insurance is true', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Commercial Insurance',
      insurance_provider: 'Aetna',
      insurance_member_id: 'MEM-1',
      policy_number: 'POL-1',
      has_secondary_insurance: true,
      secondary_insurance_provider: '',
      secondary_insurance_member_id: '',
      secondary_policy_number: '',
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join(' | ');
      expect(messages).toMatch(/secondary insurance provider/i);
      expect(messages).toMatch(/secondary insurance member id/i);
      expect(messages).toMatch(/secondary policy number/i);
    }
  });
});

