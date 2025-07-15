"use server";
import { hasPermission } from "@/lib/authorization";
import { db } from "@/db/drizzle";
import { eventRankList, events, rankLists, trackers } from "@/db/schema";
import { eq, and, like, or, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEventRanklists(eventId: number) {
    try {
        if (!(await hasPermission("EVENTS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const eventRanklistsData = await db
            .select({
                eventId: eventRankList.eventId,
                rankListId: eventRankList.rankListId,
                weight: eventRankList.weight,
                ranklist: {
                    id: rankLists.id,
                    keyword: rankLists.keyword,
                    description: rankLists.description,
                    weightOfUpsolve: rankLists.weightOfUpsolve,
                    order: rankLists.order,
                    isActive: rankLists.isActive,
                    considerStrictAttendance: rankLists.considerStrictAttendance,
                    trackerId: rankLists.trackerId,
                },
                tracker: {
                    id: trackers.id,
                    title: trackers.title,
                    slug: trackers.slug,
                },
            })
            .from(eventRankList)
            .innerJoin(rankLists, eq(eventRankList.rankListId, rankLists.id))
            .innerJoin(trackers, eq(rankLists.trackerId, trackers.id))
            .where(eq(eventRankList.eventId, eventId))
            .orderBy(rankLists.order);

        return {
            success: true,
            data: eventRanklistsData,
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
        if (!(await hasPermission("EVENTS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const existingRanklists = await db
            .select({ rankListId: eventRankList.rankListId })
            .from(eventRankList)
            .where(eq(eventRankList.eventId, eventId));

        const existingRanklistIds = existingRanklists.map((er) => er.rankListId);

        const searchConditions = [
            like(rankLists.keyword, `%${search}%`),
            like(rankLists.description, `%${search}%`),
            like(trackers.title, `%${search}%`),
        ];

        const query = db
            .select({
                id: rankLists.id,
                keyword: rankLists.keyword,
                description: rankLists.description,
                weightOfUpsolve: rankLists.weightOfUpsolve,
                order: rankLists.order,
                isActive: rankLists.isActive,
                considerStrictAttendance: rankLists.considerStrictAttendance,
                trackerId: rankLists.trackerId,
                tracker: {
                    id: trackers.id,
                    title: trackers.title,
                    slug: trackers.slug,
                },
            })
            .from(rankLists)
            .innerJoin(trackers, eq(rankLists.trackerId, trackers.id))
            .where(
                and(
                    or(...searchConditions),
                    eq(rankLists.isActive, true),
                    existingRanklistIds.length > 0 ? notInArray(rankLists.id, existingRanklistIds) : undefined
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

export async function attachRanklistToEvent(
    eventId: number,
    rankListId: number,
    weight: number = 1.0
) {
    try {
        if (!(await hasPermission("EVENTS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const existingAttachment = await db
            .select()
            .from(eventRankList)
            .where(
                and(
                    eq(eventRankList.eventId, eventId),
                    eq(eventRankList.rankListId, rankListId)
                )
            );

        if (existingAttachment.length > 0) {
            return { success: false, error: "Ranklist is already attached to this event" };
        }

        await db.insert(eventRankList).values({
            eventId,
            rankListId,
            weight,
        });

        const ranklistData = await db
            .select({
                id: rankLists.id,
                keyword: rankLists.keyword,
                description: rankLists.description,
                weightOfUpsolve: rankLists.weightOfUpsolve,
                order: rankLists.order,
                isActive: rankLists.isActive,
                considerStrictAttendance: rankLists.considerStrictAttendance,
                trackerId: rankLists.trackerId,
                tracker: {
                    id: trackers.id,
                    title: trackers.title,
                    slug: trackers.slug,
                },
            })
            .from(rankLists)
            .innerJoin(trackers, eq(rankLists.trackerId, trackers.id))
            .where(eq(rankLists.id, rankListId));

        revalidatePath(`/admin/events/${eventId}/ranklists`);

        return {
            success: true,
            data: {
                eventId,
                rankListId,
                weight,
                ranklist: {
                    id: ranklistData[0].id,
                    keyword: ranklistData[0].keyword,
                    description: ranklistData[0].description,
                    weightOfUpsolve: ranklistData[0].weightOfUpsolve,
                    order: ranklistData[0].order,
                    isActive: ranklistData[0].isActive,
                    considerStrictAttendance: ranklistData[0].considerStrictAttendance,
                    trackerId: ranklistData[0].trackerId,
                },
                tracker: ranklistData[0].tracker,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Something went wrong while attaching the ranklist.",
        };
    }
}

export async function detachRanklistFromEvent(eventId: number, rankListId: number) {
    try {
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
            message: "Ranklist detached successfully",
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Something went wrong while detaching the ranklist.",
        };
    }
}

export async function updateRanklistWeight(
    eventId: number,
    rankListId: number,
    weight: number
) {
    try {
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
            error: "Something went wrong while updating the weight.",
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