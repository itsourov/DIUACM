import { type EventUserAttendance, type User } from "@/db/schema";

// Composite types for event-related data
export type AttendanceWithUser = EventUserAttendance & {
  user: Pick<
    User,
    "id" | "name" | "email" | "username" | "image" | "studentId" | "department"
  >;
};
