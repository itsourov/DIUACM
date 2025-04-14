"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { eventFormSchema, type EventFormValues } from "./schemas/event";
import { hasPermission } from "@/lib/authorization";

// Create a new event
export async function createEvent(values: EventFormValues) {
  try {
    // Check if the user has permission to manage events
    if (!(await hasPermission("EVENTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const validatedFields = eventFormSchema.parse(values);

    const event = await prisma.event.create({
      data: validatedFields,
    });

    revalidatePath("/admin/events");
    return { success: true, data: event };
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
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return {
        success: false,
        error: "Event not found.",
      };
    }

    const event = await prisma.event.update({
      where: { id },
      data: validatedFields,
    });

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}/edit`);
    revalidatePath(`/events/${id}`);
    return { success: true, data: event };
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
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return {
        success: false,
        error: "Event not found.",
      };
    }

    await prisma.event.delete({
      where: { id },
    });

    revalidatePath("/admin/events");
    return { success: true };
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
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event };
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
    const where: Prisma.EventWhereInput = {};

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          description: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
      ];
    }

    // Add type filter if provided
    if (type && type !== "ALL") {
      where.type = type as Prisma.EnumEventTypeFilter;
    }

    // Execute the queries
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startingAt: "desc" },
        include: {
          _count: {
            select: {
              attendances: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        events,
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
