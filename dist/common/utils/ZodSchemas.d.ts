import { z } from "zod";
export declare const imageSchema: z.ZodEffects<z.ZodType<File, z.ZodTypeDef, File>, File, File>;
export declare const profileFormSchema: z.ZodObject<{
    profile_picture: z.ZodOptional<z.ZodEffects<z.ZodType<File, z.ZodTypeDef, File>, File, File>>;
    bio: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    profile_picture?: File | undefined;
    bio?: string | undefined;
}, {
    profile_picture?: File | undefined;
    bio?: string | undefined;
}>;
export declare const accountFormSchema: z.ZodObject<{
    firstname: z.ZodOptional<z.ZodString>;
    lastname: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    dob: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    address?: string | undefined;
    email?: string | undefined;
    state?: string | undefined;
    firstname?: string | undefined;
    lastname?: string | undefined;
    city?: string | undefined;
    dob?: string | undefined;
}, {
    address?: string | undefined;
    email?: string | undefined;
    state?: string | undefined;
    firstname?: string | undefined;
    lastname?: string | undefined;
    city?: string | undefined;
    dob?: string | undefined;
}>;
export declare const workLogSchema: z.ZodObject<{
    start_date: z.ZodString;
    start_time: z.ZodString;
    end_date: z.ZodString;
    end_time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    start_time: string;
    end_time: string;
    start_date: string;
    end_date: string;
}, {
    start_time: string;
    end_time: string;
    start_date: string;
    end_date: string;
}>;
//# sourceMappingURL=ZodSchemas.d.ts.map