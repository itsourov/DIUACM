import { ContestType } from "@prisma/client";
import { z } from "zod";

// Zod schema for contest validation
export const contestFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  contestType: z.nativeEnum(ContestType),
  location: z.string().optional(),
  date: z.coerce.date({
    required_error: "Date is required",
    invalid_type_error: "Date format is invalid",
  }),
  description: z.string().optional(),
  standingsUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
});

export type ContestFormValues = z.infer<typeof contestFormSchema>;