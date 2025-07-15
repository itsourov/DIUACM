import { VisibilityStatus } from "@/db/schema";
import { z } from "zod";

// Zod schema for gallery validation
export const galleryFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  slug: z
    .string()
    .min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  status: z.nativeEnum(VisibilityStatus),
  order: z.number().int().min(0, { message: "Order must be a non-negative number" }),
});

export type GalleryFormValues = z.infer<typeof galleryFormSchema>;
