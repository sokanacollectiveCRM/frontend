import { z } from 'zod';

export const userStatusSchema = z.enum([
  'lead',
  'contacted',
  'matched',
  'interviewing',
  'follow up',
  'contract',
  'active',
  'complete',
  'not hired',
  // Legacy value kept for compatibility with existing records and converted leads.
  'customer',
  // Legacy alias from prior UI wording.
  'matching',
]);

export type UserStatus = z.infer<typeof userStatusSchema>;
export const USER_STATUSES: UserStatus[] = [
  'lead',
  'contacted',
  'matched',
  'interviewing',
  'follow up',
  'contract',
  'active',
  'complete',
  'not hired',
];

export const STATUS_LABELS: Record<UserStatus, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  matched: 'Matched',
  interviewing: 'Interviewed',
  'follow up': 'Follow Up',
  contract: 'Contract',
  active: 'Active',
  complete: 'Complete',
  'not hired': 'Not Hired',
  customer: 'Matched',
  matching: 'Matched',
};

const serviceSchema = z.union([
  z.literal('Postpartum'),
  z.literal('Labor Support'),
  z.literal('Lactation Support'),
  z.literal('1st Night Care'),
  z.literal('Consultation'),
  z.literal('Postpartum Support'),
  z.literal('Perinatal Support'),
  z.literal('Abortion Support'),
  z.literal('Other'),
  // Add more flexible service names that appear in the API
  z.literal('labor support'),
  z.literal('Full doula support package including labor and postpartum services'),
  // Allow any string for services not in the enum
  z.string(),
]);
export type serviceNeeded = z.infer<typeof serviceSchema>;

const userSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((val) => String(val)),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    email: z.string().optional(),
    phoneNumber: z.string().optional(),
    phone_number: z.string().optional(),
    role: z.string().optional(),
    serviceNeeded: serviceSchema.optional(),
    service_needed: serviceSchema.optional(),
    requestedAt: z.union([z.string(), z.date()]).transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }).optional(),
    updatedAt: z.union([z.string(), z.date()]).transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }).optional(),
    status: userStatusSchema,
    // Add client_info specific fields
    uuid: z.string().optional(),
    text: z.string().optional(),
    zip_code: z
      .union([z.string(), z.number()])
      .transform((val) => String(val))
      .optional(),
    health_history: z.string().optional(),
    allergies: z.string().optional(),
    qbo_customer_id: z.string().optional().nullable(),
    matched_at: z.string().optional().nullable(),
    // Portal eligibility (backend-computed; preserved for list table)
    is_eligible: z.boolean().optional(),
    isEligible: z.boolean().optional(),
    portal_status: z.string().optional(),
    portal_blockers: z.array(z.string()).optional(),
    portalBlockers: z.array(z.string()).optional(),
    primary_portal_blocker: z.string().optional().nullable(),
    primaryPortalBlocker: z.string().optional().nullable(),
    billing_path: z.string().optional(),
    billingPath: z.string().optional(),
    payment_authorization_required: z.boolean().optional(),
    paymentAuthorizationRequired: z.boolean().optional(),
    payment_authorization_satisfied: z.boolean().optional(),
    paymentAuthorizationSatisfied: z.boolean().optional(),
    card_on_file: z.boolean().optional(),
    cardOnFile: z.boolean().optional(),
    payment_method: z.string().optional(),
    paymentMethod: z.string().optional(),
    payment_authorization_status: z.string().optional(),
    paymentAuthorizationStatus: z.string().optional(),
    has_signed_contract: z.boolean().optional(),
    hasSignedContract: z.boolean().optional(),
    has_completed_payment: z.boolean().optional(),
    hasCompletedPayment: z.boolean().optional(),
    contract_status: z.string().optional(),
    contractStatus: z.string().optional(),
    payment_status: z.string().optional(),
    paymentStatus: z.string().optional(),
    verification_invoice_id: z.string().optional().nullable(),
    verificationInvoiceId: z.string().optional().nullable(),
    verification_invoice_sent_at: z.string().optional().nullable(),
    verificationInvoiceSentAt: z.string().optional().nullable(),
    verification_invoice_paid_at: z.string().optional().nullable(),
    verificationInvoicePaidAt: z.string().optional().nullable(),
    allowed_actions: z.record(z.boolean().optional()).optional(),
    allowedActions: z.record(z.boolean().optional()).optional(),
  })
  .transform((data) => ({
    id: data.id,
    firstname: data.firstname || data.firstName || data.first_name || '',
    lastname: data.lastname || data.lastName || data.last_name || '',
    email: data.email || '',
    phoneNumber: data.phoneNumber || data.phone_number || '',
    role: data.role || '',
    serviceNeeded: data.serviceNeeded ?? data.service_needed,
    requestedAt: data.requestedAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    status:
      data.status === 'matching'
        ? 'matched'
        : data.status === 'customer'
          ? 'matched'
          : data.status,
    uuid: data.uuid || '',
    text: data.text || '',
    zip_code: data.zip_code || '',
    health_history: data.health_history || '',
    allergies: data.allergies || '',
    qbo_customer_id: data.qbo_customer_id ?? null,
    matched_at: data.matched_at ?? null,
    is_eligible: data.is_eligible ?? data.isEligible,
    isEligible: data.isEligible ?? data.is_eligible,
    portal_status: data.portal_status,
    portal_blockers: data.portal_blockers ?? data.portalBlockers,
    portalBlockers: data.portalBlockers ?? data.portal_blockers,
    primary_portal_blocker: data.primary_portal_blocker ?? data.primaryPortalBlocker,
    primaryPortalBlocker: data.primaryPortalBlocker ?? data.primary_portal_blocker,
    billing_path: data.billing_path ?? data.billingPath,
    billingPath: data.billingPath ?? data.billing_path,
    payment_authorization_required:
      data.payment_authorization_required ?? data.paymentAuthorizationRequired,
    paymentAuthorizationRequired:
      data.paymentAuthorizationRequired ?? data.payment_authorization_required,
    payment_authorization_satisfied:
      data.payment_authorization_satisfied ?? data.paymentAuthorizationSatisfied,
    paymentAuthorizationSatisfied:
      data.paymentAuthorizationSatisfied ?? data.payment_authorization_satisfied,
    card_on_file: data.card_on_file ?? data.cardOnFile,
    cardOnFile: data.cardOnFile ?? data.card_on_file,
    payment_method: data.payment_method ?? data.paymentMethod,
    paymentMethod: data.paymentMethod ?? data.payment_method,
    payment_authorization_status:
      data.payment_authorization_status ?? data.paymentAuthorizationStatus,
    paymentAuthorizationStatus:
      data.paymentAuthorizationStatus ?? data.payment_authorization_status,
    has_signed_contract: data.has_signed_contract ?? data.hasSignedContract,
    hasSignedContract: data.hasSignedContract ?? data.has_signed_contract,
    has_completed_payment: data.has_completed_payment ?? data.hasCompletedPayment,
    hasCompletedPayment: data.hasCompletedPayment ?? data.has_completed_payment,
    contract_status: data.contract_status ?? data.contractStatus,
    contractStatus: data.contractStatus ?? data.contract_status,
    payment_status: data.payment_status ?? data.paymentStatus,
    paymentStatus: data.paymentStatus ?? data.payment_status,
    verification_invoice_id: data.verification_invoice_id ?? data.verificationInvoiceId,
    verificationInvoiceId: data.verificationInvoiceId ?? data.verification_invoice_id,
    verification_invoice_sent_at:
      data.verification_invoice_sent_at ?? data.verificationInvoiceSentAt,
    verificationInvoiceSentAt:
      data.verificationInvoiceSentAt ?? data.verification_invoice_sent_at,
    verification_invoice_paid_at:
      data.verification_invoice_paid_at ?? data.verificationInvoicePaidAt,
    verificationInvoicePaidAt:
      data.verificationInvoicePaidAt ?? data.verification_invoice_paid_at,
    allowed_actions: data.allowed_actions ?? data.allowedActions,
    allowedActions: data.allowedActions ?? data.allowed_actions,
  }));

export type User = z.infer<typeof userSchema>;

// Portal status types (UI-only, not in Zod schema yet)
// portal_status reflects invitation state, not eligibility
export type PortalStatus =
  | 'not_invited'
  | 'invited'
  | 'active'
  | 'disabled';

// Extended User type with portal fields (UI-only for now)
export type UserWithPortal = User & {
  portal_status?: PortalStatus;
  invited_at?: string;
  last_invite_sent_at?: string;
  invite_sent_count?: number;
};

export type UserSummary = z.infer<typeof userSchema>;
export const userListSchema = z.array(userSchema);

export type ContractTemplate = {
  id: string;
  title: string;
};

// Extended Client type with all form fields
export type Client = User & {
  // Contact & Basic Info
  preferred_name?: string;
  /** Client age in years (exact), from intake; distinct from optional `client_age_range`. */
  age?: number | string;
  pronouns?: string;
  preferred_contact_method?: string;
  children_expected?: string;
  address?: string;
  city?: string;
  state?: string;
  home_type?: string[] | string;
  home_type_other?: string;
  home_access?: string;
  pets?: string;
  home_adults_count?: string;
  home_youth_count?: string;
  
  // Services
  services_interested?: string[];
  service_support_details?: string;
  service_needed?: string;
  service_specifics?: string;
  annual_income?: string;
  self_pay_sliding_support_type?: string;
  self_pay_sliding_tier?: string;
  payment_method?: string;
  insurance_provider?: string;
  insurance_member_id?: string;
  policy_number?: string;
  insurance_phone_number?: string;
  has_secondary_insurance?: boolean;
  secondary_insurance_provider?: string;
  secondary_insurance_member_id?: string;
  secondary_policy_number?: string;
  self_pay_card_info?: string;
  
  // Family
  relationship_status?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  family_pronouns?: string;
  family_email?: string;
  mobile_phone?: string;
  work_phone?: string;
  
  // Referral
  referral_source?: string;
  referral_source_other?: string;
  referral_name?: string;
  referral_email?: string;
  
  // Health & Pregnancy
  due_date?: string | Date;
  birth_location?: string;
  birth_hospital?: string;
  number_of_babies?: string;
  baby_name?: string;
  provider_type?: string;
  pregnancy_number?: number;
  health_notes?: string;
  birth_outcomes?: string;
  birth_outcomes_induction?: boolean;
  birth_outcomes_delivery_type?: string;
  birth_outcomes_medications_used?: string[];
  
  // Past Pregnancies
  had_previous_pregnancies?: boolean;
  previous_pregnancies_count?: number;
  living_children_count?: number;
  past_pregnancy_experience?: string;
  
  // Demographics
  race_ethnicity?: string;
  primary_language?: string;
  client_age_range?: string;
  insurance?: string;
  demographics_multi?: string[];
  demographics_annual_income?: string;
  
  // Account
  account_status?: string;
  created_at?: string | Date;
  
  // Allow any additional properties from the API
  [key: string]: any;
};

export const clientListSchema = userListSchema;
export const clientSchema = userSchema;
