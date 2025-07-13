import { ContestType } from "@/db/schema";
import { z } from "zod";

// Zod schema for contest validation
export const contestFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  contestType: z.nativeEnum(ContestType),
  location: z.string().optional(),
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().optional(),
  standingsUrl: z
    .string()
    .url({ message: "Must be a valid URL" })
    .optional()
    .or(z.literal("")),
  galleryId: z.string().optional(),
});

export type ContestFormValues = z.infer<typeof contestFormSchema>;
