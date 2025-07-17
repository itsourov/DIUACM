import { z } from "zod";

// Zod schema for permission validation
export const permissionFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(255, { message: "Name must be less than 255 characters" }),
  description: z
    .string()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional(),
});

export type PermissionFormValues = z.infer<typeof permissionFormSchema>;
