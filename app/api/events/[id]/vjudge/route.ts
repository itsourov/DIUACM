import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { 
  events, 
  eventUserAttendance, 
  eventRankList, 
  rankListUser, 
  users, 
  userSolveStatOnEvents 
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

// Types
interface ParticipantInfo {
  0: string; // username
  1: string; // nickname
  2?: string; // avatar URL (optional)
}

interface VjudgeContestData {
  length: number;
  participants: Record<string, ParticipantInfo>;
  submissions?: [number, number, number, number][]; // [participantId, problemIndex, isAccepted, timestamp]
}

interface UserStats {
  solveCount: number;
  upSolveCount: number;
  absent: boolean;
  solved: Record<number, number>;
}

interface ProcessedContestData {
  [username: string]: UserStats;
}

interface UserWithVjudgeHandle {
  id: string;
  vjudgeHandle: string | null;
  username: string;
}

function processVjudgeData(data: VjudgeContestData): ProcessedContestData {
  const timeLimit = data.length / 1000;
  const processed: ProcessedContestData = {};

  // Initialize user stats
  Object.entries(data.participants).forEach(([, participant]) => {
    const username = participant[0];
    processed[username] = {
      solveCount: 0,
      upSolveCount: 0,
      absent: true,
      solved: Object.fromEntries(
        Array(50)
          .fill(0)
          .map((_, i) => [i, 0])
      ),
    };
  });

  // First pass: Process in-time submissions
  if (Array.isArray(data.submissions)) {
    data.submissions.forEach(
      ([participantId, problemIndex, isAccepted, timestamp]) => {
        const participant = data.participants[participantId.toString()];
        if (!participant) return;

        const username = participant[0];
        const userStats = processed[username];
        if (!userStats) return;

        if (timestamp > timeLimit) return;
        userStats.absent = false;

        if (isAccepted === 1) {
          if (!userStats.solved[problemIndex]) {
            userStats.solveCount += 1;
            userStats.solved[problemIndex] = 1;
          }
        }
      }
    );
  }

  // Second pass: Process upsolve submissions
  if (Array.isArray(data.submissions)) {
    data.submissions.forEach(
      ([participantId, problemIndex, isAccepted, timestamp]) => {
        const participant = data.participants[participantId.toString()];
        if (!participant) return;

        const username = participant[0];
        const userStats = processed[username];
        if (!userStats) return;

        if (isAccepted === 1 && timestamp > timeLimit) {
          if (!userStats.solved[problemIndex]) {
            userStats.upSolveCount += 1;
            userStats.solved[problemIndex] = 1;
          }
        }
      }
    );
  }

  return processed;
}

// Helper function to chunk array for batch processing
const chunkArray = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const eventId = parseInt(awaitedParams.id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

    // Parse the request body
    const payload: VjudgeContestData = await request.json();

    if (
      !payload ||
      !payload.participants ||
      typeof payload.length !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload format",
        },
        { status: 400 }
      );
    }

    // Get event data with related users - OPTIMIZED to fetch only required fields
    const event = await db
      .select({
        id: events.id,
        strictAttendance: events.strictAttendance,
      })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event || event.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    const eventData = event[0];

    // Get attendances for this event
    const attendances = await db
      .select({ userId: eventUserAttendance.userId })
      .from(eventUserAttendance)
      .where(eq(eventUserAttendance.eventId, eventId));

    // Get ranklists associated with this event
    const eventRankLists = await db
      .select({
        rankListId: eventRankList.rankListId,
      })
      .from(eventRankList)
      .where(eq(eventRankList.eventId, eventId));

    if (eventRankLists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No ranklists found for this event",
        },
        { status: 400 }
      );
    }

    // Get users from ranklists with their vjudge handles
    const rankListIds = eventRankLists.map(erl => erl.rankListId);
    const usersFromRankLists = await db
      .select({
        id: users.id,
        vjudgeHandle: users.vjudgeHandle,
        username: users.username,
      })
      .from(rankListUser)
      .innerJoin(users, eq(rankListUser.userId, users.id))
      .where(inArray(rankListUser.rankListId, rankListIds));

    // Filter users with vjudge handles and remove duplicates
    const uniqueUsers = usersFromRankLists
      .filter((user): user is UserWithVjudgeHandle => Boolean(user.vjudgeHandle))
      .filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );

    if (uniqueUsers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No users with VJudge handles found in the ranklists",
        },
        { status: 400 }
      );
    }

    // Process the VJudge data
    const processedData = processVjudgeData(payload);

    // Create a Set of participating user IDs for quick lookup
    const participatingUserIds = new Set(
      eventData.strictAttendance
        ? attendances.map(ea => ea.userId)
        : []
    );

    // Delete existing solve stats for this event
    await db
      .delete(userSolveStatOnEvents)
      .where(eq(userSolveStatOnEvents.eventId, eventId));

    // Process users in chunks of 10 to avoid overloading the database
    const userChunks = chunkArray(uniqueUsers, 10);

    for (const chunk of userChunks) {
      const insertData = chunk.map((user: UserWithVjudgeHandle) => {
        const stats = user.vjudgeHandle
          ? processedData[user.vjudgeHandle]
          : null;

        let finalSolveCount = stats?.solveCount ?? 0;
        let finalUpsolveCount = stats?.upSolveCount ?? 0;

        // If strict attendance is enabled and user is not in eventAttendances
        if (
          eventData.strictAttendance &&
          !participatingUserIds.has(user.id)
        ) {
          finalUpsolveCount += finalSolveCount; // Move solves to upsolves
          finalSolveCount = 0;
        }

        return {
          userId: user.id,
          eventId,
          solveCount: finalSolveCount,
          upsolveCount: finalUpsolveCount,
          // Mark as participated if strict attendance is enabled and user is in eventAttendances
          participation: eventData.strictAttendance
            ? participatingUserIds.has(user.id)
            : !(stats?.absent ?? true),
        };
      });

      // Insert the data for this chunk
      await db.insert(userSolveStatOnEvents).values(insertData);
    }

    return NextResponse.json(
      {
        success: true,
        message: "VJudge data processed and database updated successfully",
        data: processedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing VJudge data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process VJudge data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
