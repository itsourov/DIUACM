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
import { recalculateAllRankListScores } from "../lib/score-calculator";

// AtCoder API endpoints
const ATCODER_API = {
  CONTESTS: "https://kenkoooo.com/atcoder/resources/contests.json",
  SUBMISSIONS: "https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions",
};

// Types for AtCoder API responses
interface AtcoderContest {
  id: string;
  start_epoch_second: number;
  duration_second: number;
  title: string;
  rate_change: string;
}

interface AtcoderSubmission {
  id: number;
  epoch_second: number;
  problem_id: string;
  contest_id: string;
  user_id: string;
  result: "AC" | string;
}

interface UserWithAtcoderHandle {
  id: string;
  atcoderHandle: string;
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
 * Extract contest ID from an AtCoder URL
 */
function extractContestId(eventLink: string): string | null {
  const match = eventLink.match(/contests\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch with retry functionality to handle temporary network issues
 */
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | undefined;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          Connection: "keep-alive",
        },
      });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  throw (
    lastError ?? new Error(`Failed to fetch ${url} after ${retries} retries`)
  );
}

/**
 * Process a single AtCoder contest
 */
export const processSingleAtcoderContest = task({
  id: "process-single-atcoder-contest",
  run: async ({
    eventInfo,
    contestId,
    progress,
  }: {
    eventInfo: MinimalEventInfo;
    contestId: string;
    progress: string;
  }) => {
    logger.info(`📊 Processing AtCoder contest ${progress}`, {
      contestId,
      eventTitle: eventInfo.title,
      startingAt: eventInfo.startingAt,
      progress,
    });

    try {
      // Get all contests from AtCoder API to find contest details
      const contestsResponse = await fetchWithRetry(ATCODER_API.CONTESTS);
      const data = await contestsResponse.json();
      // Use type assertion with validation
      if (!Array.isArray(data)) {
        throw new Error("API response is not an array");
      }
      const contests = data as AtcoderContest[];

      const contestInfo = contests.find((c) => c.id === contestId);

      if (!contestInfo) {
        logger.warn(`Contest not found in AtCoder API: ${contestId}`, {
          contestId,
          eventTitle: eventInfo.title,
        });
        return { status: "failed", reason: "contest-not-found" };
      }

      // Find all users with AtCoder handles in the ranklists associated with this event
      const usersWithHandles = await db
        .select({
          id: usersTable.id,
          atcoderHandle: usersTable.atcoderHandle,
        })
        .from(usersTable)
        .innerJoin(rankListUser, eq(rankListUser.userId, usersTable.id))
        .innerJoin(rankLists, eq(rankLists.id, rankListUser.rankListId))
        .innerJoin(eventRankList, eq(eventRankList.rankListId, rankLists.id))
        .where(
          and(
            isNotNull(usersTable.atcoderHandle),
            eq(eventRankList.eventId, eventInfo.id)
          )
        );

      // Filter out any null handles (TypeScript safety)
      const users: UserWithAtcoderHandle[] = usersWithHandles.filter(
        (user): user is UserWithAtcoderHandle & { atcoderHandle: string } =>
          user.atcoderHandle !== null
      );

      if (users.length === 0) {
        logger.warn(
          `No users found with AtCoder handles for event: ${eventInfo.title}`
        );
        return { status: "skipped", reason: "no-users" };
      }

      logger.info(`Found ${users.length} users to process`, {
        userCount: users.length,
      });

      // Process each user's submissions for this contest
      const stats = await processAtcoderUserStats(
        contestInfo,
        contestId,
        users,
        eventInfo.id
      );
      await updateSolveStatsInDatabase(stats);

      logger.info(`✅ Completed processing AtCoder contest`, {
        contestId,
        eventTitle: eventInfo.title,
        userCount: users.length,
        totalSolves: stats.totalSolves,
        totalUpsolves: stats.totalUpsolves,
        participatedUsers: stats.participatedUsers,
      });

      return {
        status: "success",
        usersProcessed: users.length,
        totalSolves: stats.totalSolves,
        totalUpsolves: stats.totalUpsolves,
        participatedUsers: stats.participatedUsers,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to process AtCoder contest: ${errorMessage}`, {
        contestId,
        eventTitle: eventInfo.title,
        error: errorMessage,
      });
      return { status: "failed", reason: "exception", message: errorMessage };
    }
  },
});

/**
 * Main scheduled task for updating AtCoder contest stats
 */
export const updateAtcoderContestStats = schedules.task({
  id: "update-atcoder-contest-stats",
  description:
    "Updates solve statistics for AtCoder contests by calculating contest solves and upsolves for each user",
  // Run every 6 hours
  cron: "0 */6 * * *",
  // Set a maximum duration to prevent tasks from running indefinitely
  maxDuration: 600, // 10 minutes
  run: async (payload) => {
    try {
      const startTime = new Date();
      logger.info("🚀 Starting AtCoder Contest Statistics Update", {
        timestamp: payload.timestamp,
        lastRun: payload.lastTimestamp
          ? new Date(payload.lastTimestamp).toISOString()
          : "First run",
      });

      // Find events with AtCoder links that are part of active ranklists
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
            (event) => event.eventLink && event.eventLink.includes("atcoder.jp")
          )
        );

      if (events.length === 0) {
        logger.info("No AtCoder contests found to process");
        return { status: "complete", eventsProcessed: 0 };
      }

      logger.info(`Found ${events.length} AtCoder contests to process`, {
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
        const result = await processSingleAtcoderContest.triggerAndWait({
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
      logger.info("📈 AtCoder Contest Statistics Update Complete", {
        duration: `${duration.toFixed(2)}s`,
        totalEvents: events.length,
        successful: successCount,
        failed: failedCount,
        skipped: skippedCount,
      });

      // Recalculate all rank list scores after processing all contests
      try {
        logger.info("🔄 Starting rank list score recalculation");
        const scoreRecalcResult = await recalculateAllRankListScores();
        logger.info("✅ Rank list score recalculation complete", {
          rankListsProcessed: scoreRecalcResult.totalRankListsProcessed,
          usersUpdated: scoreRecalcResult.totalUsersUpdated,
        });
      } catch (scoreError) {
        logger.error("❌ Error during score recalculation", {
          error:
            scoreError instanceof Error
              ? scoreError.message
              : String(scoreError),
        });
        // Don't fail the entire task if score recalculation fails
      }

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
      logger.error("❌ Error in AtCoder Contest Update task", {
        error: errorMessage,
      });
      return { status: "error", message: errorMessage };
    }
  },
});

/**
 * Process AtCoder user stats for a specific contest
 */
async function processAtcoderUserStats(
  contestInfo: AtcoderContest,
  contestId: string,
  users: UserWithAtcoderHandle[],
  eventId: number
): Promise<{
  solveStats: SolveStatData[];
  totalSolves: number;
  totalUpsolves: number;
  participatedUsers: number;
  userStats: Array<{
    handle: string;
    solves: number;
    upsolves: number;
    total: number;
    participated: boolean;
  }>;
}> {
  const solveStats: SolveStatData[] = [];
  let totalSolves = 0;
  let totalUpsolves = 0;
  let participatedUsers = 0;
  const userStats = [];

  // Process users in batches to avoid overwhelming the API
  const batchSize = 10;
  const batches = [];

  for (let i = 0; i < users.length; i += batchSize) {
    batches.push(users.slice(i, i + batchSize));
  }

  logger.info(`Processing ${users.length} users in ${batches.length} batches`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    logger.info(`Processing batch ${batchIndex + 1}/${batches.length}`);

    // Process each user in the batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (user) => {
        try {
          // Fetch user submissions from the contest start time
          const submissionsUrl = `${
            ATCODER_API.SUBMISSIONS
          }?user=${encodeURIComponent(user.atcoderHandle)}&from_second=${
            contestInfo.start_epoch_second
          }`;
          const response = await fetchWithRetry(submissionsUrl);
          const data = await response.json();

          // Type check the API response
          if (!Array.isArray(data)) {
            throw new Error("Submissions API response is not an array");
          }

          const submissions = data as AtcoderSubmission[];

          // Filter submissions for this specific contest
          const contestSubmissions = submissions.filter(
            (sub) => sub.contest_id === contestId
          );

          // Calculate solve count and upsolve count
          const contestEnd =
            contestInfo.start_epoch_second + contestInfo.duration_second;
          const solvedProblems = new Set<string>();
          const upsolvedProblems = new Set<string>();
          let participated = false;

          for (const sub of contestSubmissions) {
            const submissionTime = sub.epoch_second;

            if (
              submissionTime >= contestInfo.start_epoch_second &&
              submissionTime <= contestEnd
            ) {
              participated = true;
              if (sub.result === "AC") {
                solvedProblems.add(sub.problem_id);
              }
            } else if (
              submissionTime > contestEnd &&
              sub.result === "AC" &&
              !solvedProblems.has(sub.problem_id)
            ) {
              upsolvedProblems.add(sub.problem_id);
            }
          }

          return {
            userId: user.id,
            handle: user.atcoderHandle,
            solveCount: solvedProblems.size,
            upsolveCount: upsolvedProblems.size,
            participated,
          };
        } catch (error) {
          logger.error(`Error processing user ${user.atcoderHandle}`, {
            error: error instanceof Error ? error.message : String(error),
            handle: user.atcoderHandle,
          });

          // Return zero stats in case of error
          return {
            userId: user.id,
            handle: user.atcoderHandle,
            solveCount: 0,
            upsolveCount: 0,
            participated: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    // Process batch results
    for (const result of batchResults) {
      totalSolves += result.solveCount;
      totalUpsolves += result.upsolveCount;
      if (result.participated) {
        participatedUsers++;
      }

      solveStats.push({
        userId: result.userId,
        eventId: eventId, // Use the database event ID passed as parameter
        solveCount: result.solveCount,
        upsolveCount: result.upsolveCount,
        participation: result.participated,
      });

      userStats.push({
        handle: result.handle,
        solves: result.solveCount,
        upsolves: result.upsolveCount,
        total: result.solveCount + result.upsolveCount,
        participated: result.participated,
      });
    }

    // Add a small delay between batches to avoid rate limiting
    if (batchIndex < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Log summary - only include top performers
  logger.info(`Processed statistics`, {
    totalUsers: users.length,
    participatedUsers,
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
    participatedUsers,
    userStats,
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
            },
          })
      )
    );
  }
}
