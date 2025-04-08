"use server";

import { prisma } from "@/lib/prisma";
import { Visibility } from "@prisma/client";

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

// Function to get ranklist with users
export async function getRankList(rankListId: string) {
  const rankList = await prisma.rankList.findUnique({
    where: {
      id: rankListId,
    },
    include: {
      tracker: {
        select: {
          title: true,
          description: true,
          slug: true,
        },
      },
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
