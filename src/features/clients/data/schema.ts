import { z } from 'zod';

export const userStatusSchema = z.enum([
  'lead',
  'contacted',
  'matching',
  'interviewing',
  'follow up',
  'contract',
  'active',
  'complete',
  'customer',
]);

export type UserStatus = z.infer<typeof userStatusSchema>;
export const USER_STATUSES = userStatusSchema.options;

export const STATUS_LABELS: Record<UserStatus, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  matching: 'Matching',
  interviewing: 'Interviewing',
  'follow up': 'Follow Up',
  contract: 'Contract',
  active: 'Active',
  complete: 'Complete',
  customer: 'Customer',
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
    status: data.status,
    uuid: data.uuid || '',
    text: data.text || '',
    zip_code: data.zip_code || '',
    health_history: data.health_history || '',
    allergies: data.allergies || '',
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
  pronouns?: string;
  preferred_contact_method?: string;
  children_expected?: string;
  address?: string;
  city?: string;
  state?: string;
  home_type?: string;
  home_access?: string;
  pets?: string;
  
  // Services
  services_interested?: string[];
  service_support_details?: string;
  service_needed?: string;
  service_specifics?: string;
  annual_income?: string;
  payment_method?: string;
  
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
