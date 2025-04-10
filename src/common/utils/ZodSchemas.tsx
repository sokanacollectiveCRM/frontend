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
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  dob: z.string().optional()
});