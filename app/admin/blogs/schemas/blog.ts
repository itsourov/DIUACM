import { VisibilityStatus } from "@/db/schema";
import { z } from "zod";

// Zod schema for blog validation
export const blogFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Blog title is required" })
    .min(3, { message: "Blog title must be at least 3 characters" })
    .max(255, { message: "Blog title must not exceed 255 characters" })
    .trim(),
  slug: z
    .string()
    .min(1, { message: "Slug is required" })
    .max(255, { message: "Slug must not exceed 255 characters" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase letters, numbers, and hyphens",
    })
    .trim(),
  author: z
    .string()
    .min(1, { message: "Author is required" })
    .max(255, { message: "Author must not exceed 255 characters" })
    .trim(),
  content: z
    .string()
    .min(1, { message: "Content is required" })
    .min(10, { message: "Content must be at least 10 characters" }),
  featuredImage: z.string().optional(),
  status: z.nativeEnum(VisibilityStatus, {
    message: "Please select a valid status",
  }),
  publishedAt: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date || date === "") return true;
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      },
      { message: "Please enter a valid publish date" }
    ),
  isFeatured: z.boolean().optional(),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
