import { z } from "zod";

// Zod schema for ranklist validation
export const ranklistFormSchema = z.object({
    keyword: z.string()
        .min(1, { message: "Keyword is required" })
        .min(2, { message: "Keyword must be at least 2 characters" })
        .max(255, { message: "Keyword must not exceed 255 characters" })
        .regex(/^[a-zA-Z0-9_-]+$/, { message: "Keyword can only contain letters, numbers, underscores, and hyphens" })
        .trim(),
    description: z.string()
        .max(1000, { message: "Description must not exceed 1000 characters" })
        .trim()
        .optional()
        .nullable()
        .or(z.literal("")),
    weightOfUpsolve: z.number()
        .min(0, { message: "Weight must be 0 or greater" })
        .max(1, { message: "Weight must be 1 or less" }),
    order: z.number()
        .int({ message: "Order must be a whole number" })
        .min(0, { message: "Order must be 0 or greater" }),
    isActive: z.boolean(),
    considerStrictAttendance: z.boolean(),
});

export type RanklistFormValues = z.infer<typeof ranklistFormSchema>; 