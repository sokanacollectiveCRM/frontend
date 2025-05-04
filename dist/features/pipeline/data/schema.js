import { z } from 'zod';
export var userStatusSchema = z.enum([
    'lead',
    'contacted',
    'matching',
    'interviewing',
    'follow up',
    'contract',
    'active',
    'complete',
]);
export var USER_STATUSES = userStatusSchema.options;
export var STATUS_LABELS = {
    lead: 'Lead',
    contacted: 'Contacted',
    matching: 'Matching',
    interviewing: 'Interviewing',
    'follow up': 'Follow Up',
    contract: 'Contract',
    active: 'Active',
    complete: 'Complete',
};
var serviceSchema = z.union([
    z.literal('Postpartum'),
    z.literal('Labor Support'),
    z.literal('Lactation Support')
]);
var userSchema = z.object({
    id: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    serviceNeeded: serviceSchema,
    requestedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    status: userStatusSchema,
});
export var userListSchema = z.array(userSchema);
