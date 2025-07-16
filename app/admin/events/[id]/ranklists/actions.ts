"use server";
import { hasPermission } from "@/lib/authorization";
import { db } from "@/db/drizzle";
import { eventRankList, rankLists, events, trackers } from "@/db/schema";
import { eq, and, like, or, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEventRanklists(eventId: number) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const ranklists = await db
      .select({
        eventId: eventRankList.eventId,
        rankListId: eventRankList.rankListId,
        weight: eventRankList.weight,
        rankList: {
          id: rankLists.id,
          keyword: rankLists.keyword,
          description: rankLists.description,
          trackerId: rankLists.trackerId,
        },
        tracker: {
          title: trackers.title,
        },
      })
      .from(eventRankList)
      .innerJoin(rankLists, eq(eventRankList.rankListId, rankLists.id))
      .leftJoin(trackers, eq(rankLists.trackerId, trackers.id))
      .where(eq(eventRankList.eventId, eventId))
      .orderBy(rankLists.keyword);

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

export async function searchRanklistsForEvent(
  eventId: number,
  search: string,
  limit: number = 10
) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Get ranklists that are already attached to this event
    const existingRanklists = await db
      .select({ rankListId: eventRankList.rankListId })
      .from(eventRankList)
      .where(eq(eventRankList.eventId, eventId));

    const existingRanklistIds = existingRanklists.map((r) => r.rankListId);

    // Build search conditions
    const searchConditions = [
      like(rankLists.keyword, `%${search}%`),
      like(rankLists.description, `%${search}%`),
    ];

    // Search for ranklists excluding existing ones
    const query = db
      .select({
        id: rankLists.id,
        keyword: rankLists.keyword,
        description: rankLists.description,
        trackerId: rankLists.trackerId,
        tracker: {
          title: trackers.title,
        },
      })
      .from(rankLists)
      .leftJoin(trackers, eq(rankLists.trackerId, trackers.id))
      .where(
        and(
          or(...searchConditions),
          existingRanklistIds.length > 0
            ? notInArray(rankLists.id, existingRanklistIds)
            : undefined
        )
      )
      .limit(limit);

    const searchResults = await query;

    return {
      success: true,
      data: searchResults,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong while searching ranklists.",
    };
  }
}

export async function addEventRanklist(
  eventId: number,
  rankListId: number,
  weight: number = 1
) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if ranklist is already attached to this event
    const existingRanklist = await db
      .select()
      .from(eventRankList)
      .where(
        and(
          eq(eventRankList.eventId, eventId),
          eq(eventRankList.rankListId, rankListId)
        )
      );

    if (existingRanklist.length > 0) {
      return {
        success: false,
        error: "Ranklist is already attached to this event",
      };
    }

    // Add the ranklist to the event
    await db.insert(eventRankList).values({
      eventId,
      rankListId,
      weight,
    });

    // Get the ranklist details for the response
    const ranklistWithDetails = await db
      .select({
        eventId: eventRankList.eventId,
        rankListId: eventRankList.rankListId,
        weight: eventRankList.weight,
        rankList: {
          id: rankLists.id,
          keyword: rankLists.keyword,
          description: rankLists.description,
          trackerId: rankLists.trackerId,
        },
        tracker: {
          title: trackers.title,
        },
      })
      .from(eventRankList)
      .innerJoin(rankLists, eq(eventRankList.rankListId, rankLists.id))
      .leftJoin(trackers, eq(rankLists.trackerId, trackers.id))
      .where(
        and(
          eq(eventRankList.eventId, eventId),
          eq(eventRankList.rankListId, rankListId)
        )
      )
      .limit(1);

    revalidatePath(`/admin/events/${eventId}/ranklists`);

    return {
      success: true,
      data: ranklistWithDetails[0],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong while adding the ranklist.",
    };
  }
}

export async function updateEventRanklistWeight(
  eventId: number,
  rankListId: number,
  weight: number
) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(eventRankList)
      .set({ weight })
      .where(
        and(
          eq(eventRankList.eventId, eventId),
          eq(eventRankList.rankListId, rankListId)
        )
      );

    revalidatePath(`/admin/events/${eventId}/ranklists`);

    return {
      success: true,
      message: "Ranklist weight updated successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong while updating the ranklist weight.",
    };
  }
}

export async function removeEventRanklist(eventId: number, rankListId: number) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .delete(eventRankList)
      .where(
        and(
          eq(eventRankList.eventId, eventId),
          eq(eventRankList.rankListId, rankListId)
        )
      );

    revalidatePath(`/admin/events/${eventId}/ranklists`);

    return {
      success: true,
      message: "Ranklist removed successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong while removing the ranklist.",
    };
  }
}

export async function getEvent(eventId: number) {
  try {
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return { success: false, error: "Event not found" };
    }

    return {
      success: true,
      data: event[0],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong while fetching the event.",
    };
  }
}
