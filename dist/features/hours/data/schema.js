import { z } from 'zod';
var userStatusSchema = z.union([
    z.literal('In Progress'),
    z.literal('Active'),
    z.literal('Completed'),
]);
var contractTypeSchema = z.union([
    z.literal('PostPartum'),
    z.literal('Labor Support'),
    z.literal('Lactation Support')
]);
var userSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    contractType: contractTypeSchema,
    requestedDate: z.coerce.date(),
    updatedAt: z.coerce.date(),
    status: userStatusSchema,
});
export var userListSchema = z.array(userSchema);
