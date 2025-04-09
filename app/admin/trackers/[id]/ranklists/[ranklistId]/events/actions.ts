"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRanklistEvents(rankListId: string) {
  try {
    const events = await prisma.eventRankList.findMany({
      where: { rankListId },
      include: {
        event: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: events,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function searchEventsForRanklist(
  rankListId: string,
  search: string,
  limit: number = 10
) {
  try {
    // Find events that aren't already connected to this ranklist
    // and match the search query
    const events = await prisma.event.findMany({
      where: {
        AND: [
          {
            title: { contains: search, mode: "insensitive" },
          },
          {
            rankLists: {
              none: { rankListId },
            },
          },
        ],
      },
      take: limit,
      orderBy: { startingAt: "desc" },
    });

    return {
      success: true,
      data: events,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function addEventToRanklist(
  rankListId: string,
  eventId: number,
  weight: number = 1.0
) {
  try {
    // Clamp weight between 0 and 1
    const clampedWeight = Math.max(0, Math.min(1, weight));

    const eventRanklist = await prisma.eventRankList.create({
      data: {
        rankListId,
        eventId,
        weight: clampedWeight,
      },
      include: {
        event: true,
      },
    });

    revalidatePath(`/admin/trackers/${rankListId}/ranklists/events`);

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

export async function updateEventWeight(
  eventRanklistId: string,
  rankListId: string,
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
        event: true,
      },
    });

    revalidatePath(`/admin/trackers/${rankListId}/ranklists/events`);

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

export async function removeEventFromRanklist(
  eventRanklistId: string,
  rankListId: string
) {
  try {
    await prisma.eventRankList.delete({
      where: { id: eventRanklistId },
    });

    revalidatePath(`/admin/trackers/${rankListId}/ranklists/events`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
