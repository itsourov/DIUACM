"use server";

import { db } from "@/db/drizzle";
import {
  events,
  eventUserAttendance,
  eventRankList,
  type Event,
} from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, or, like, count, desc } from "drizzle-orm";
import { eventFormSchema, type EventFormValues } from "./schemas/event";
import { hasPermission } from "@/lib/authorization";

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Utility function to handle database errors
function handleDbError<T = unknown>(error: unknown): ActionResult<T> {
  console.error("Database error:", error);

  if (error instanceof Error) {
    // Handle specific database constraint errors
    if (error.message.includes("Duplicate entry")) {
      return {
        success: false,
        error: "An event with this title already exists",
      };
    }
    if (error.message.includes("foreign key constraint")) {
      return { success: false, error: "Invalid reference" };
    }
  }

  return { success: false, error: "Database operation failed" };
}

// Create a new event
export async function createEvent(
  values: EventFormValues
): Promise<ActionResult<Event>> {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate the input
    const validatedFields = eventFormSchema.safeParse(values);
    if (!validatedFields.success) {
      return { success: false, error: "Invalid fields" };
    }

    const { data } = validatedFields;

    // Convert startingAt string to Date
    const startingAt = new Date(data.startingAt);

    const [result] = await db.insert(events).values({
      title: data.title,
      description: data.description || null,
      status: data.status,
      startingAt: startingAt,
      endingAt: data.endingAt,
      eventLink: data.eventLink || null,
      eventPassword: data.eventPassword || null,
      openForAttendance: data.openForAttendance,
      strictAttendance: data.strictAttendance,
      type: data.type,
      participationScope: data.participationScope,
    });

    revalidatePath("/admin/events");
    return {
      success: true,
      message: "Event created successfully",
      data: { id: result.insertId as number, ...data, startingAt } as Event,
    };
  } catch (error) {
    return handleDbError<Event>(error);
  }
}

// Update an existing event
export async function updateEvent(
  id: number,
  values: EventFormValues
): Promise<ActionResult<Event>> {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate the input
    const validatedFields = eventFormSchema.safeParse(values);
    if (!validatedFields.success) {
      return { success: false, error: "Invalid fields" };
    }

    const { data } = validatedFields;

    // Convert startingAt string to Date
    const startingAt = new Date(data.startingAt);

    await db
      .update(events)
      .set({
        title: data.title,
        description: data.description || null,
        status: data.status,
        startingAt: startingAt,
        endingAt: data.endingAt,
        eventLink: data.eventLink || null,
        eventPassword: data.eventPassword || null,
        openForAttendance: data.openForAttendance,
        strictAttendance: data.strictAttendance,
        type: data.type,
        participationScope: data.participationScope,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id));

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}/edit`);
    return {
      success: true,
      message: "Event updated successfully",
      data: { id, ...data, startingAt } as Event,
    };
  } catch (error) {
    return handleDbError<Event>(error);
  }
}

// Delete an event
export async function deleteEvent(id: number): Promise<ActionResult> {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(events).where(eq(events.id, id));

    revalidatePath("/admin/events");
    return { success: true, message: "Event deleted successfully" };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get a single event by ID
export async function getEvent(id: number): Promise<ActionResult<Event>> {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const [event] = await db.select().from(events).where(eq(events.id, id));

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event as Event };
  } catch (error) {
    return handleDbError<Event>(error);
  }
}

// Get paginated events with optional search
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

    const offset = (page - 1) * pageSize;

    // Build the where condition
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(events.title, `%${search}%`),
          like(events.description, `%${search}%`)
        )
      );
    }

    if (type && (type === "contest" || type === "class" || type === "other")) {
      whereConditions.push(
        eq(events.type, type as "contest" | "class" | "other")
      );
    }

    const whereCondition =
      whereConditions.length > 0
        ? whereConditions.length === 1
          ? whereConditions[0]
          : or(...whereConditions)
        : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(events)
      .where(whereCondition);

    const totalCount = totalResult.count;

    // Get events with attendance count
    const eventsList = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        status: events.status,
        type: events.type,
        startingAt: events.startingAt,
        endingAt: events.endingAt,
        eventLink: events.eventLink,
        eventPassword: events.eventPassword,
        participationScope: events.participationScope,
        openForAttendance: events.openForAttendance,
        strictAttendance: events.strictAttendance,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        _count: {
          attendances: count(eventUserAttendance.eventId),
        },
      })
      .from(events)
      .leftJoin(eventUserAttendance, eq(events.id, eventUserAttendance.eventId))
      .where(whereCondition)
      .groupBy(events.id)
      .orderBy(desc(events.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      success: true,
      data: {
        events: eventsList,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          pageSize,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

// Get event attendees count
export async function getEventAttendeesCount(
  eventId: number
): Promise<ActionResult<number>> {
  try {
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const [result] = await db
      .select({ count: count() })
      .from(eventUserAttendance)
      .where(eq(eventUserAttendance.eventId, eventId));

    return { success: true, data: result.count };
  } catch {
    return { success: false, error: "Failed to get attendees count" };
  }
}

// Get event ranklists count
export async function getEventRanklistsCount(
  eventId: number
): Promise<ActionResult<number>> {
  try {
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const [result] = await db
      .select({ count: count() })
      .from(eventRankList)
      .where(eq(eventRankList.eventId, eventId));

    return { success: true, data: result.count };
  } catch {
    return { success: false, error: "Failed to get ranklists count" };
  }
}
