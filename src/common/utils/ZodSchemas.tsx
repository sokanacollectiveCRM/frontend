import { z } from "zod";
import { STATES } from "./50States";

export const imageSchema = z
  .instanceof(File)
  .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), {
    message: "Only JPEG, PNG, or WebP images are allowed.",
});

export const profileFormSchema = z.object({
  profile_picture: imageSchema.optional(),
  bio: z.string().max(300).optional(),
});

export const accountFormSchema = z.object({
  firstname: z.string().max(300).optional(),
  lastname: z.string().max(300).optional(),
  email: z.string().max(300).email().optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(300).optional(),
  state: z.string().max(300).optional(),
  dob: z.string().max(300).optional()
});