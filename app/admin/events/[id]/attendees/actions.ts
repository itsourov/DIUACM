"use server";
import { hasPermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getEventAttendees(eventId: number) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const attendees = await prisma.eventAttendance.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
            studentId: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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

    // Find users that aren't already attendees of this event
    // and match the search query
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                email: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                username: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                studentId: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          },
          {
            eventAttendances: {
              none: { eventId },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        studentId: true,
        department: true,
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function addEventAttendee(eventId: number, userId: string) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    const attendee = await prisma.eventAttendance.create({
      data: {
        eventId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
            studentId: true,
            department: true,
          },
        },
      },
    });

    revalidatePath(`/admin/events/${eventId}/attendees`);

    return {
      success: true,
      data: attendee,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function removeEventAttendee(attendeeId: string, eventId: number) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    await prisma.eventAttendance.delete({
      where: { id: attendeeId },
    });

    revalidatePath(`/admin/events/${eventId}/attendees`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
