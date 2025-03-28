import { z } from "zod";

export const imageSchema = z
  .instanceof(File)
  .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), {
    message: "Only JPEG, PNG, or WebP images are allowed.",
});

export const profileFormSchema = z.object({
  profilePicture: imageSchema.optional(),
  bio: z.string().max(300).optional(),
});

export const accountFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional()
});