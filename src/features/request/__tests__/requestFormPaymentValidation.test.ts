import { describe, expect, it } from 'vitest';
import { fullSchema, type RequestFormValues } from '../useRequestForm';

function buildMinimalValidRequest(overrides: Partial<RequestFormValues> = {}): RequestFormValues {
  return {
    // Step 0 (services)
    services_interested: ['Labor Support'],
    service_support_details: 'Support details',

    // Step 1 (client)
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

    // Step 2 (home)
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
    referral_source_other: '',
    referral_name: '',
    referral_email: '',

    // Step 5 (health) optional
    health_history: '',
    allergies: '',
    health_notes: '',

    // Step 6 (pregnancy) required subset
    due_date: '2027-01-01',
    birth_location: 'Home',
    birth_hospital: '123 Main St',
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

  it('Self-Pay, Sliding Scale Available requires support type and tier', () => {
    const missingTier = buildMinimalValidRequest({
      payment_method: 'Self-Pay, Sliding Scale Available',
      self_pay_sliding_support_type: 'Labor support',
      self_pay_sliding_tier: '',
    });
    const r1 = fullSchema.safeParse(missingTier);
    expect(r1.success).toBe(false);

    const missingScope = buildMinimalValidRequest({
      payment_method: 'Self-Pay, Sliding Scale Available',
      self_pay_sliding_support_type: '',
      self_pay_sliding_tier: '$0 – $24,999',
    });
    const r2 = fullSchema.safeParse(missingScope);
    expect(r2.success).toBe(false);
  });

  it('Self-Pay, Sliding Scale Available passes when scope and tier are set', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Self-Pay, Sliding Scale Available',
      self_pay_sliding_support_type: 'Both',
      self_pay_sliding_tier: '$45,000 – $64,999',
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('Full Support option does not require insurance details', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'I am unable to pay / Full Support Option',
      insurance_provider: '',
      insurance_member_id: '',
      policy_number: '',
    });
    const result = fullSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('Private/Commercial Insurance requires policy holder, company, member id, and plan type (group number optional)', () => {
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
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.join(' | ')).toMatch(/policy holder name/i);
      expect(messages.join(' | ')).toMatch(/insurance company/i);
      expect(messages.join(' | ')).toMatch(/member id|subscriber id/i);
      expect(messages.join(' | ')).toMatch(/plan type/i);
    }
  });

  it('Private/Commercial Insurance passes with full primary insurance details (no group number)', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Private/Commercial Insurance',
      insurance_policy_holder_name: 'Jane Doe',
      insurance_policy_holder_dob: '1992-03-01',
      insurance_policy_holder_relationship: 'Self',
      insurance_provider: 'Aetna',
      insurance_member_id: 'MEM-1',
      policy_number: '',
      insurance_plan_type: 'PPO',
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

  it('Secondary insurance fields become required when has_secondary_insurance is true', () => {
    const data = buildMinimalValidRequest({
      payment_method: 'Private/Commercial Insurance',
      insurance_policy_holder_name: 'Jane Doe',
      insurance_policy_holder_dob: '1990-01-01',
      insurance_policy_holder_relationship: 'Self',
      insurance_provider: 'Aetna',
      insurance_member_id: 'MEM-1',
      policy_number: '',
      insurance_plan_type: 'HMO',
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

