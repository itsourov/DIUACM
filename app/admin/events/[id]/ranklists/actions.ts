"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get all ranklists associated with a specific event
 */
export async function getEventRanklists(eventId: number) {
  try {
    const eventRanklists = await prisma.eventRankList.findMany({
      where: { eventId },
      include: {
        rankList: {
          include: {
            tracker: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: eventRanklists,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Search ranklists that are not yet associated with the event
 */
export async function searchRanklistsForEvent(
  eventId: number,
  search: string,
  limit: number = 10
) {
  try {
    // Find ranklists that aren't connected to this event
    // and match the search query
    const ranklists = await prisma.rankList.findMany({
      where: {
        AND: [
          {
            OR: [
              { keyword: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { tracker: { title: { contains: search, mode: "insensitive" } } },
            ],
          },
          {
            eventRankLists: {
              none: { eventId },
            },
          },
        ],
      },
      include: {
        tracker: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: ranklists,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Add a ranklist to an event
 */
export async function addRanklistToEvent(
  eventId: number,
  rankListId: string,
  weight: number = 1.0
) {
  try {
    // Clamp weight between 0 and 1
    const clampedWeight = Math.max(0, Math.min(1, weight));

    const eventRanklist = await prisma.eventRankList.create({
      data: {
        eventId,
        rankListId,
        weight: clampedWeight,
      },
      include: {
        rankList: {
          include: {
            tracker: true,
          },
        },
      },
    });

    revalidatePath(`/admin/events/${eventId}/ranklists`);

    return {
      success: true,
      data: eventRanklist,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Update the weight of a ranklist in an event
 */
export async function updateRanklistWeight(
  eventRanklistId: string,
  eventId: number,
  weight: number
) {
  try {
    // Clamp weight between 0 and 1
    const clampedWeight = Math.max(0, Math.min(1, weight));

    const eventRanklist = await prisma.eventRankList.update({
      where: { id: eventRanklistId },
      data: {
        weight: clampedWeight,
      },
      include: {
        rankList: {
          include: {
            tracker: true,
          },
        },
      },
    });

    revalidatePath(`/admin/events/${eventId}/ranklists`);

    return {
      success: true,
      data: eventRanklist,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Remove a ranklist from an event
 */
export async function removeRanklistFromEvent(
  eventRanklistId: string,
  eventId: number
) {
  try {
    await prisma.eventRankList.delete({
      where: { id: eventRanklistId },
    });

    revalidatePath(`/admin/events/${eventId}/ranklists`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
