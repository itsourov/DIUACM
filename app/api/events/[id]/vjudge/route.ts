import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  vjudgeHandle: string;
  username: string;
}

interface RankListUser {
  user: UserWithVjudgeHandle;
}

interface RankList {
  id: number;
  rankListUsers: RankListUser[];
}

interface EventRankList {
  rankList: RankList;
}

interface EventAttendance {
  userId: string;
}

interface EventData {
  id: number;
  strictAttendance: boolean;
  attendances: EventAttendance[];
  rankLists: EventRankList[];
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
      solved: Object.fromEntries(Array(50).fill(0).map((_, i) => [i, 0]))
    };
  });

  // First pass: Process in-time submissions
  if (Array.isArray(data.submissions)) {
    data.submissions.forEach(([participantId, problemIndex, isAccepted, timestamp]) => {
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
    });
  }

  // Second pass: Process upsolve submissions
  if (Array.isArray(data.submissions)) {
    data.submissions.forEach(([participantId, problemIndex, isAccepted, timestamp]) => {
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
    });
  }

  return processed;
}

// Helper function to chunk array for batch processing
const chunkArray = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const eventId = parseInt(awaitedParams.id);
    
    if (isNaN(eventId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid event ID'
      }, { status: 400 });
    }
    
    // Parse the request body
    const payload: VjudgeContestData = await request.json();
    
    if (!payload || !payload.participants || typeof payload.length !== 'number') {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid payload format'
      }, { status: 400 });
    }
    
    
    // Get event data with related users - OPTIMIZED to fetch only required fields
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        strictAttendance: true, // Only required for attendance logic
        attendances: {
          select: {
            userId: true // Only need user IDs for attendance check
          }
        },
        rankLists: {
          select: {
            rankList: {
              select: {
                id: true, // Only need ranklist ID
                rankListUsers: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        vjudgeHandle: true, // Required for matching with VJudge data
                        username: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }) as EventData | null;
    
    if (!event) {
      return NextResponse.json({ 
        success: false, 
        message: 'Event not found'
      }, { status: 404 });
    }
    
    // Process the VJudge data
    const processedData = processVjudgeData(payload);
    
    // Get all users from ranklists associated with this event
    const users = event.rankLists
      .flatMap((erl: EventRankList) => erl.rankList.rankListUsers)
      .map((rlu: RankListUser) => rlu.user)
      .filter((user: UserWithVjudgeHandle | null): user is UserWithVjudgeHandle =>
        Boolean(user?.vjudgeHandle)
      )
      .filter((user: UserWithVjudgeHandle, index: number, self: UserWithVjudgeHandle[]) =>
        index === self.findIndex((u: UserWithVjudgeHandle) => u.id === user.id)
      );
    
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No users with VJudge handles found in the ranklists"
      }, { status: 400 });
    }
    
    // Create a Set of participating user IDs for quick lookup
    const participatingUserIds = new Set(
      event.strictAttendance ? event.attendances.map((ea: EventAttendance) => ea.userId) : []
    );
    
    // Delete existing solve stats - Use a non-blocking operation first since this doesn't depend on other operations
    const deleteOperation = prisma.userSolveStatOnEvent.deleteMany({
      where: { eventId }
    });
    
    // Process users in chunks of 10 to avoid overloading the database
    const userChunks = chunkArray(users, 10);
    
    // Await the deletion before proceeding with insertions
    await deleteOperation;
    
    for (const chunk of userChunks) {
      await prisma.$transaction(
        async (tx) => {
          await Promise.all(chunk.map((user: UserWithVjudgeHandle) => {
            const stats = user.vjudgeHandle ? processedData[user.vjudgeHandle] : null;
            
            let finalSolveCount = stats?.solveCount ?? 0;
            let finalUpsolveCount = stats?.upSolveCount ?? 0;
            
            // If strict attendance is enabled and user is not in eventAttendances
            if (event.strictAttendance && !participatingUserIds.has(user.id)) {
              finalUpsolveCount += finalSolveCount; // Move solves to upsolves
              finalSolveCount = 0;
            }
            
            return tx.userSolveStatOnEvent.create({
              data: {
                userId: user.id,
                eventId,
                solveCount: finalSolveCount,
                upsolveCount: finalUpsolveCount,
                // Mark as participated if strict attendance is enabled and user is in eventAttendances
                participation: event.strictAttendance ? 
                  participatingUserIds.has(user.id) : 
                  !(stats?.absent ?? true),
              }
            });
          }));
        },
        {
          timeout: 10000 // 10 second timeout
        }
      );
    }
    

    
    return NextResponse.json({ 
      success: true, 
      message: 'VJudge data processed and database updated successfully',
      data: processedData
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing VJudge data:', error);
    return NextResponse.json({ 
        success: false, 
        message: 'Failed to process VJudge data',
        error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}