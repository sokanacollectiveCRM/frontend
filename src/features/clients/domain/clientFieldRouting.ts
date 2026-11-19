/**
 * Routes client profile update fields to the correct backend endpoint.
 *
 * Backend split (see backend/src/constants/phiFields.ts):
 * - PUT /clients/:id/phi — PHI broker fields only (PHI_FIELDS)
 * - PUT /clients/:id — operational profile fields (Cloud SQL)
 * - PUT /api/clients/:id/billing — billing / insurance fields
 *
 * PHI_KEYS in phi.ts is broader (used for list redaction). Do not use it for save routing.
 */

/** Canonical snake_case keys accepted by PUT /clients/:id/phi */
export const PHI_BROKER_FIELD_KEYS = new Set([
  'first_name',
  'last_name',
  'email',
  'phone_number',
  'date_of_birth',
  'due_date',
  'address_line1',
  'address',
  'city',
  'state',
  'zip_code',
  'country',
  'birth_location',
  'birth_hospital',
  'provider_type',
  'pronouns',
  'pronouns_other',
  'preferred_contact_method',
  'preferred_name',
  'pets',
  'service_support_details',
  'services_interested',
  'intake_age_years',
  'health_history',
  'health_notes',
  'allergies',
  'medications',
]);

/** Canonical snake_case keys routed to PUT /api/clients/:id/billing */
export const BILLING_FIELD_KEYS = new Set([
  'payment_method',
  'insurance',
  'insurance_policy_holder_name',
  'insurance_policy_holder_dob',
  'insurance_policy_holder_relationship',
  'insurance_plan_type',
  'insurance_provider',
  'insurance_member_id',
  'policy_number',
  'insurance_phone_number',
  'has_secondary_insurance',
  'secondary_insurance_provider',
  'secondary_insurance_member_id',
  'secondary_policy_number',
  'self_pay_card_info',
  'self_pay_sliding_tier',
  'self_pay_sliding_support_type',
]);

const FIELD_ALIAS_MAP: Record<string, string> = {
  firstname: 'first_name',
  firstName: 'first_name',
  lastname: 'last_name',
  lastName: 'last_name',
  phoneNumber: 'phone_number',
  phonenumber: 'phone_number',
  dateOfBirth: 'date_of_birth',
  dateofbirth: 'date_of_birth',
  dueDate: 'due_date',
  duedate: 'due_date',
  addressLine1: 'address_line1',
  addressline1: 'address_line1',
  zipCode: 'zip_code',
  zipcode: 'zip_code',
  healthHistory: 'health_history',
  healthhistory: 'health_history',
  healthNotes: 'health_notes',
  healthnotes: 'health_notes',
  serviceNeeded: 'service_needed',
  serviceneeded: 'service_needed',
  servicesInterested: 'services_interested',
  serviceSupportDetails: 'service_support_details',
  serviceSpecifics: 'service_specifics',
  demographicsMulti: 'demographics_multi',
  age: 'intake_age_years',
  preferredContactMethod: 'preferred_contact_method',
  preferredName: 'preferred_name',
  pronounsOther: 'pronouns_other',
  birthLocation: 'birth_location',
  birthHospital: 'birth_hospital',
  providerType: 'provider_type',
  primaryLanguage: 'primary_language',
  relationshipStatus: 'relationship_status',
  middleName: 'middle_name',
  mobilePhone: 'mobile_phone',
  workPhone: 'work_phone',
  referralSource: 'referral_source',
  referralName: 'referral_name',
  referralEmail: 'referral_email',
  childrenExpected: 'children_expected',
  childrenexpected: 'children_expected',
  portalStatus: 'portal_status',
  portalstatus: 'portal_status',
  referralSourceOther: 'referral_source_other',
  pregnancyNumber: 'pregnancy_number',
  pregnancynumber: 'pregnancy_number',
  babyName: 'baby_name',
  babyname: 'baby_name',
  raceEthnicity: 'race_ethnicity',
  raceethnicity: 'race_ethnicity',
  clientAgeRange: 'client_age_range',
  clientagerange: 'client_age_range',
  annualIncome: 'annual_income',
  annualincome: 'annual_income',
  paymentMethod: 'payment_method',
  paymentmethod: 'payment_method',
  insuranceProvider: 'insurance_provider',
  insuranceprovider: 'insurance_provider',
  insuranceMemberId: 'insurance_member_id',
  insurancememberid: 'insurance_member_id',
  insurancePolicyHolderName: 'insurance_policy_holder_name',
  insurancepolicyholdername: 'insurance_policy_holder_name',
  insurancePolicyHolderDob: 'insurance_policy_holder_dob',
  insurancepolicyholderdob: 'insurance_policy_holder_dob',
  insurancePolicyHolderRelationship: 'insurance_policy_holder_relationship',
  insurancepolicyholderrelationship: 'insurance_policy_holder_relationship',
  insurancePlanType: 'insurance_plan_type',
  insuranceplantype: 'insurance_plan_type',
  policyNumber: 'policy_number',
  policynumber: 'policy_number',
  insurancePhoneNumber: 'insurance_phone_number',
  insurancephonenumber: 'insurance_phone_number',
  hasSecondaryInsurance: 'has_secondary_insurance',
  hassecondaryinsurance: 'has_secondary_insurance',
  secondaryInsuranceProvider: 'secondary_insurance_provider',
  secondaryinsuranceprovider: 'secondary_insurance_provider',
  secondaryInsuranceMemberId: 'secondary_insurance_member_id',
  secondaryinsurancememberid: 'secondary_insurance_member_id',
  secondaryPolicyNumber: 'secondary_policy_number',
  secondarypolicynumber: 'secondary_policy_number',
  selfPayCardInfo: 'self_pay_card_info',
  selfpaycardinfo: 'self_pay_card_info',
};

/** Normalize a frontend field key to canonical snake_case (backend column name). */
export function normalizeClientFieldKey(key: string): string {
  return FIELD_ALIAS_MAP[key] ?? key;
}

export function splitClientUpdatePayload(updateData: Record<string, unknown>): {
  phi: Record<string, unknown>;
  operational: Record<string, unknown>;
  billing: Record<string, unknown>;
} {
  const phi: Record<string, unknown> = {};
  const operational: Record<string, unknown> = {};
  const billing: Record<string, unknown> = {};

  for (const [rawKey, value] of Object.entries(updateData)) {
    if (value === undefined) continue;
    const key = normalizeClientFieldKey(rawKey);

    if (BILLING_FIELD_KEYS.has(key)) {
      billing[key] = value;
    } else if (PHI_BROKER_FIELD_KEYS.has(key)) {
      phi[key] = value;
    } else {
      operational[key] = value;
    }
  }

  return { phi, operational, billing };
}
