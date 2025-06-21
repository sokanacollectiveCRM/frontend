// src/common/types/client.ts
import { z } from 'zod';

export const clientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  profile_picture: z.string().url().optional(),
  about: z.string().optional(),
  status: z.enum([
    'lead',
    'contacted',
    'matching',
    'interviewing',
    'follow up',
    'contract',
    'active',
    'complete',
  ]),
  serviceNeeded: z.union([
    z.literal('Postpartum'),
    z.literal('Labor Support'),
    z.literal('Lactation Support')
  ]),
  requestedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Client = z.infer<typeof clientSchema>;
