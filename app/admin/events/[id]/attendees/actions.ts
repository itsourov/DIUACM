"use server";
import { hasPermission } from "@/lib/authorization";
import { db } from "@/db/drizzle";
import { eventUserAttendance, users, events } from "@/db/schema";
import { eq, and, like, or, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEventAttendees(eventId: number) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const attendees = await db
      .select({
        eventId: eventUserAttendance.eventId,
        userId: eventUserAttendance.userId,
        createdAt: eventUserAttendance.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username,
          image: users.image,
          studentId: users.studentId,
          department: users.department,
        },
      })
      .from(eventUserAttendance)
      .innerJoin(users, eq(eventUserAttendance.userId, users.id))
      .where(eq(eventUserAttendance.eventId, eventId))
      .orderBy(users.name);

    return {
      success: true,
      data: attendees,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function searchUsersForEvent(
  eventId: number,
  search: string,
  limit: number = 10
) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Get users who are already attendees of this event
    const existingAttendees = await db
      .select({ userId: eventUserAttendance.userId })
      .from(eventUserAttendance)
      .where(eq(eventUserAttendance.eventId, eventId));

    const existingUserIds = existingAttendees.map((a) => a.userId);

    // Build search conditions
    const searchConditions = [
      like(users.name, `%${search}%`),
      like(users.email, `%${search}%`),
      like(users.studentId, `%${search}%`),
    ];

    if (users.username) {
      searchConditions.push(like(users.username, `%${search}%`));
    }

    // Search for users excluding existing attendees
    const query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        image: users.image,
        studentId: users.studentId,
        department: users.department,
      })
      .from(users)
      .where(
        and(
          or(...searchConditions),
          existingUserIds.length > 0
            ? notInArray(users.id, existingUserIds)
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
      error: "Something went wrong while searching users.",
    };
  }
}

export async function addEventAttendee(eventId: number, userId: string) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is already an attendee
    const existingAttendance = await db
      .select()
      .from(eventUserAttendance)
      .where(
        and(
          eq(eventUserAttendance.eventId, eventId),
          eq(eventUserAttendance.userId, userId)
        )
      );

    if (existingAttendance.length > 0) {
      return {
        success: false,
        error: "User is already an attendee of this event",
      };
    }

    // Add the user as an attendee
    await db.insert(eventUserAttendance).values({
      eventId,
      userId,
    });

    // Get the user details and attendance record for the response
    const attendanceWithUser = await db
      .select({
        eventId: eventUserAttendance.eventId,
        userId: eventUserAttendance.userId,
        createdAt: eventUserAttendance.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username,
          image: users.image,
          studentId: users.studentId,
          department: users.department,
        },
      })
      .from(eventUserAttendance)
      .innerJoin(users, eq(eventUserAttendance.userId, users.id))
      .where(
        and(
          eq(eventUserAttendance.eventId, eventId),
          eq(eventUserAttendance.userId, userId)
        )
      )
      .limit(1);

    revalidatePath(`/admin/events/${eventId}/attendees`);

    return {
      success: true,
      data: attendanceWithUser[0],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong while adding the attendee.",
    };
  }
}

export async function removeEventAttendee(eventId: number, userId: string) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .delete(eventUserAttendance)
      .where(
        and(
          eq(eventUserAttendance.eventId, eventId),
          eq(eventUserAttendance.userId, userId)
        )
      );

    revalidatePath(`/admin/events/${eventId}/attendees`);

    return {
      success: true,
      message: "Attendee removed successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong while removing the attendee.",
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
