import { z } from "zod";

export const roleFormSchema = z.object({
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

export const roleUpdateFormSchema = roleFormSchema.extend({
    id: z.number(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
export type RoleUpdateFormValues = z.infer<typeof roleUpdateFormSchema>; 