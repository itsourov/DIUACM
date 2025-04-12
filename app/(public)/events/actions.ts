"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { EventType, AttendanceScope, Prisma, Visibility } from "@prisma/client";

// Define types based on Prisma schema
export type Event = {
  id: number;
  title: string;
  startingAt: Date;
  endingAt: Date;
  eventLink?: string | null;
  openForAttendance: boolean;
  strictAttendance: boolean;
  type: EventType;
  participationScope: AttendanceScope;
  _count?: {
    attendances?: number;
  };
};

// Define pagination structure
export type PaginatedEvents = {
  events: Event[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
};

// Define filters schema for type safety
const eventFiltersSchema = z.object({
  categoryId: z.string().optional(),
  scope: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  title: z.string().optional(),
});

// Function to get events with pagination and filtering
export async function getEvents(
  filters: z.infer<typeof eventFiltersSchema>
): Promise<PaginatedEvents> {
  // Validate filters
  const validatedFilters = eventFiltersSchema.parse(filters);

  // Build where conditions for Prisma query
  const where: Prisma.EventWhereInput = {};
  where.status = Visibility.PUBLISHED; // Only fetch active events
  // Filter by event type (category)
  if (validatedFilters.categoryId) {
    where.type = validatedFilters.categoryId as EventType;
  }

  // Filter by participation scope
  if (validatedFilters.scope) {
    where.participationScope = validatedFilters.scope as AttendanceScope;
  }

  // Filter by title (case-insensitive search)
  if (validatedFilters.title) {
    where.title = {
      contains: validatedFilters.title,
      mode: "insensitive",
    };
  }

  // Count total events matching filters
  const total = await prisma.event.count({ where });

  // Calculate pagination
  const limit = validatedFilters.limit;
  const pages = Math.ceil(total / limit);
  const page = Math.min(validatedFilters.page, pages) || 1;
  const skip = (page - 1) * limit;

  // Fetch events with pagination
  const events = await prisma.event.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      startingAt: "desc", // Order by start date ascending
    },
    include: {
      _count: {
        select: {
          attendances: true,
        },
      },
    },
  });

  return {
    events,
    pagination: {
      page,
      pages,
      total,
      limit,
    },
  };
}
