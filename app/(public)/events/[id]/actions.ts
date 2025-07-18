"use server";

import { db } from "@/db/drizzle";
import {
  events,
  eventUserAttendance,
  userSolveStatOnEvents,
  users,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getEventDetails(id: number) {
  try {
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event || event.length === 0) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event[0] };
  } catch (error) {
    console.error("Error fetching event details:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getEventSolveStats(eventId: number) {
  try {
    const solveStats = await db
      .select({
        id: userSolveStatOnEvents.id,
        userId: userSolveStatOnEvents.userId,
        eventId: userSolveStatOnEvents.eventId,
        solveCount: userSolveStatOnEvents.solveCount,
        upsolveCount: userSolveStatOnEvents.upsolveCount,
        participation: userSolveStatOnEvents.participation,
        createdAt: userSolveStatOnEvents.createdAt,
        updatedAt: userSolveStatOnEvents.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
          department: users.department,
          studentId: users.studentId,
        },
      })
      .from(userSolveStatOnEvents)
      .innerJoin(users, eq(userSolveStatOnEvents.userId, users.id))
      .where(eq(userSolveStatOnEvents.eventId, eventId))
      .orderBy(
        desc(userSolveStatOnEvents.solveCount),
        desc(userSolveStatOnEvents.upsolveCount)
      );

    return { success: true, data: solveStats };
  } catch (error) {
    console.error("Error fetching solve stats:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getEventAttendanceList(eventId: number) {
  try {
    const attendance = await db
      .select({
        eventId: eventUserAttendance.eventId,
        userId: eventUserAttendance.userId,
        createdAt: eventUserAttendance.createdAt,
        updatedAt: eventUserAttendance.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
          department: users.department,
          studentId: users.studentId,
        },
      })
      .from(eventUserAttendance)
      .innerJoin(users, eq(eventUserAttendance.userId, users.id))
      .where(eq(eventUserAttendance.eventId, eventId))
      .orderBy(desc(eventUserAttendance.createdAt));

    return { success: true, data: attendance };
  } catch (error) {
    console.error("Error fetching attendance list:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function checkIfUserHasAttendance(eventId: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const attendance = await db
      .select()
      .from(eventUserAttendance)
      .where(
        and(
          eq(eventUserAttendance.eventId, eventId),
          eq(eventUserAttendance.userId, session.user.id)
        )
      )
      .limit(1);

    return {
      success: true,
      hasAttendance: attendance.length > 0,
    };
  } catch (error) {
    console.error("Error checking attendance:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function submitAttendance(eventId: number, password: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to give attendance",
      };
    }

    // Verify the event exists and is open for attendance
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event || event.length === 0) {
      return { success: false, error: "Event not found" };
    }

    const eventData = event[0];

    if (!eventData.openForAttendance) {
      return { success: false, error: "This event is not open for attendance" };
    }

    // Check if the event requires a password
    if (eventData.eventPassword && eventData.eventPassword !== password) {
      return { success: false, error: "Incorrect event password" };
    }

    // Check if the event is within the attendance window (15 min before start to 15 min after end)
    const now = new Date();
    const startWindowTime = new Date(eventData.startingAt);
    startWindowTime.setMinutes(startWindowTime.getMinutes() - 15);

    const endWindowTime = new Date(eventData.endingAt);
    endWindowTime.setMinutes(endWindowTime.getMinutes() + 15);

    if (now < startWindowTime || now > endWindowTime) {
      return {
        success: false,
        error:
          "Attendance is only allowed from 15 minutes before the event starts to 15 minutes after the event ends",
      };
    }

    // Check if the user already has attendance for this event
    const existingAttendance = await db
      .select()
      .from(eventUserAttendance)
      .where(
        and(
          eq(eventUserAttendance.eventId, eventId),
          eq(eventUserAttendance.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingAttendance.length > 0) {
      return {
        success: false,
        error: "You've already given attendance for this event",
      };
    }

    // Create the attendance record
    await db.insert(eventUserAttendance).values({
      eventId,
      userId: session.user.id,
    });

    revalidatePath(`/events/${eventId}`);

    return { success: true, message: "Attendance recorded successfully" };
  } catch (error) {
    console.error("Error submitting attendance:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
