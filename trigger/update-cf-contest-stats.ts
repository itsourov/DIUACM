import { logger, schedules, task } from "@trigger.dev/sdk/v3";
import { db } from "../db/drizzle";
import {
  users as usersTable,
  events as eventsTable,
  rankLists,
  rankListUser,
  eventRankList,
  userSolveStatOnEvents,
} from "../db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

interface ContestRow {
  party: {
    members: { handle: string }[];
    participantType: string;
  };
  problemResults: { points: number }[];
}

interface CodeforcesApiResponse {
  status: string;
  result: {
    contest: {
      id: number;
      name: string;
    };
    problems: Record<string, unknown>[];
    rows: ContestRow[];
  };
}

interface UserWithCodeforcesHandle {
  id: string;
  codeforcesHandle: string;
}

interface SolveStatData {
  userId: string;
  eventId: number;
  solveCount: number;
  upsolveCount: number;
  participation: boolean;
}

// Minimal contest info to pass between tasks
interface MinimalEventInfo {
  id: number;
  title: string;
  startingAt: Date;
  eventLink: string | null;
}

/**
 * Extract contest ID from a Codeforces URL
 */
function extractContestId(eventLink: string): string | null {
  const match = eventLink.match(/contests?\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Process a single Codeforces contest
 */
export const processSingleCodeforcesContest = task({
  id: "process-single-codeforces-contest",
  run: async ({
    eventInfo,
    contestId,
    progress,
  }: {
    eventInfo: MinimalEventInfo;
    contestId: string;
    progress: string;
  }) => {
    logger.info(`📊 Processing contest ${progress}`, {
      contestId,
      eventTitle: eventInfo.title,
      startingAt: eventInfo.startingAt,
      progress,
    });

    try {
      // Find all users with CF handles in the ranklists associated with this event
      const usersWithHandles = await db
        .select({
          id: usersTable.id,
          codeforcesHandle: usersTable.codeforcesHandle,
        })
        .from(usersTable)
        .innerJoin(rankListUser, eq(rankListUser.userId, usersTable.id))
        .innerJoin(rankLists, eq(rankLists.id, rankListUser.rankListId))
        .innerJoin(eventRankList, eq(eventRankList.rankListId, rankLists.id))
        .where(
          and(
            isNotNull(usersTable.codeforcesHandle),
            eq(eventRankList.eventId, eventInfo.id)
          )
        );

      // Filter out any null handles (TypeScript safety)
      const users: UserWithCodeforcesHandle[] = usersWithHandles.filter(
        (
          user
        ): user is UserWithCodeforcesHandle & { codeforcesHandle: string } =>
          user.codeforcesHandle !== null
      );

      if (users.length === 0) {
        logger.warn(
          `No users found with CF handles for event: ${eventInfo.title}`
        );
        return { status: "skipped", reason: "no-users" };
      }

      logger.info(`Found ${users.length} users to process`, {
        userCount: users.length,
      });

      // Fetch data from Codeforces API
      const contestResult = await fetchCodeforcesStandings(contestId, users);

      if (!contestResult.success) {
        return {
          status: "failed",
          reason: "api-error",
          message: contestResult.error,
        };
      }

      // Process the data and update the database
      const stats = processContestResults(
        eventInfo.id,
        users,
        contestResult.data
      );
      await updateSolveStatsInDatabase(stats);

      logger.info(`✅ Completed processing contest`, {
        contestId,
        eventTitle: eventInfo.title,
        userCount: users.length,
        totalSolves: stats.totalSolves,
        totalUpsolves: stats.totalUpsolves,
      });

      return {
        status: "success",
        usersProcessed: users.length,
        totalSolves: stats.totalSolves,
        totalUpsolves: stats.totalUpsolves,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to process contest: ${errorMessage}`, {
        contestId,
        eventTitle: eventInfo.title,
        error: errorMessage,
      });
      return { status: "failed", reason: "exception", message: errorMessage };
    }
  },
});

/**
 * Main scheduled task for updating Codeforces contest stats
 */
export const updateCodeforcesContestStats = schedules.task({
  id: "update-codeforces-contest-stats",
  description:
    "Updates solve statistics for Codeforces contests by calculating contest solves and upsolves for each user",
  // Run every 6 hours
  cron: "0 */6 * * *",
  // Set a maximum duration to prevent tasks from running indefinitely
  maxDuration: 600, // 10 minutes
  run: async (payload) => {
    try {
      const startTime = new Date();
      logger.info("🚀 Starting Codeforces Contest Statistics Update", {
        timestamp: payload.timestamp,
        lastRun: payload.lastTimestamp
          ? new Date(payload.lastTimestamp).toISOString()
          : "First run",
      });

      // Find events with CodeForces links that are part of active ranklists
      const events = await db
        .select({
          id: eventsTable.id,
          title: eventsTable.title,
          startingAt: eventsTable.startingAt,
          eventLink: eventsTable.eventLink,
        })
        .from(eventsTable)
        .innerJoin(eventRankList, eq(eventRankList.eventId, eventsTable.id))
        .innerJoin(rankLists, eq(rankLists.id, eventRankList.rankListId))
        .where(
          and(isNotNull(eventsTable.eventLink), eq(rankLists.isActive, true))
        )
        .then((events) =>
          events.filter(
            (event) =>
              event.eventLink && event.eventLink.includes("codeforces.com")
          )
        );

      if (events.length === 0) {
        logger.info("No Codeforces contests found to process");
        return { status: "complete", eventsProcessed: 0 };
      }

      logger.info(`Found ${events.length} Codeforces contests to process`, {
        contestCount: events.length,
      });

      let processedCount = 0;
      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      const results = [];

      // Process each event
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        processedCount++;

        // Extract contest ID from event link
        const contestId = extractContestId(event.eventLink || "");
        if (!contestId) {
          logger.warn(`Invalid contest URL: ${event.eventLink}`, {
            eventId: event.id,
            eventTitle: event.title,
          });
          failedCount++;
          results.push({
            eventId: event.id,
            title: event.title,
            status: "failed",
            reason: "invalid-url",
          });
          continue;
        }

        // Create a minimal event info object with only necessary fields
        const eventInfo: MinimalEventInfo = {
          id: event.id,
          title: event.title,
          startingAt: event.startingAt,
          eventLink: event.eventLink,
        };

        // Create a progress indicator string
        const progress = `${i + 1}/${events.length}`;

        // Process the contest as a subtask
        const result = await processSingleCodeforcesContest.triggerAndWait({
          eventInfo,
          contestId,
          progress,
        });

        // Track results - access the output field to get the actual result
        const output = result.ok
          ? result.output
          : { status: "failed", reason: "task-failed" };
        results.push({
          eventId: event.id,
          title: event.title,
          ...output,
        });

        // Update counters - check the status from the output
        if (output.status === "success") {
          successCount++;
        } else if (output.status === "skipped") {
          skippedCount++;
        } else {
          failedCount++;
        }
      }

      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;

      // Log final summary
      logger.info("📈 Codeforces Contest Statistics Update Complete", {
        duration: `${duration.toFixed(2)}s`,
        totalEvents: events.length,
        successful: successCount,
        failed: failedCount,
        skipped: skippedCount,
      });

      return {
        status: "complete",
        eventsProcessed: processedCount,
        successful: successCount,
        failed: failedCount,
        skipped: skippedCount,
        duration: `${duration.toFixed(2)}s`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("❌ Error in Codeforces Contest Update task", {
        error: errorMessage,
      });
      return { status: "error", message: errorMessage };
    }
  },
});

/**
 * Fetch contest standings from Codeforces API
 */
async function fetchCodeforcesStandings(
  contestId: string,
  users: UserWithCodeforcesHandle[]
): Promise<
  | { success: true; data: CodeforcesApiResponse }
  | { success: false; error: string }
> {
  const handles = users.map((user) => user.codeforcesHandle).join(";");

  logger.info(`Fetching data from Codeforces API`, {
    contestId,
    userCount: users.length,
  });

  try {
    const url = `https://codeforces.com/api/contest.standings?contestId=${contestId}&showUnofficial=true&handles=${encodeURIComponent(
      handles
    )}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Connection: "keep-alive",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`,
      };
    }

    const data = (await response.json()) as CodeforcesApiResponse;

    if (data.status !== "OK") {
      return {
        success: false,
        error: `Codeforces API returned error status: ${data.status}`,
      };
    }

    logger.info(`Successfully retrieved contest data from Codeforces`, {
      contestId,
      contestName: data.result.contest.name,
      problemCount: data.result.problems.length,
      rowCount: data.result.rows.length,
    });

    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error fetching contest data: ${errorMessage}`,
    };
  }
}

/**
 * Process contest results and prepare stats
 */
function processContestResults(
  eventId: number,
  users: UserWithCodeforcesHandle[],
  data: CodeforcesApiResponse
): {
  solveStats: SolveStatData[];
  totalSolves: number;
  totalUpsolves: number;
  userStats: Array<{
    handle: string;
    solves: number;
    upsolves: number;
    total: number;
    participationType: string;
  }>;
} {
  const solveStats: SolveStatData[] = [];
  const rows = data.result.rows;

  logger.info(`Processing statistics for ${users.length} users`);

  let totalSolves = 0;
  let totalUpsolves = 0;
  const userStats = [];

  for (const user of users) {
    // Find rows for this user - both contest participation and practice
    const contestRow = rows.find(
      (row) =>
        row.party.members[0]?.handle.toLowerCase() ===
          user.codeforcesHandle.toLowerCase() &&
        ["CONTESTANT", "OUT_OF_COMPETITION"].includes(row.party.participantType)
    );

    const practiceRow = rows.find(
      (row) =>
        row.party.members[0]?.handle.toLowerCase() ===
          user.codeforcesHandle.toLowerCase() &&
        row.party.participantType === "PRACTICE"
    );

    const stats = calculateUserStats(contestRow, practiceRow);

    totalSolves += stats.solve_count;
    totalUpsolves += stats.upsolve_count;

    solveStats.push({
      userId: user.id,
      eventId: eventId,
      solveCount: stats.solve_count,
      upsolveCount: stats.upsolve_count,
      participation: !!contestRow,
    });

    // Add to user stats for logging
    userStats.push({
      handle: user.codeforcesHandle,
      solves: stats.solve_count,
      upsolves: stats.upsolve_count,
      total: stats.solve_count + stats.upsolve_count,
      participationType: contestRow ? contestRow.party.participantType : "No",
    });
  }

  // Log summary - only include top performers
  logger.info(`Processed statistics`, {
    totalUsers: users.length,
    totalSolves,
    totalUpsolves,
    totalProblemsSolved: totalSolves + totalUpsolves,
    // Include only top 3 users by total solves for quick reference
    topUsers: [...userStats]
      .sort((a, b) => b.solves + b.upsolves - (a.solves + a.upsolves))
      .slice(0, 3),
  });

  return {
    solveStats,
    totalSolves,
    totalUpsolves,
    userStats,
  };
}

/**
 * Calculate detailed stats for a user
 */
function calculateUserStats(
  contestRow: ContestRow | undefined,
  practiceRow: ContestRow | undefined
): { solve_count: number; upsolve_count: number } {
  let solveCount = 0;
  const contestSolvedProblems: number[] = [];

  if (contestRow) {
    contestRow.problemResults.forEach((problem, index) => {
      if (problem.points > 0) {
        solveCount++;
        contestSolvedProblems.push(index);
      }
    });
  }

  let upsolveCount = 0;
  if (practiceRow) {
    practiceRow.problemResults.forEach((problem, index) => {
      if (problem.points > 0 && !contestSolvedProblems.includes(index)) {
        upsolveCount++;
      }
    });
  }

  return {
    solve_count: solveCount,
    upsolve_count: upsolveCount,
  };
}

/**
 * Update solve stats in the database
 */
async function updateSolveStatsInDatabase(stats: {
  solveStats: SolveStatData[];
}): Promise<void> {
  logger.info(`Updating database records for ${stats.solveStats.length} users`);

  // Process in chunks to avoid overwhelming the database
  const chunkSize = 100;
  const chunks: SolveStatData[][] = [];

  for (let i = 0; i < stats.solveStats.length; i += chunkSize) {
    chunks.push(stats.solveStats.slice(i, i + chunkSize));
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    logger.info(`Processing database batch ${i + 1}/${chunks.length}`, {
      batchSize: chunk.length,
      progress: `${i + 1}/${chunks.length}`,
    });

    // Create or update solve stats for each user in parallel
    await Promise.all(
      chunk.map((stat) =>
        db
          .insert(userSolveStatOnEvents)
          .values({
            userId: stat.userId,
            eventId: stat.eventId,
            solveCount: stat.solveCount,
            upsolveCount: stat.upsolveCount,
            participation: stat.participation,
          })
          .onConflictDoUpdate({
            target: [
              userSolveStatOnEvents.userId,
              userSolveStatOnEvents.eventId,
            ],
            set: {
              solveCount: stat.solveCount,
              upsolveCount: stat.upsolveCount,
              participation: stat.participation,
              updatedAt: new Date(),
            },
          })
      )
    );
  }
}
