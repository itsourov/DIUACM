import { VisibilityStatus } from "@/db/schema";
import { z } from "zod";

// Zod schema for tracker validation
export const trackerFormSchema = z.object({
    title: z.string()
        .min(1, { message: "Tracker title is required" })
        .min(3, { message: "Tracker title must be at least 3 characters" })
        .max(255, { message: "Tracker title must not exceed 255 characters" })
        .trim(),
    slug: z.string()
        .min(1, { message: "Tracker slug is required" })
        .min(3, { message: "Tracker slug must be at least 3 characters" })
        .max(255, { message: "Tracker slug must not exceed 255 characters" })
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be lowercase letters, numbers, and hyphens only" })
        .trim(),
    description: z.string()
        .max(1000, { message: "Description must not exceed 1000 characters" })
        .trim()
        .optional()
        .nullable()
        .or(z.literal("")),
    status: z.nativeEnum(VisibilityStatus, {
        message: "Please select a valid status"
    }),
    order: z.number()
        .int({ message: "Order must be a whole number" })
        .min(0, { message: "Order must be 0 or greater" }),
});

export type TrackerFormValues = z.infer<typeof trackerFormSchema>; 