import { z } from "zod";

// Zod schema for forum post validation
export const forumPostFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Post title is required" })
    .min(3, { message: "Post title must be at least 3 characters" })
    .max(200, { message: "Post title must not exceed 200 characters" })
    .trim(),
  content: z
    .string()
    .min(1, { message: "Content is required" })
    .min(10, { message: "Content must be at least 10 characters" })
    .max(10000, { message: "Content must not exceed 10,000 characters" }),
  categoryId: z
    .number()
    .int()
    .positive({ message: "Please select a valid category" }),
});

export type ForumPostFormValues = z.infer<typeof forumPostFormSchema>;
