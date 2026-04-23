import type { RequestFormValues } from './useRequestForm';

/**
 * Dummy test lead for testing client number generation.
 * Use "Fill with test data" in the request form to populate.
 */
export const DUMMY_TEST_LEAD: Partial<RequestFormValues> = {
  // Services Interested (Step 1)
  services_interested: ['Labor Support', 'Postpartum Support'],
  service_support_details:
    'Looking for labor and postpartum support. Would like overnight care for first 2 weeks.',
  service_needed: 'Labor Support',

  // Client Details (Step 2)
  firstname: 'Test',
  lastname: 'Lead',
  email: 'test.lead@example.com',
  phone_number: '555-123-4567',
  pronouns: 'She/Her',
  preferred_contact_method: 'Email',
  preferred_name: 'Test',
  children_expected: '1',

  // Home Details (Step 3)
  address: '123 Test Street',
  city: 'Springfield',
  state: 'IL',
  zip_code: '62704',
  home_type: 'House',
  home_access: 'Front door, no stairs',
  pets: 'None',

  // Family Members (Step 4)
  relationship_status: 'Partner',
  first_name: 'Alex',
  last_name: 'Lead',
  middle_name: 'J',
  family_email: 'alex.lead@example.com',
  mobile_phone: '555-987-6543',
  work_phone: '555-456-7890',
  family_pronouns: 'They/Them',

  // Referral (Step 5)
  referral_source: 'Google',
  referral_name: 'N/A',
  referral_email: '',

  // Health History (Step 6)
  health_history: 'No major health issues',
  allergies: 'None',
  health_notes: 'First pregnancy',

  // Pregnancy/Baby (Step 7)
  due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // ~3 months from now
  birth_location: 'Hospital',
  birth_hospital: 'Springfield General Hospital',
  number_of_babies: 'Singleton',
  baby_name: '',
  provider_type: 'Midwife',
  pregnancy_number: 1,
  hospital: 'Springfield General',

  // Past Pregnancies (Step 8)
  had_previous_pregnancies: false,
  previous_pregnancies_count: 0,
  living_children_count: 0,
  past_pregnancy_experience: '',

  // Payment (Step 9)
  payment_method: 'Commercial Insurance',
  insurance_provider: 'Blue Cross Blue Shield',
  insurance_member_id: 'BCBS-123456',
  policy_number: 'POL-987654',
  insurance_phone_number: '800-555-1212',
  has_secondary_insurance: false,
  secondary_insurance_provider: '',
  secondary_insurance_member_id: '',
  secondary_policy_number: '',
  annual_income: '$45,000-$64,999',
  service_specifics: 'Labor support for hospital birth',

  // Demographics (Step 10)
  race_ethnicity: 'Caucasian/White',
  primary_language: 'English',
  client_age_range: '26-35',
  insurance: 'Private',
  demographics_multi: [],
  demographics_annual_income: '$45,000-$64,999',
};
