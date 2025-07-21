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
};

const serviceSchema = z.union([
  z.literal('Labor Support'),
  z.literal('1st Night Care'),
  z.literal('Postpartum Support'),
  z.literal('Lactation Support'),
  z.literal('Perinatal Support'),
  z.literal('Abortion Support'),
  z.literal('Other'),
]);
export type serviceNeeded = z.infer<typeof serviceSchema>;

const userDetailsSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  firstname: z.string(),
  lastname: z.string(),
  profile_picture: z.string().nullable().optional(),
});

export const clientSchema = z.object({
  id: z.string(),
  serviceNeeded: serviceSchema.nullable(),
  requestedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  status: userStatusSchema,
  user: userDetailsSchema,
});

export type Client = z.infer<typeof clientSchema>;
export const clientListSchema = z.array(clientSchema);

export type ContractTemplate = {
  id: string;
  title: string;
};
