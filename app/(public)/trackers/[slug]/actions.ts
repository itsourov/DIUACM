"use server";

import { prisma } from "@/lib/prisma";
import { Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// Function to get a specific tracker by slug
export async function getTrackerBySlug(slug: string) {
  const tracker = await prisma.tracker.findUnique({
    where: {
      slug,
      status: Visibility.PUBLISHED,
    },
    include: {
      rankLists: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          keyword: true,
          description: true,
          weightOfUpsolve: true,
        },
      },
    },
  });

  return tracker;
}

// Function to get ranklist by keyword for a specific tracker
export async function getRankListByKeyword(
  trackerId: string,
  keyword: string | undefined
) {
  let rankList = await prisma.rankList.findUnique({
    where: {
      trackerId_keyword: {
        trackerId,
        keyword: keyword || "default",
      },
    },
    include: {
      rankListUsers: {
        orderBy: {
          score: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
      eventRankLists: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
  if (!rankList) {
    rankList = await prisma.rankList.findFirst({
      where: {
        trackerId,
      },
      include: {
        rankListUsers: {
          orderBy: {
            score: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        eventRankLists: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  return rankList;
}

// Function to get user's solve stats for all events in a ranklist
export async function getUserSolveStats(userId: string, rankListId: string) {
  const rankList = await prisma.rankList.findUnique({
    where: {
      id: rankListId,
    },
    include: {
      eventRankLists: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!rankList) {
    return null;
  }

  const eventIds = rankList.eventRankLists.map((erl) => erl.eventId);

  const solveStats = await prisma.userSolveStatOnEvent.findMany({
    where: {
      userId,
      eventId: {
        in: eventIds,
      },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startingAt: true,
          endingAt: true,
        },
      },
    },
  });

  // Calculate points for each event based on the ranklist weight
  const statsWithPoints = solveStats.map((stat) => {
    const eventRankList = rankList.eventRankLists.find(
      (erl) => erl.eventId === stat.eventId
    );

    const weight = eventRankList?.weight || 1;
    const upsolveWeight = rankList.weightOfUpsolve;

    const points =
      stat.solveCount * weight + stat.upsolveCount * upsolveWeight * weight;

    return {
      ...stat,
      weight,
      upsolveWeight,
      points,
    };
  });

  return statsWithPoints;
}

// Function to join a ranklist (for logged in users)
export async function joinRanklist(rankListId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to join a ranklist",
      };
    }

    const userId = session.user.id;

    // Check if user is already in the ranklist
    const existingEntry = await prisma.rankListUser.findFirst({
      where: {
        userId,
        rankListId,
      },
    });

    if (existingEntry) {
      return {
        success: false,
        error: "You are already part of this ranklist",
      };
    }

    // Add user to ranklist with initial score of 0
    await prisma.rankListUser.create({
      data: {
        rankListId,
        userId,
        score: 0,
      },
    });

    // Revalidate the path to update the UI
    revalidatePath(`/trackers/[slug]`, "page");

    return {
      success: true,
      message:
        "You have successfully joined the ranklist. Your score will be updated automatically soon.",
    };
  } catch (error) {
    console.error("Join ranklist error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Function to leave a ranklist (for logged in users)
export async function leaveRanklist(rankListId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to leave a ranklist",
      };
    }

    const userId = session.user.id;

    // Check if user is in the ranklist
    const existingEntry = await prisma.rankListUser.findFirst({
      where: {
        userId,
        rankListId,
      },
    });

    if (!existingEntry) {
      return {
        success: false,
        error: "You are not part of this ranklist",
      };
    }

    // Remove user from ranklist
    await prisma.rankListUser.delete({
      where: {
        id: existingEntry.id,
      },
    });

    // Revalidate the path to update the UI
    revalidatePath(`/trackers/[slug]`, "page");

    return {
      success: true,
      message: "You have successfully left the ranklist",
    };
  } catch (error) {
    console.error("Leave ranklist error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Function to get all solve stats for a ranklist with grid view data
export async function getRanklistSolveStatsForGrid(rankListId: string) {
  // Get all events in this ranklist
  const rankList = await prisma.rankList.findUnique({
    where: { id: rankListId },
    include: {
      eventRankLists: {
        include: {
          event: true,
        },
        orderBy: {
          event: {
            startingAt: "asc",
          },
        },
      },
    },
  });

  if (!rankList) return null;

  // Get all users in this ranklist
  const rankListUsers = await prisma.rankListUser.findMany({
    where: { rankListId },
    orderBy: { score: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  // Get all events in this ranklist
  const eventIds = rankList.eventRankLists.map((erl) => erl.eventId);

  // Fetch all solve stats for these events
  const solveStats = await prisma.userSolveStatOnEvent.findMany({
    where: {
      eventId: { in: eventIds },
      userId: { in: rankListUsers.map((rlu) => rlu.userId) },
    },
  });

  return {
    rankList,
    users: rankListUsers,
    events: rankList.eventRankLists,
    solveStats,
  };
}
