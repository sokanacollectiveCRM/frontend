import { z } from "zod";
export var imageSchema = z
    .instanceof(File)
    .refine(function (file) { return ["image/jpeg", "image/png", "image/webp"].includes(file.type); }, {
    message: "Only JPEG, PNG, or WebP images are allowed.",
});
export var profileFormSchema = z.object({
    profile_picture: imageSchema.optional(),
    bio: z.string().max(300).optional(),
});
export var accountFormSchema = z.object({
    firstname: z.string().max(300).optional(),
    lastname: z.string().max(300).optional(),
    email: z.string().max(300).email().optional(),
    address: z.string().max(300).optional(),
    city: z.string().max(300).optional(),
    state: z.string().max(300).optional(),
    dob: z.string().max(300).optional()
});
export var workLogSchema = z.object({
    start_date: z.string().date(),
    start_time: z.string().time(),
    end_date: z.string().date(),
    end_time: z.string().time(),
});
