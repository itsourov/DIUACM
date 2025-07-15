import { ContestType } from "@/db/schema";
import { z } from "zod";

// Zod schema for contest validation with enhanced validation
export const contestFormSchema = z.object({
  name: z.string()
    .min(1, { message: "Contest name is required" })
    .min(3, { message: "Contest name must be at least 3 characters" })
    .max(255, { message: "Contest name must not exceed 255 characters" })
    .trim(),
  contestType: z.nativeEnum(ContestType, {
    message: "Please select a valid contest type"
  }),
  location: z.string()
    .max(255, { message: "Location must not exceed 255 characters" })
    .trim()
    .optional(),
  date: z.string()
    .min(1, { message: "Contest date is required" })
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid date" }),
  description: z.string()
    .max(1000, { message: "Description must not exceed 1000 characters" })
    .trim()
    .optional(),
  standingsUrl: z
    .string()
    .trim()
    .refine((val) => {
      if (!val || val === "") return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, { message: "Must be a valid URL" })
    .optional()
    .or(z.literal("")),
  galleryId: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      const num = parseInt(val);
      return !isNaN(num) && num > 0;
    }, { message: "Gallery ID must be a valid positive number" }),
});

export type ContestFormValues = z.infer<typeof contestFormSchema>;

// Schema for team creation/update
export const teamFormSchema = z.object({
  name: z.string()
    .min(1, { message: "Team name is required" })
    .min(2, { message: "Team name must be at least 2 characters" })
    .max(255, { message: "Team name must not exceed 255 characters" })
    .trim(),
  rank: z.number()
    .int({ message: "Rank must be a whole number" })
    .min(1, { message: "Rank must be at least 1" })
    .optional(),
  solveCount: z.number()
    .int({ message: "Solve count must be a whole number" })
    .min(0, { message: "Solve count cannot be negative" })
    .optional(),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
