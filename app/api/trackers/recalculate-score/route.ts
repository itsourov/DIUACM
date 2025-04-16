import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/authorization";

interface ScoreResult {
  rankListId: string;
  userId: string;
  newScore: number;
}

export async function GET() {
  try {
    if (!(await hasPermission("TRACKERS:MANAGE"))) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to recalculate scores",
          details: "You do not have permission to recalculate scores",
        },
        { status: 401 }
      );
    }
    // Get all active ranklists
    const activeLists = await prisma.rankList.findMany({
      where: {
        isArchived: false,
      },
      include: {
        eventRankLists: true,
      },
    });

    let updatedScores = 0;
    const results: ScoreResult[] = [];

    // Process each active ranklist
    for (const ranklist of activeLists) {
      // Get all events associated with this ranklist
      const eventRankLists = ranklist.eventRankLists;
      const eventIds = eventRankLists.map((erl) => erl.eventId);

      // Get all users in this ranklist
      const ranklistUsers = await prisma.rankListUser.findMany({
        where: {
          rankListId: ranklist.id,
        },
      });

      // For each user in this ranklist
      for (const user of ranklistUsers) {
        // Get all solve stats for this user across all events in this ranklist
        const solveStats = await prisma.userSolveStatOnEvent.findMany({
          where: {
            userId: user.userId,
            eventId: {
              in: eventIds,
            },
          },
        });

        // Calculate total score based on formula:
        // score = solveCnt * eventWeight + upsolveCnt * eventWeight * weightOfUpsolve
        let totalScore = 0;

        for (const stat of solveStats) {
          // Find the event weight
          const eventRankList = eventRankLists.find(
            (erl) => erl.eventId === stat.eventId
          );

          if (eventRankList) {
            const eventWeight = eventRankList.weight;
            const weightOfUpsolve = ranklist.weightOfUpsolve;

            // Calculate score for this event
            const eventScore =
              stat.solveCount * eventWeight +
              stat.upsolveCount * eventWeight * weightOfUpsolve;

            totalScore += eventScore;
          }
        }

        // Update the user's score in the ranklist
        await prisma.rankListUser.update({
          where: {
            id: user.id,
          },
          data: {
            score: totalScore,
          },
        });

        updatedScores++;

        results.push({
          rankListId: ranklist.id,
          userId: user.userId,
          newScore: totalScore,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedScores} user scores across ${activeLists.length} active ranklists.`,
      results,
    });
  } catch (error) {
    console.error("Error recalculating scores:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to recalculate scores",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
