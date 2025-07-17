"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { events, eventUserAttendance } from "@/db/schema";
import { eventFormSchema, type EventFormValues } from "./schemas/event";
import { hasPermission } from "@/lib/authorization";
import { ParticipationScope, EventType, VisibilityStatus } from "@/db/schema";
import { eq, and, or, ilike, count, desc } from "drizzle-orm";

// Create a new event
export async function createEvent(values: EventFormValues) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const validatedFields = eventFormSchema.parse(values);

    await db.insert(events).values({
      ...validatedFields,
      // Handle nullable fields
      description: validatedFields.description || null,
      eventLink: validatedFields.eventLink || null,
      eventPassword: validatedFields.eventPassword || null,
    });

    revalidatePath("/admin/events");
    return { success: true, message: "Event created successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error creating event:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Update an existing event
export async function updateEvent(id: number, values: EventFormValues) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const validatedFields = eventFormSchema.parse(values);

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!existingEvent.length) {
      return {
        success: false,
        error: "Event not found.",
      };
    }

    await db
      .update(events)
      .set({
        ...validatedFields,
        description: validatedFields.description || null,
        eventLink: validatedFields.eventLink || null,
        eventPassword: validatedFields.eventPassword || null,
      })
      .where(eq(events.id, id));

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}/edit`);
    revalidatePath(`/events/${id}`);
    return { success: true, message: "Event updated successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error updating event:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Delete an event
export async function deleteEvent(id: number) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!existingEvent.length) {
      return {
        success: false,
        error: "Event not found.",
      };
    }

    await db.delete(events).where(eq(events.id, id));

    revalidatePath("/admin/events");
    return { success: true, message: "Event deleted successfully" };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get a single event by ID
export async function getEvent(id: number) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event.length) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event[0] };
  } catch (error) {
    console.error("Error fetching event:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get paginated events with optional filtering
export async function getPaginatedEvents(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  type?: string
) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const skip = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions = [];

    // Add search filter if provided
    if (search) {
      whereConditions.push(
        or(
          ilike(events.title, `%${search}%`),
          ilike(events.description, `%${search}%`)
        )
      );
    }

    // Add type filter if provided
    if (type && type !== "ALL") {
      whereConditions.push(
        eq(events.type, type as "contest" | "class" | "other")
      );
    }

    // Combine conditions
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Execute the queries
    const [eventsResult, totalCountResult] = await Promise.all([
      db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          status: events.status,
          startingAt: events.startingAt,
          endingAt: events.endingAt,
          eventLink: events.eventLink,
          eventPassword: events.eventPassword,
          openForAttendance: events.openForAttendance,
          strictAttendance: events.strictAttendance,
          type: events.type,
          participationScope: events.participationScope,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          _count: {
            attendances: count(eventUserAttendance.eventId),
          },
        })
        .from(events)
        .leftJoin(
          eventUserAttendance,
          eq(events.id, eventUserAttendance.eventId)
        )
        .where(whereClause)
        .groupBy(events.id)
        .orderBy(desc(events.startingAt))
        .limit(pageSize)
        .offset(skip),
      db.select({ count: count() }).from(events).where(whereClause),
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        events: eventsResult,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// New action to fetch contest data
export async function fetchContestData(contestLink: string) {
  try {
    // Check permissions
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const parsedUrl = new URL(contestLink);
    const hostname = parsedUrl.hostname;

    // Determine the platform and fetch data accordingly
    if (hostname === "codeforces.com") {
      return await fetchCodeforcesContest(contestLink);
    } else if (hostname === "atcoder.jp") {
      return await fetchAtcoderContest(contestLink);
    } else if (hostname === "vjudge.net") {
      return await fetchVjudgeContest(contestLink);
    } else {
      return {
        success: false,
        error:
          "Unsupported platform. Currently supporting Codeforces, AtCoder, and VJudge.",
      };
    }
  } catch (error) {
    console.error("Error fetching contest data:", error);
    return {
      success: false,
      error: "An error occurred while fetching contest data.",
    };
  }
}

// Helper function to fetch Codeforces contest data
async function fetchCodeforcesContest(contestLink: string) {
  try {
    // Extract contest ID from URL
    const urlPathParts = new URL(contestLink).pathname.split("/");
    const contestId = urlPathParts[2];

    if (!contestId || isNaN(Number(contestId))) {
      return { success: false, error: "Invalid Codeforces contest URL" };
    }

    // Fetch contest data from Codeforces API
    const response = await fetch(`https://codeforces.com/api/contest.list`);
    const data = await response.json();

    if (data.status !== "OK") {
      return {
        success: false,
        error: "Failed to fetch contest data from Codeforces",
      };
    }

    // Define a type for the contest object
    interface CodeForcesContest {
      id: number;
      name: string;
      startTimeSeconds: number;
      durationSeconds: number;
    }

    const contest = data.result.find(
      (c: CodeForcesContest) => c.id.toString() === contestId
    );

    if (!contest) {
      return { success: false, error: "Contest not found" };
    }

    // Calculate start and end times
    const startTime = new Date(contest.startTimeSeconds * 1000);
    const endTime = new Date(
      (contest.startTimeSeconds + contest.durationSeconds) * 1000
    );

    // Format data according to our event schema
    return {
      success: true,
      data: {
        title: contest.name,
        startingAt: startTime,
        endingAt: endTime,
        eventLink: contestLink,
        type: EventType.CONTEST,
        status: VisibilityStatus.PUBLISHED,
        participationScope: ParticipationScope.OPEN_FOR_ALL,
        openForAttendance: false,
      },
    };
  } catch (error) {
    console.error("Error fetching Codeforces contest:", error);
    return { success: false, error: "Failed to fetch Codeforces contest data" };
  }
}

// Helper function to fetch AtCoder contest data
async function fetchAtcoderContest(contestLink: string) {
  try {
    // Fetch the HTML content of the contest page
    const response = await fetch(contestLink, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return { success: false, error: "Failed to fetch AtCoder contest page" };
    }

    const html = await response.text();

    // Extract contest title
    const titleMatch = html.match(/<title>(.*?) - AtCoder<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    if (!title) {
      return { success: false, error: "Could not find contest title" };
    }

    // Extract start and end times
    const startTimeMatch = html.match(/var startTime = moment\("([^"]+)"\);/);
    const endTimeMatch = html.match(/var endTime = moment\("([^"]+)"\);/);

    if (!startTimeMatch || !endTimeMatch) {
      return { success: false, error: "Could not find contest times" };
    }

    const startTime = new Date(startTimeMatch[1]);
    const endTime = new Date(endTimeMatch[1]);

    // Format data according to our event schema
    return {
      success: true,
      data: {
        title,
        startingAt: startTime,
        endingAt: endTime,
        eventLink: contestLink,
        type: EventType.CONTEST,
        status: VisibilityStatus.PUBLISHED,
        participationScope: ParticipationScope.OPEN_FOR_ALL,
        openForAttendance: true,
      },
    };
  } catch (error) {
    console.error("Error fetching AtCoder contest:", error);
    return { success: false, error: "Failed to fetch AtCoder contest data" };
  }
}

// Helper function to fetch VJudge contest data
async function fetchVjudgeContest(contestLink: string) {
  try {
    // Fetch the HTML content of the contest page
    const response = await fetch(contestLink, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return { success: false, error: "Failed to fetch VJudge contest page" };
    }

    const html = await response.text();

    // Try to extract JSON data from the textarea with name="dataJson"
    // Using a regex pattern that works without the 's' flag
    const pattern = /<textarea[^>]*name="dataJson"[^>]*>([\s\S]*?)<\/textarea>/;
    const match = html.match(pattern);

    if (!match || !match[1]) {
      return { success: false, error: "Could not find contest data" };
    }

    try {
      const jsonText = match[1];
      const contestData = JSON.parse(jsonText);

      // Extract relevant contest information
      const title = contestData.title
        ? decodeHTMLEntities(contestData.title)
        : "Unknown Contest";
      const startTime = new Date(contestData.begin);
      const endTime = new Date(contestData.end);

      // Format data according to our event schema
      return {
        success: true,
        data: {
          title,
          startingAt: startTime,
          endingAt: endTime,
          eventLink: contestLink,
          type: EventType.CONTEST,
          status: VisibilityStatus.PUBLISHED,
          participationScope: ParticipationScope.OPEN_FOR_ALL,
          openForAttendance: true,
        },
      };
    } catch (parseError) {
      console.error("Error parsing VJudge contest data:", parseError);
      return { success: false, error: "Failed to parse VJudge contest data" };
    }
  } catch (error) {
    console.error("Error fetching VJudge contest:", error);
    return { success: false, error: "Failed to fetch VJudge contest data" };
  }
}

// Helper function to decode HTML entities (like &amp; to &)
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}
