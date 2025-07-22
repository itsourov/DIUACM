import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { events, eventRankList, rankLists } from "@/db/schema";
import { hasPermission } from "@/lib/authorization";
import { eq } from "drizzle-orm";
import { fetchContestData } from "@/app/admin/events/actions";
import type { EventFormValues } from "@/app/admin/events/schemas/event";

// Schema for the API request
const createEventSchema = z.object({
  eventLink: z.string().url("Must be a valid URL"),
  eventPassword: z.string().optional(),
  weight: z.number().min(0, "Weight must be a non-negative number"),
  ranklistId: z
    .number()
    .int()
    .positive("Ranklist ID must be a positive integer"),
});

// Type for contest data response
type ContestDataResponse =
  | { success: true; data: Partial<EventFormValues> }
  | { success: false; error: string };

export async function POST(request: NextRequest) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createEventSchema.parse(body);
    const { eventLink, eventPassword, weight, ranklistId } = validatedData;

    // Check if ranklist exists and is active
    const ranklist = await db
      .select({
        id: rankLists.id,
        keyword: rankLists.keyword,
        trackerId: rankLists.trackerId,
        isActive: rankLists.isActive,
      })
      .from(rankLists)
      .where(eq(rankLists.id, ranklistId))
      .limit(1);

    if (ranklist.length === 0) {
      return NextResponse.json(
        { success: false, error: "Ranklist not found" },
        { status: 404 }
      );
    }

    if (!ranklist[0].isActive) {
      return NextResponse.json(
        { success: false, error: "Ranklist is not active" },
        { status: 400 }
      );
    }

    // Check if an event with the same eventLink already exists
    const existingEvent = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.eventLink, eventLink))
      .limit(1);

    if (existingEvent.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "An event with this event link already exists",
        },
        { status: 409 }
      );
    }

    // Fetch contest data from the event link
    const contestDataResponse = (await fetchContestData(
      eventLink
    )) as ContestDataResponse;

    if (!contestDataResponse.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            contestDataResponse.error ||
            "Failed to fetch contest data from the provided link",
        },
        { status: 400 }
      );
    }

    // At this point, we know contestDataResponse.success is true, so data exists
    const contestData = contestDataResponse.data;

    // Create the event with fetched data
    const eventData = {
      ...contestData,
      eventLink,
      eventPassword: eventPassword || null,
    };

    const [newEvent] = await db
      .insert(events)
      .values({
        title: eventData.title || "",
        description: eventData.description || null,
        status: eventData.status || "published",
        startingAt: eventData.startingAt || new Date(),
        endingAt: eventData.endingAt || new Date(),
        eventLink: eventData.eventLink,
        eventPassword: eventData.eventPassword,
        openForAttendance: eventData.openForAttendance || false,
        strictAttendance: eventData.strictAttendance || false,
        type: eventData.type || "contest",
        participationScope: eventData.participationScope || "open_for_all",
      })
      .returning({
        id: events.id,
        title: events.title,
        eventLink: events.eventLink,
      });

    // Add the event to the ranklist with the specified weight
    await db.insert(eventRankList).values({
      eventId: newEvent.id,
      rankListId: ranklistId,
      weight,
    });

    // Return success response with created event data
    return NextResponse.json(
      {
        success: true,
        message: "Event created and added to ranklist successfully",
        data: {
          event: newEvent,
          ranklist: {
            id: ranklist[0].id,
            keyword: ranklist[0].keyword,
            trackerId: ranklist[0].trackerId,
          },
          weight,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
