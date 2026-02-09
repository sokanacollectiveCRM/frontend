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
}

/**
 * Client list item as returned by GET /clients.
 * In legacy mode: has nested `user` object.
 * In canonical mode: should be flat (no nested user).
 */
export interface ClientListItemDTO {
  id: string;
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
}

/**
 * Client detail as returned by GET /clients/:id.
 * Canonical mode only - flat structure with snake_case fields.
 */
export interface ClientDetailDTO {
  id: string;
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
  client_age_range?: string;
  annual_income?: string;
  insurance?: string;
}
