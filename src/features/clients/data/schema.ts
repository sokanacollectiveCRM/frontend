import { z } from 'zod'

export const userStatusSchema = z.enum([
  'In Progress',
  'Active',
  'Completed',
  'pending',
])

export type UserStatus = z.infer<typeof userStatusSchema>

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
