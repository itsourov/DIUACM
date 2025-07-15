import { z } from "zod";

export const permissionFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(255, "Name must be less than 255 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
});

export const permissionUpdateFormSchema = permissionFormSchema.extend({
    id: z.number(),
});

export type PermissionFormValues = z.infer<typeof permissionFormSchema>;
export type PermissionUpdateFormValues = z.infer<typeof permissionUpdateFormSchema>; 