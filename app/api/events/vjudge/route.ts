import { db } from "@/db/drizzle";
import { events, eventRankList, rankLists } from "@/db/schema";
import { NextResponse } from 'next/server';
import { eq, and, like } from "drizzle-orm";

export async function GET() {
    try {
        // Fetch events that have 'vjudge.net' in the eventLink and have non-archived ranklists
        const activeContests = await db
            .select({
                id: events.id,
                title: events.title,
                eventLink: events.eventLink,
            })
            .from(events)
            .innerJoin(eventRankList, eq(events.id, eventRankList.eventId))
            .innerJoin(rankLists, eq(eventRankList.rankListId, rankLists.id))
            .where(
                and(
                    like(events.eventLink, '%vjudge.net%'),
                    eq(rankLists.isActive, true)
                )
            );

        return NextResponse.json({ 
            success: true, 
            data: activeContests 
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching active contests:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch active contests' 
        }, { status: 500 });
    }
}