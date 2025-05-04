import { z } from 'zod';
declare const userStatusSchema: z.ZodUnion<[z.ZodLiteral<"In Progress">, z.ZodLiteral<"Active">, z.ZodLiteral<"Completed">]>;
export type UserStatus = z.infer<typeof userStatusSchema>;
declare const contractTypeSchema: z.ZodUnion<[z.ZodLiteral<"PostPartum">, z.ZodLiteral<"Labor Support">, z.ZodLiteral<"Lactation Support">]>;
export type contractType = z.infer<typeof contractTypeSchema>;
declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    contractType: z.ZodUnion<[z.ZodLiteral<"PostPartum">, z.ZodLiteral<"Labor Support">, z.ZodLiteral<"Lactation Support">]>;
    requestedDate: z.ZodDate;
    updatedAt: z.ZodDate;
    status: z.ZodUnion<[z.ZodLiteral<"In Progress">, z.ZodLiteral<"Active">, z.ZodLiteral<"Completed">]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "Active" | "In Progress" | "Completed";
    updatedAt: Date;
    firstName: string;
    lastName: string;
    contractType: "Labor Support" | "Lactation Support" | "PostPartum";
    requestedDate: Date;
}, {
    id: string;
    status: "Active" | "In Progress" | "Completed";
    updatedAt: Date;
    firstName: string;
    lastName: string;
    contractType: "Labor Support" | "Lactation Support" | "PostPartum";
    requestedDate: Date;
}>;
export type User = z.infer<typeof userSchema>;
export declare const userListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    contractType: z.ZodUnion<[z.ZodLiteral<"PostPartum">, z.ZodLiteral<"Labor Support">, z.ZodLiteral<"Lactation Support">]>;
    requestedDate: z.ZodDate;
    updatedAt: z.ZodDate;
    status: z.ZodUnion<[z.ZodLiteral<"In Progress">, z.ZodLiteral<"Active">, z.ZodLiteral<"Completed">]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "Active" | "In Progress" | "Completed";
    updatedAt: Date;
    firstName: string;
    lastName: string;
    contractType: "Labor Support" | "Lactation Support" | "PostPartum";
    requestedDate: Date;
}, {
    id: string;
    status: "Active" | "In Progress" | "Completed";
    updatedAt: Date;
    firstName: string;
    lastName: string;
    contractType: "Labor Support" | "Lactation Support" | "PostPartum";
    requestedDate: Date;
}>, "many">;
export {};
//# sourceMappingURL=schema.d.ts.map