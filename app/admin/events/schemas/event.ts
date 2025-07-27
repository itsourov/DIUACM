import { z } from "zod";
import { VisibilityStatus, EventType, ParticipationScope } from "@/db/schema";

// Schema for event form validation
export const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z.string().optional().nullable(),
    status: z.enum([VisibilityStatus.PUBLISHED, VisibilityStatus.DRAFT]),
    startingAt: z.coerce.date({
      message: "Starting time is required and must be a valid date",
    }),
    endingAt: z.coerce.date({
      message: "Ending time is required and must be a valid date",
    }),
    eventLink: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .nullable()
      .or(z.literal("")),
    eventPassword: z.string().optional().nullable().or(z.literal("")),
    openForAttendance: z.boolean(),
    strictAttendance: z.boolean(),
    type: z.enum([EventType.CONTEST, EventType.CLASS, EventType.OTHER]),
    participationScope: z.enum([
      ParticipationScope.OPEN_FOR_ALL,
      ParticipationScope.ONLY_GIRLS,
      ParticipationScope.JUNIOR_PROGRAMMERS,
      ParticipationScope.SELECTED_PERSONS,
    ]),
    ranklists: z
      .array(
        z.object({
          id: z.number(),
          weight: z
            .number()
            .min(0.1, "Weight must be at least 0.1")
            .max(10, "Weight must be at most 10"),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      // Make sure endingAt is after startingAt
      return data.endingAt > data.startingAt;
    },
    {
      message: "End time must be after start time",
      path: ["endingAt"],
    }
  )
  .refine(
    (data) => {
      // Validate that all ranklists have valid weights
      return data.ranklists?.every((ranklist) => ranklist.weight > 0) ?? true;
    },
    {
      message: "All ranklist weights must be greater than 0",
      path: ["ranklists"],
    }
  );

// Export type for the form values
export type EventFormValues = z.infer<typeof eventFormSchema>;
