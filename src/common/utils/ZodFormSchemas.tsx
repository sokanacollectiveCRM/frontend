import { z } from "zod"

export const imageSchema = z
  .instanceof(File)
  .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), {
    message: "Only JPEG, PNG, or WebP images are allowed.",
});