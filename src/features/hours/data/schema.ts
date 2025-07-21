import { z } from 'zod';

const userStatusSchema = z.union([
  z.literal('In Progress'),
  z.literal('Active'),
  z.literal('Completed'),
]);
export type UserStatus = z.infer<typeof userStatusSchema>;

const contractTypeSchema = z.union([
  z.literal('PostPartum'),
  z.literal('Labor Support'),
  z.literal('Lactation Support'),
]);
export type contractType = z.infer<typeof contractTypeSchema>;

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  contractType: contractTypeSchema,
  requestedDate: z.coerce.date(),
  updatedAt: z.coerce.date(),
  status: userStatusSchema,
});
export type User = z.infer<typeof userSchema>;

export const userListSchema = z.array(userSchema);
