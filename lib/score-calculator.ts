import { db } from "@/db/drizzle";
import {
  rankLists,
  rankListUser,
  eventRankList,
  userSolveStatOnEvents,
  eventUserAttendance,
  events,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Optimized function to recalculate scores for a specific rank list
 */
export async function recalculateRankListScores(rankListId: number) {
  // Get rank list info and validate
  const [rankList] = await db
    .select({
      id: rankLists.id,
      keyword: rankLists.keyword,
      weightOfUpsolve: rankLists.weightOfUpsolve,
      considerStrictAttendance: rankLists.considerStrictAttendance,
    })
    .from(rankLists)
    .where(eq(rankLists.id, rankListId))
    .limit(1);

  if (!rankList) {
    throw new Error(`Rank list with ID ${rankListId} not found`);
  }

  // Get all necessary data in a single optimized query
  const rankListData = await db
    .select({
      userId: rankListUser.userId,
      eventId: eventRankList.eventId,
      eventWeight: eventRankList.weight,
      strictAttendance: events.strictAttendance,
      solveCount: userSolveStatOnEvents.solveCount,
      upsolveCount: userSolveStatOnEvents.upsolveCount,
      participation: userSolveStatOnEvents.participation,
      hasAttendance: sql<boolean>`CASE WHEN ${eventUserAttendance.userId} IS NOT NULL THEN true ELSE false END`,
    })
    .from(rankListUser)
    .innerJoin(
      eventRankList,
      eq(eventRankList.rankListId, rankListUser.rankListId)
    )
    .innerJoin(events, eq(events.id, eventRankList.eventId))
    .leftJoin(
      userSolveStatOnEvents,
      and(
        eq(userSolveStatOnEvents.userId, rankListUser.userId),
        eq(userSolveStatOnEvents.eventId, eventRankList.eventId)
      )
    )
    .leftJoin(
      eventUserAttendance,
      and(
        eq(eventUserAttendance.userId, rankListUser.userId),
        eq(eventUserAttendance.eventId, eventRankList.eventId)
      )
    )
    .where(eq(rankListUser.rankListId, rankListId));

  // Group data by user and calculate scores
  const userScores = new Map<string, number>();
  const allUsersInRankList = new Set<string>();

  for (const row of rankListData) {
    allUsersInRankList.add(row.userId);

    if (!row.solveCount && !row.upsolveCount) continue; // Skip if no stats

    let eventSolveCount = row.solveCount || 0;
    let eventUpsolveCount = row.upsolveCount || 0;

    // Apply strict attendance logic
    if (
      row.strictAttendance &&
      rankList.considerStrictAttendance &&
      !row.participation &&
      !row.hasAttendance
    ) {
      eventUpsolveCount += eventSolveCount;
      eventSolveCount = 0;
    }

    // Calculate event score
    const eventScore =
      eventSolveCount * row.eventWeight +
      eventUpsolveCount * row.eventWeight * rankList.weightOfUpsolve;

    userScores.set(row.userId, (userScores.get(row.userId) || 0) + eventScore);
  }

  // Ensure all users in rank list have a score (even if 0)
  for (const userId of allUsersInRankList) {
    if (!userScores.has(userId)) {
      userScores.set(userId, 0);
    }
  }

  // Batch update all user scores using a single query
  if (userScores.size > 0) {
    const now = new Date();
    const userScoreValues = Array.from(userScores.entries())
      .map(
        ([userId, score]) =>
          `('${userId}', ${rankListId}, ${score}, '${now.toISOString()}')`
      )
      .join(", ");

    await db.execute(sql`
      UPDATE rank_list_user 
      SET score = temp.score, updated_at = temp.updated_at
      FROM (VALUES ${sql.raw(
        userScoreValues
      )}) AS temp(user_id, rank_list_id, score, updated_at)
      WHERE rank_list_user.user_id = temp.user_id 
        AND rank_list_user.rank_list_id = temp.rank_list_id
    `);
  }

  return {
    rankListId,
    rankListKeyword: rankList.keyword,
    updatedUsers: userScores.size,
    eventsCount: new Set(rankListData.map((row) => row.eventId)).size,
  };
}

/**
 * Optimized function to recalculate scores for all active rank lists
 */
export async function recalculateAllRankListScores() {
  const activeRankLists = await db
    .select({ id: rankLists.id, keyword: rankLists.keyword })
    .from(rankLists)
    .where(eq(rankLists.isActive, true));

  if (activeRankLists.length === 0) {
    return {
      totalRankListsProcessed: 0,
      totalUsersUpdated: 0,
      results: [],
    };
  }

  // Process all rank lists in parallel for better performance
  const results = await Promise.all(
    activeRankLists.map((rankList) => recalculateRankListScores(rankList.id))
  );

  return {
    totalRankListsProcessed: results.length,
    totalUsersUpdated: results.reduce(
      (sum, result) => sum + result.updatedUsers,
      0
    ),
    results,
  };
}
