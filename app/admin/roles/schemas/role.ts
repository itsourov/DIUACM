import { z } from "zod";

// Schema for role form validation
export const roleFormSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9 _-]+$/,
      "Name can only contain letters, numbers, spaces, underscores, and hyphens"
    ),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional()
    .nullable(),
  permissionIds: z.array(z.string()).optional(),
});

// Type for the role form values
export type RoleFormValues = z.infer<typeof roleFormSchema>;
