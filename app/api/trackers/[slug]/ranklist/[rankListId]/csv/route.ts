import { NextRequest, NextResponse } from "next/server";
import { generateRankListCSV } from "@/app/(public)/trackers/actions";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string; rankListId: string }> }
) {
  try {
    const { rankListId } = await context.params;

    const rankListIdNum = parseInt(rankListId);
    if (isNaN(rankListIdNum)) {
      return NextResponse.json(
        { error: "Invalid rank list ID" },
        { status: 400 }
      );
    }

    const csvContent = await generateRankListCSV(rankListIdNum);

    // Create response with CSV content
    const response = new NextResponse(csvContent);

    // Set headers for file download
    response.headers.set("Content-Type", "text/csv");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="ranklist-${rankListId}.csv"`
    );

    return response;
  } catch (error) {
    console.error("Error generating CSV:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV" },
      { status: 500 }
    );
  }
}
