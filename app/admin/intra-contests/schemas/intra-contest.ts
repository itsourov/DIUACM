import { VisibilityStatus } from "@/db/schema";
import { z } from "zod";

export const intraContestFormSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .min(3, { message: "Name must be at least 3 characters" })
      .max(255, { message: "Name must not exceed 255 characters" })
      .trim(),
    slug: z
      .string()
      .min(1, { message: "Slug is required" })
      .max(255, { message: "Slug must not exceed 255 characters" })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: "Slug can only contain lowercase letters, numbers and hyphens",
      })
      .trim(),
    description: z
      .string()
      .max(2000, { message: "Description must not exceed 2000 characters" })
      .optional(),
  bannerImage: z.string().url({ message: "Please provide a valid image URL" }).optional().or(z.literal("").transform(() => undefined)),
    registrationFee: z
      .number()
      .int({ message: "Registration fee must be a whole number" })
      .min(0, { message: "Registration fee cannot be negative" }),
    registrationStartTime: z
      .string()
      .min(1, { message: "Registration start time is required" })
      .refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Please enter a valid date",
      }),
    registrationEndTime: z
      .string()
      .min(1, { message: "Registration end time is required" })
      .refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Please enter a valid date",
      }),
    mainEventDateTime: z
      .string()
      .min(1, { message: "Main event date & time is required" })
      .refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Please enter a valid date",
      }),
    status: z.nativeEnum(VisibilityStatus, {
      message: "Please select a valid status",
    }),
    registrationLimit: z
      .number()
      .int({ message: "Registration limit must be a whole number" })
      .min(1, { message: "Registration limit must be at least 1" })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.registrationStartTime).getTime();
      const end = new Date(data.registrationEndTime).getTime();
      const main = new Date(data.mainEventDateTime).getTime();
      return start <= end && end <= main;
    },
    {
      message:
        "Invalid dates: Start must be before end, and end must be before or equal to main event",
      path: ["registrationEndTime"],
    }
  );

export type IntraContestFormValues = z.infer<typeof intraContestFormSchema>;
