import { z } from "zod";

// Schema for permission form validation
export const permissionFormSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9:._-]+$/,
      "Name can only contain letters, numbers, colons, dots, underscores, and hyphens"
    ),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional()
    .nullable(),
});

// Type for the permission form values
export type PermissionFormValues = z.infer<typeof permissionFormSchema>;
