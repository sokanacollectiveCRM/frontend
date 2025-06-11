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
  z.literal('Postpartum'),
  z.literal('Labor Support'),
  z.literal('Lactation Support')
])
export type serviceNeeded = z.infer<typeof serviceSchema>

const userSchema = z.object({
  id: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  serviceNeeded: serviceSchema,
  requestedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  status: userStatusSchema,
})
export type User = z.infer<typeof userSchema>

export type UserSummary = z.infer<typeof userSchema>;
export const userListSchema = z.array(userSchema);

export type ContractTemplate = {
  id: string,
  title: string,
}