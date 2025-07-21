import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { rankLists, rankListUser } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { recalculateAllRankListScores } from "@/lib/score-calculator";

/**
 * POST: Recalculates scores for all active rank lists
 * GET: Returns information about rank lists
 */
export async function POST() {
  try {
    const result = await recalculateAllRankListScores();

    return NextResponse.json({
      success: true,
      message: `Recalculated scores for ${result.totalRankListsProcessed} rank lists`,
      ...result,
    });
  } catch (error) {
    console.error("Score recalculation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [activeCount, totalUsers] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(rankLists)
        .where(eq(rankLists.isActive, true)),
      db.select({ count: sql<number>`count(*)` }).from(rankListUser),
    ]);

    return NextResponse.json({
      success: true,
      info: {
        activeRankLists: activeCount[0]?.count || 0,
        totalUsersInRankLists: totalUsers[0]?.count || 0,
      },
      message: "Use POST method to trigger score recalculation",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to get info" },
      { status: 500 }
    );
  }
}
