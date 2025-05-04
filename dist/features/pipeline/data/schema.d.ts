import { z } from 'zod';
export declare const userStatusSchema: z.ZodEnum<["lead", "contacted", "matching", "interviewing", "follow up", "contract", "active", "complete"]>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export declare const USER_STATUSES: ["lead", "contacted", "matching", "interviewing", "follow up", "contract", "active", "complete"];
export declare const STATUS_LABELS: Record<UserStatus, string>;
declare const serviceSchema: z.ZodUnion<[z.ZodLiteral<"Postpartum">, z.ZodLiteral<"Labor Support">, z.ZodLiteral<"Lactation Support">]>;
export type serviceNeeded = z.infer<typeof serviceSchema>;
declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    firstname: z.ZodString;
    lastname: z.ZodString;
    serviceNeeded: z.ZodUnion<[z.ZodLiteral<"Postpartum">, z.ZodLiteral<"Labor Support">, z.ZodLiteral<"Lactation Support">]>;
    requestedAt: z.ZodDate;
    updatedAt: z.ZodDate;
    status: z.ZodEnum<["lead", "contacted", "matching", "interviewing", "follow up", "contract", "active", "complete"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "lead" | "contacted" | "matching" | "interviewing" | "follow up" | "contract" | "active" | "complete";
    firstname: string;
    lastname: string;
    serviceNeeded: "Postpartum" | "Labor Support" | "Lactation Support";
    requestedAt: Date;
    updatedAt: Date;
}, {
    id: string;
    status: "lead" | "contacted" | "matching" | "interviewing" | "follow up" | "contract" | "active" | "complete";
    firstname: string;
    lastname: string;
    serviceNeeded: "Postpartum" | "Labor Support" | "Lactation Support";
    requestedAt: Date;
    updatedAt: Date;
}>;
export type User = z.infer<typeof userSchema>;
export type UserSummary = z.infer<typeof userSchema>;
export declare const userListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    firstname: z.ZodString;
    lastname: z.ZodString;
    serviceNeeded: z.ZodUnion<[z.ZodLiteral<"Postpartum">, z.ZodLiteral<"Labor Support">, z.ZodLiteral<"Lactation Support">]>;
    requestedAt: z.ZodDate;
    updatedAt: z.ZodDate;
    status: z.ZodEnum<["lead", "contacted", "matching", "interviewing", "follow up", "contract", "active", "complete"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "lead" | "contacted" | "matching" | "interviewing" | "follow up" | "contract" | "active" | "complete";
    firstname: string;
    lastname: string;
    serviceNeeded: "Postpartum" | "Labor Support" | "Lactation Support";
    requestedAt: Date;
    updatedAt: Date;
}, {
    id: string;
    status: "lead" | "contacted" | "matching" | "interviewing" | "follow up" | "contract" | "active" | "complete";
    firstname: string;
    lastname: string;
    serviceNeeded: "Postpartum" | "Labor Support" | "Lactation Support";
    requestedAt: Date;
    updatedAt: Date;
}>, "many">;
export {};
//# sourceMappingURL=schema.d.ts.map