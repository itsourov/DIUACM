"use server";

import { prisma } from "@/lib/prisma";
import { Visibility } from "@prisma/client";



// Function to get all published trackers
export async function getTrackers(){
  const trackers = await prisma.tracker.findMany({
    where: {
      status: Visibility.PUBLISHED,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      rankLists: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          keyword: true,
        },
      },
      _count: {
        select: {
          rankLists: true,
        },
      },
    },
  });

  return trackers;
}

// Function to get latest ranklist ID for a tracker
export async function getLatestRankListId(
  trackerSlug: string
): Promise<string | null> {
  const tracker = await prisma.tracker.findUnique({
    where: {
      slug: trackerSlug,
    },
    include: {
      rankLists: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
        },
      },
    },
  });

  if (!tracker || tracker.rankLists.length === 0) {
    return null;
  }

  return tracker.rankLists[0].id;
}
