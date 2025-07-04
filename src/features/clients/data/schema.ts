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
])
export type serviceNeeded = z.infer<typeof serviceSchema>

const userSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().optional(),
  serviceNeeded: serviceSchema.optional(),
  requestedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  status: userStatusSchema,
}).transform(data => ({
  id: data.id,
  firstname: data.firstname || data.firstName || '',
  lastname: data.lastname || data.lastName || '',
  email: data.email || '',
  serviceNeeded: data.serviceNeeded,
  requestedAt: data.requestedAt || new Date(),
  updatedAt: data.updatedAt || new Date(),
  status: data.status,
}))

export type User = z.infer<typeof userSchema>

export type UserSummary = z.infer<typeof userSchema>;
export const userListSchema = z.array(userSchema);

export type ContractTemplate = {
  id: string,
  title: string,
}

export type Client = User;
export const clientListSchema = userListSchema;
export const clientSchema = userSchema;