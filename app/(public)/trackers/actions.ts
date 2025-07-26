"use server";

import { db } from "@/db/drizzle";
import {
  trackers,
  rankLists,
  users,
  rankListUser,
  events,
  eventRankList,
  userSolveStatOnEvents,
  eventUserAttendance,
  VisibilityStatus,
  type Tracker,
  type RankList,
  type UserProfile,
  type UserSolveStatOnEvents,
} from "@/db/schema";
import { eq, and, sql, desc, asc, inArray } from "drizzle-orm";

// Define tracker type with rank lists count
export type PublicTracker = Tracker & {
  _count: {
    rankLists: number;
  };
};

export type TrackerDetails = Tracker & {
  rankLists: RankListWithDetails[];
};

export type RankListWithDetails = RankList & {
  userCount: number;
  eventCount: number;
  users: UserWithStats[];
  events: EventWithWeight[];
};

export type UserWithStats = Pick<
  UserProfile,
  | "id"
  | "name"
  | "username"
  | "email"
  | "image"
  | "codeforcesHandle"
  | "studentId"
  | "department"
> & {
  score: number;
  solveStats: {
    eventId: number;
    solveCount: number;
    upsolveCount: number;
    participation: boolean;
  }[];
};

export type EventWithWeight = {
  id: number;
  title: string;
  startingAt: Date;
  endingAt: Date;
  openForAttendance: boolean;
  strictAttendance: boolean;
  weight: number;
};

export type AttendanceMap = Record<string, boolean>;

// Function to get all public trackers without pagination
export async function getPublicTrackers(): Promise<PublicTracker[]> {
  try {
    // Get all published trackers
    const trackerData = await db
      .select({
        id: trackers.id,
        title: trackers.title,
        slug: trackers.slug,
        description: trackers.description,
        status: trackers.status,
        order: trackers.order,
        createdAt: trackers.createdAt,
        updatedAt: trackers.updatedAt,
      })
      .from(trackers)
      .where(eq(trackers.status, VisibilityStatus.PUBLISHED))
      .orderBy(asc(trackers.order), desc(trackers.createdAt));

    // Get rank lists count for each tracker
    const result: PublicTracker[] = await Promise.all(
      trackerData.map(async (tracker) => {
        const [countResult] = await db
          .select({
            count: sql<number>`count(*)`,
          })
          .from(rankLists)
          .where(eq(rankLists.trackerId, tracker.id));

        return {
          ...tracker,
          _count: {
            rankLists: countResult?.count || 0,
          },
        };
      })
    );

    return result;
  } catch (error) {
    console.error("Error fetching public trackers:", error);
    throw new Error("Failed to fetch trackers");
  }
}

export async function getTrackerBySlug(
  slug: string,
  keyword?: string
): Promise<
  | {
      success: true;
      tracker: TrackerDetails;
      currentRankList: RankListWithDetails;
      allRankListKeywords: string[];
      attendanceMap: AttendanceMap;
    }
  | {
      success: false;
      error: "tracker_not_found" | "ranklist_not_found";
      availableRankLists?: string[];
    }
> {
  try {
    // First, get the tracker
    const [tracker] = await db
      .select()
      .from(trackers)
      .where(
        and(
          eq(trackers.slug, slug),
          eq(trackers.status, VisibilityStatus.PUBLISHED)
        )
      );

    if (!tracker) {
      return {
        success: false,
        error: "tracker_not_found",
      };
    }

    // Get all rank list keywords for this tracker
    const allRankListsResult = await db
      .select({
        keyword: rankLists.keyword,
      })
      .from(rankLists)
      .where(eq(rankLists.trackerId, tracker.id))
      .orderBy(asc(rankLists.order));

    const allRankListKeywords = allRankListsResult
      .map((rl) => rl.keyword)
      .filter((k) => k !== null) as string[];

    // Get the current rank list
    let currentRankListBase;

    if (keyword) {
      // Try to find rank list with the provided keyword
      const [specificRankList] = await db
        .select()
        .from(rankLists)
        .where(
          and(
            eq(rankLists.trackerId, tracker.id),
            eq(rankLists.keyword, keyword)
          )
        )
        .orderBy(asc(rankLists.order));

      if (!specificRankList) {
        // Keyword provided but not found - return error response
        return {
          success: false,
          error: "ranklist_not_found",
          availableRankLists: allRankListKeywords,
        };
      }

      currentRankListBase = specificRankList;
    } else {
      // No keyword provided, get the default (first) rank list
      const [defaultRankList] = await db
        .select()
        .from(rankLists)
        .where(eq(rankLists.trackerId, tracker.id))
        .orderBy(asc(rankLists.order));

      currentRankListBase = defaultRankList;
    }

    if (!currentRankListBase) {
      throw new Error("No rank lists available for this tracker");
    }

    // Get rank list users with scores
    const rankListUsersResult = await db
      .select({
        userId: rankListUser.userId,
        score: rankListUser.score,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          image: users.image,
          codeforcesHandle: users.codeforcesHandle,
          studentId: users.studentId,
          department: users.department,
        },
      })
      .from(rankListUser)
      .innerJoin(users, eq(rankListUser.userId, users.id))
      .where(eq(rankListUser.rankListId, currentRankListBase.id))
      .orderBy(desc(rankListUser.score));

    // Get events for this rank list
    const rankListEventsResult = await db
      .select({
        event: {
          id: events.id,
          title: events.title,
          startingAt: events.startingAt,
          endingAt: events.endingAt,
          openForAttendance: events.openForAttendance,
          strictAttendance: events.strictAttendance,
        },
        weight: eventRankList.weight,
      })
      .from(eventRankList)
      .innerJoin(events, eq(eventRankList.eventId, events.id))
      .where(eq(eventRankList.rankListId, currentRankListBase.id))
      .orderBy(desc(events.startingAt));

    const eventIds = rankListEventsResult.map((r) => r.event.id);
    const userIds = rankListUsersResult.map((r) => r.userId);

    // Get solve stats for all users and events
    let solveStatsResult: UserSolveStatOnEvents[] = [];

    if (eventIds.length > 0 && userIds.length > 0) {
      solveStatsResult = await db
        .select()
        .from(userSolveStatOnEvents)
        .where(
          and(
            inArray(userSolveStatOnEvents.eventId, eventIds),
            inArray(userSolveStatOnEvents.userId, userIds)
          )
        );
    }

    // Get attendance data if needed
    let attendanceResult: Array<{ userId: string; eventId: number }> = [];
    const attendanceMap: AttendanceMap = {};

    if (currentRankListBase.considerStrictAttendance) {
      const strictEvents = rankListEventsResult.filter(
        (r) => r.event.openForAttendance && r.event.strictAttendance
      );

      if (strictEvents.length > 0 && userIds.length > 0) {
        const strictEventIds = strictEvents.map((r) => r.event.id);

        attendanceResult = await db
          .select({
            userId: eventUserAttendance.userId,
            eventId: eventUserAttendance.eventId,
          })
          .from(eventUserAttendance)
          .where(
            and(
              inArray(eventUserAttendance.eventId, strictEventIds),
              inArray(eventUserAttendance.userId, userIds)
            )
          );

        // Build attendance map
        attendanceResult.forEach((attendance) => {
          attendanceMap[`${attendance.userId}_${attendance.eventId}`] = true;
        });
      }
    }

    // Build the response
    const usersWithStats: UserWithStats[] = rankListUsersResult.map(
      (userResult) => {
        const userSolveStats = solveStatsResult.filter(
          (stat) => stat.userId === userResult.userId
        );

        return {
          id: userResult.user.id,
          name: userResult.user.name,
          username: userResult.user.username,
          email: userResult.user.email,
          image: userResult.user.image,
          codeforcesHandle: userResult.user.codeforcesHandle,
          studentId: userResult.user.studentId,
          department: userResult.user.department,
          score: userResult.score,
          solveStats: userSolveStats.map((stat) => ({
            eventId: stat.eventId,
            solveCount: stat.solveCount,
            upsolveCount: stat.upsolveCount,
            participation: stat.participation,
          })),
        };
      }
    );

    const eventsWithWeight: EventWithWeight[] = rankListEventsResult.map(
      (eventResult) => ({
        id: eventResult.event.id,
        title: eventResult.event.title,
        startingAt: eventResult.event.startingAt,
        endingAt: eventResult.event.endingAt,
        openForAttendance: eventResult.event.openForAttendance,
        strictAttendance: eventResult.event.strictAttendance,
        weight: eventResult.weight,
      })
    );

    const currentRankList: RankListWithDetails = {
      ...currentRankListBase,
      userCount: usersWithStats.length,
      eventCount: eventsWithWeight.length,
      users: usersWithStats,
      events: eventsWithWeight,
    };

    const trackerWithRankLists: TrackerDetails = {
      ...tracker,
      rankLists: [currentRankList], // We're only loading the current rank list
    };

    return {
      success: true,
      tracker: trackerWithRankLists,
      currentRankList,
      allRankListKeywords,
      attendanceMap,
    };
  } catch (error) {
    console.error("Error fetching tracker details:", error);
    return {
      success: false,
      error: "tracker_not_found",
    };
  }
}

// Function to generate CSV data for ranklist
export async function generateRankListCSV(rankListId: number): Promise<string> {
  try {
    // Get rank list with users and events
    const rankListData = await db
      .select()
      .from(rankLists)
      .where(eq(rankLists.id, rankListId));

    const [rankList] = rankListData;
    if (!rankList) {
      throw new Error("Rank list not found");
    }

    // Get users with scores
    const usersData = await db
      .select({
        userId: rankListUser.userId,
        score: rankListUser.score,
        user: {
          name: users.name,
          username: users.username,
          email: users.email,
          studentId: users.studentId,
          department: users.department,
        },
      })
      .from(rankListUser)
      .innerJoin(users, eq(rankListUser.userId, users.id))
      .where(eq(rankListUser.rankListId, rankListId))
      .orderBy(desc(rankListUser.score));

    // Get events
    const eventsData = await db
      .select({
        event: {
          id: events.id,
          title: events.title,
          startingAt: events.startingAt,
        },
        weight: eventRankList.weight,
      })
      .from(eventRankList)
      .innerJoin(events, eq(eventRankList.eventId, events.id))
      .where(eq(eventRankList.rankListId, rankListId))
      .orderBy(desc(events.startingAt));

    // Get solve stats for all users and events
    const eventIds = eventsData.map((e) => e.event.id);
    const userIds = usersData.map((u) => u.userId);

    const solveStats = await db
      .select()
      .from(userSolveStatOnEvents)
      .where(
        and(
          sql`${userSolveStatOnEvents.eventId} IN ${eventIds}`,
          sql`${userSolveStatOnEvents.userId} IN ${userIds}`
        )
      );

    // Build CSV headers
    const headers = [
      "Rank",
      "Name",
      "Username",
      "Email",
      "Student ID",
      "Department",
      "Total Score",
      ...eventsData.map((e) => `${e.event.title} (Solves)`),
      ...eventsData.map((e) => `${e.event.title} (Upsolves)`),
    ];

    // Build CSV rows
    const rows = usersData.map((userData, index) => {
      const userSolveStats = solveStats.filter(
        (stat) => stat.userId === userData.userId
      );

      const eventSolves = eventsData.map((eventData) => {
        const stat = userSolveStats.find(
          (s) => s.eventId === eventData.event.id
        );
        return stat?.solveCount || 0;
      });

      const eventUpsolves = eventsData.map((eventData) => {
        const stat = userSolveStats.find(
          (s) => s.eventId === eventData.event.id
        );
        return stat?.upsolveCount || 0;
      });

      return [
        index + 1, // Rank
        userData.user.name,
        userData.user.username,
        userData.user.email,
        userData.user.studentId || "",
        userData.user.department || "",
        userData.score.toFixed(1),
        ...eventSolves,
        ...eventUpsolves,
      ];
    });

    // Convert to CSV format
    const csvRows = [headers, ...rows];
    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csvContent;
  } catch (error) {
    console.error("Error generating CSV:", error);
    throw new Error("Failed to generate CSV");
  }
}
