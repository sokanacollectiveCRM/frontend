import type { RequestFormInput } from './useRequestForm';

/**
 * Full-path dummy lead for manual QA and backend DB checks.
 * Use "Fill with test data" on /request — resets the form and returns to the first step.
 * On submit, the SPA sets `service_needed` from services + support text (see RequestForm.tsx).
 */
export const DUMMY_TEST_LEAD: Partial<RequestFormInput> = {
  // Step 0 — Services interested
  services_interested: ['Labor Support', 'Postpartum Support'],
  service_support_details:
    'Looking for labor and postpartum support. Would like overnight care for first 2 weeks.',

  // Step 1 — Client details
  firstname: 'Test',
  lastname: 'Lead',
  email: 'test.lead@example.com',
  phone_number: '555-123-4567',
  pronouns: 'She/Her',
  preferred_contact_method: 'Email',
  preferred_name: 'Test',
  age: '30',
  children_expected: '1',

  // Step 2 — Home details
  address: '123 Test Street',
  city: 'Springfield',
  state: 'IL',
  zip_code: '62704',
  home_type: ['Rent, apartment or house'],
  home_type_other: '',
  home_access: 'Front door, no stairs',
  pets: 'None',

  // Step 3 — Family members
  relationship_status: 'Partner',
  first_name: 'Alex',
  last_name: 'Lead',
  middle_name: 'J',
  family_email: 'alex.lead@example.com',
  mobile_phone: '555-987-6543',
  work_phone: '',
  family_pronouns: 'They/Them',

  // Step 4 — Referral
  referral_source: 'Google',
  referral_source_other: '',
  referral_name: 'N/A',
  referral_email: '',

  // Step 5 — Health
  health_history: 'No major health issues',
  allergies: 'None',
  health_notes: 'First pregnancy',

  // Step 6 — Pregnancy / baby
  due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // ~3 months from now
  birth_location: 'Hospital',
  birth_hospital: 'Springfield General Hospital',
  number_of_babies: 'Singleton',
  baby_name: '',
  provider_type: 'Midwife',
  pregnancy_number: 1,
  hospital: 'Springfield General',

  // Step 7 — Past pregnancies
  had_previous_pregnancies: false,
  previous_pregnancies_count: 0,
  living_children_count: 0,
  past_pregnancy_experience: '',

  // Step 8 — Payment (primary + secondary insurance path)
  payment_method: 'Private/Commercial Insurance',
  insurance_policy_holder_name: 'Test Lead',
  insurance_policy_holder_dob: '1990-05-15',
  insurance_policy_holder_relationship: 'Self',
  insurance_provider: 'Blue Cross Blue Shield',
  insurance_member_id: 'BCBS-123456',
  policy_number: 'GRP-001',
  insurance_plan_type: 'PPO',
  insurance_phone_number: '800-555-1212',
  has_secondary_insurance: true,
  secondary_insurance_provider: 'Secondary Health Plan',
  secondary_insurance_member_id: 'SEC-MEMBER-789',
  secondary_policy_number: 'SEC-POL-456',
  annual_income: '$45,000-$64,999',
  service_specifics: 'Labor support for hospital birth',

  // Step 9 — Demographics
  race_ethnicity: 'Caucasian/White',
  primary_language: 'English',
  client_age_range: '26-35',
  insurance: 'Private',
  demographics_multi: [],
  demographics_annual_income: '$45,000-$64,999',
};
