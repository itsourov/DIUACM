import { Visibility } from "@prisma/client";
import { z } from "zod";

// Zod schema for tracker validation
export const trackerFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { 
      message: "Slug must be lowercase letters, numbers, and hyphens" 
    }),
  description: z.string().min(1, { message: "Description is required" }),
  status: z.nativeEnum(Visibility),
});

export type TrackerFormValues = z.infer<typeof trackerFormSchema>;