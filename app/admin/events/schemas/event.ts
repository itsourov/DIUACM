import { z } from "zod";
import { Visibility, EventType, AttendanceScope } from "@prisma/client";

// Schema for event form validation
export const eventFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(Visibility).default(Visibility.DRAFT),
  startingAt: z.coerce.date({
    required_error: "Starting time is required",
    invalid_type_error: "Starting time must be a valid date",
  }),
  endingAt: z.coerce.date({
    required_error: "Ending time is required",
    invalid_type_error: "Ending time must be a valid date",
  }),
  eventLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  eventPassword: z.string().optional().nullable().or(z.literal("")),
  openForAttendance: z.boolean().default(false),
  strictAttendance: z.boolean().default(false),
  type: z.nativeEnum(EventType).default(EventType.CONTEST),
  participationScope: z
    .nativeEnum(AttendanceScope)
    .default(AttendanceScope.OPEN_FOR_ALL),
}).refine(
  (data) => {
    // Make sure endingAt is after startingAt
    return data.endingAt > data.startingAt;
  },
  {
    message: "End time must be after start time",
    path: ["endingAt"],
  }
);

// Export type for the form values
export type EventFormValues = z.infer<typeof eventFormSchema>;