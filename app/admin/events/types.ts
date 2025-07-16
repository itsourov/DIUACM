import {
  type EventUserAttendance,
  type User,
  type EventRankList,
  type RankList,
} from "@/db/schema";

// Composite types for event-related data
export type AttendanceWithUser = EventUserAttendance & {
  user: Pick<
    User,
    "id" | "name" | "email" | "username" | "image" | "studentId" | "department"
  >;
};

export type EventRankListWithRankList = EventRankList & {
  rankList: Pick<RankList, "id" | "keyword" | "description" | "trackerId">;
  tracker: {
    title: string;
  } | null;
};
