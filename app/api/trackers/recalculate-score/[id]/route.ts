import { NextRequest, NextResponse } from "next/server";
import { recalculateRankListScores } from "@/lib/score-calculator";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const rankListId = parseInt(id);

    if (isNaN(rankListId)) {
      return NextResponse.json(
        { success: false, error: "Invalid rank list ID" },
        { status: 400 }
      );
    }

    const result = await recalculateRankListScores(rankListId);

    return NextResponse.json({
      success: true,
      message: `Recalculated scores for "${result.rankListKeyword}"`,
      ...result,
    });
  } catch (error) {
    const isNotFound =
      error instanceof Error && error.message.includes("not found");

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
