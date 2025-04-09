import { z } from "zod";
import { Visibility } from "@prisma/client";

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(255, { message: "Title must be less than 255 characters" }),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" })
    .max(255, { message: "Slug must be less than 255 characters" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  content: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  status: z.nativeEnum(Visibility).default(Visibility.DRAFT),
  publishedAt: z.date().nullable().optional(),
  isFeatured: z.boolean().default(false),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
