import { z } from "zod";
import { EventType, ParticipationScope, VisibilityStatus } from "@/db/schema";

export const eventFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.string().optional(),
    status: z.enum([VisibilityStatus.PUBLISHED, VisibilityStatus.DRAFT]),
    startingAt: z.string().min(1, "Starting time is required"),
    endingAt: z.string().min(1, "Ending time is required"),
    eventLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    eventPassword: z.string().optional(),
    openForAttendance: z.boolean(),
    strictAttendance: z.boolean(),
    type: z.enum([EventType.CONTEST, EventType.CLASS, EventType.OTHER]),
    participationScope: z.enum([
        ParticipationScope.OPEN_FOR_ALL,
        ParticipationScope.ONLY_GIRLS,
        ParticipationScope.JUNIOR_PROGRAMMERS,
        ParticipationScope.SELECTED_PERSONS,
    ]),
});

export type EventFormValues = z.infer<typeof eventFormSchema>; 