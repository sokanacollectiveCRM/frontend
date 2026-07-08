/**
 * DTO types for /clients endpoint responses.
 * Field names match backend response (snake_case).
 */

/**
 * Nested user object as returned by backend in legacy mode.
 */
export interface ClientUserDTO {
  id: string;
  email?: string;
  firstname?: string;
  lastName?: string; // Backend inconsistency: sometimes camelCase
  lastname?: string;
  firstName?: string; // Backend inconsistency
  phone_number?: string;
  phoneNumber?: string;
  profile_picture?: string | null;
  status?: string;
  service_needed?: string;
  due_date?: string;
  portal_status?: string;
  is_eligible?: boolean;
  contract_status?: string;
  has_signed_contract?: boolean;
  payment_status?: string;
  has_completed_payment?: boolean;
  payment_method?: string;
  payment_authorization_status?: string;
  authorized_at?: string;
  portal_blockers?: string[];
  primary_portal_blocker?: string;
  billing_path?: string;
  payment_authorization_required?: boolean;
  payment_authorization_satisfied?: boolean;
  card_on_file?: boolean;
  qb_customer_id?: string | null;
  qb_stored_payment_method_id?: string | null;
  verification_invoice_id?: string | null;
  verification_invoice_sent_at?: string | null;
  verification_invoice_paid_at?: string | null;
  allowed_actions?: ClientListItemDTO['allowed_actions'];
}

/**
 * Client list item as returned by GET /clients.
 * In legacy mode: has nested `user` object.
 * In canonical mode: should be flat (no nested user).
 */
export interface ClientListItemDTO {
  id: string;
  client_number?: string;
  status?: string;
  serviceNeeded?: string;
  service_needed?: string;
  requestedAt?: string;
  requested_at?: string;
  updatedAt?: string;
  updated_at?: string;
  // Legacy: nested user object
  user?: ClientUserDTO;
  // Canonical: flat fields (snake_case)
  email?: string;
  firstname?: string;
  lastname?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string | null;
  portal_status?: string;
  is_eligible?: boolean;
  contracts?: unknown[];
  contract_status?: string;
  has_signed_contract?: boolean;
  payments?: unknown[];
  payment_status?: string;
  has_completed_payment?: boolean;
  /** Non-PHI billing hints for staff list — optional until backend exposes them */
  payment_method?: string;
  payment_authorization_status?: string;
  authorized_at?: string;
  portal_blockers?: string[];
  primary_portal_blocker?: string;
  billing_path?: string;
  payment_authorization_required?: boolean;
  payment_authorization_satisfied?: boolean;
  card_on_file?: boolean;
  qb_customer_id?: string | null;
  qb_stored_payment_method_id?: string | null;
  verification_invoice_id?: string | null;
  verification_invoice_sent_at?: string | null;
  verification_invoice_paid_at?: string | null;
  allowed_actions?: {
    can_invite_to_portal?: boolean;
    can_send_verification_invoice?: boolean;
    can_mark_contract_signed?: boolean;
    can_mark_deposit_paid?: boolean;
  };
}

/**
 * Client detail as returned by GET /clients/:id.
 * Canonical mode only - flat structure with snake_case fields.
 */
export interface ClientDetailDTO {
  id: string;
  client_number?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  status: string;
  service_needed?: string;
  portal_status?: string;
  invited_at?: string;
  last_invite_sent_at?: string;
  invite_sent_count?: number;
  requested_at?: string;
  updated_at?: string;
  is_eligible?: boolean;
  // PHI fields - optional, only present when authorized
  due_date?: string;
  health_history?: string;
  health_notes?: string;
  birth_outcomes?: string;
  birth_outcomes_induction?: boolean;
  birth_outcomes_delivery_type?: string;
  birth_outcomes_medications_used?: string[];
  allergies?: string;
  medications?: string;
  date_of_birth?: string;
  address_line1?: string;
  pregnancy_number?: number;
  had_previous_pregnancies?: boolean;
  previous_pregnancies_count?: number;
  living_children_count?: number;
  past_pregnancy_experience?: string;
  baby_sex?: string;
  baby_name?: string;
  number_of_babies?: number;
  race_ethnicity?: string;
  /** Exact age in years from intake (request form Client Details). */
  age?: number;
  client_age_range?: string;
  annual_income?: string;
  insurance?: string;
  payment_method?: string;
  payment_authorization_status?: string;
  authorized_at?: string;
  insurance_provider?: string;
  insurance_member_id?: string;
  insurance_policy_holder_name?: string;
  insurance_policy_holder_dob?: string;
  insurance_policy_holder_relationship?: string;
  insurance_plan_type?: string;
  policy_number?: string;
  insurance_phone_number?: string;
  has_secondary_insurance?: boolean;
  secondary_insurance_provider?: string;
  secondary_insurance_member_id?: string;
  secondary_policy_number?: string;
  self_pay_card_info?: string;

  portal_blockers?: string[];
  primary_portal_blocker?: string;
  billing_path?: string;
  payment_authorization_required?: boolean;
  payment_authorization_satisfied?: boolean;
  card_on_file?: boolean;
  qb_customer_id?: string | null;
  qb_stored_payment_method_id?: string | null;
  verification_invoice_id?: string | null;
  verification_invoice_sent_at?: string | null;
  verification_invoice_paid_at?: string | null;
  allowed_actions?: {
    can_invite_to_portal?: boolean;
    can_send_verification_invoice?: boolean;
    can_mark_contract_signed?: boolean;
    can_mark_deposit_paid?: boolean;
  };
  contract_status?: string;
  has_signed_contract?: boolean;
  payment_status?: string;
  has_completed_payment?: boolean;

  /** Intake — how the client found Sokana (CRM / request form). */
  referral_source?: string;
  referral_source_other?: string;
  referral_name?: string;
  referral_email?: string;
}
