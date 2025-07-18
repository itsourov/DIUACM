"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  events,
  eventUserAttendance,
  EventType,
  ParticipationScope,
  VisibilityStatus,
} from "@/db/schema";
import { eq, and, like, count, desc } from "drizzle-orm";

// Define types based on Drizzle schema
export type Event = {
  id: number;
  title: string;
  startingAt: Date;
  endingAt: Date;
  eventLink?: string | null;
  openForAttendance: boolean;
  type: EventType;
  participationScope: ParticipationScope;
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

  // Build where conditions for Drizzle query
  const whereConditions = [];

  // Only fetch published events
  whereConditions.push(eq(events.status, VisibilityStatus.PUBLISHED));

  // Filter by event type (category)
  if (validatedFilters.categoryId) {
    whereConditions.push(
      eq(events.type, validatedFilters.categoryId as EventType)
    );
  }

  // Filter by participation scope
  if (validatedFilters.scope) {
    whereConditions.push(
      eq(
        events.participationScope,
        validatedFilters.scope as ParticipationScope
      )
    );
  }

  // Filter by title (case-insensitive search)
  if (validatedFilters.title) {
    whereConditions.push(like(events.title, `%${validatedFilters.title}%`));
  }

  // Combine all conditions with AND
  const whereClause =
    whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

  // Count total events matching filters
  const totalResult = await db
    .select({ count: count() })
    .from(events)
    .where(whereClause);
  const total = totalResult[0]?.count || 0;

  // Calculate pagination
  const limit = validatedFilters.limit;
  const pages = Math.ceil(total / limit);
  const page = Math.min(validatedFilters.page, pages) || 1;
  const offset = (page - 1) * limit;

  // Fetch events with pagination and attendance count
  const eventsWithAttendance = await db
    .select({
      id: events.id,
      title: events.title,
      startingAt: events.startingAt,
      endingAt: events.endingAt,
      eventLink: events.eventLink,
      openForAttendance: events.openForAttendance,
      type: events.type,
      participationScope: events.participationScope,
      attendanceCount: count(eventUserAttendance.userId),
    })
    .from(events)
    .leftJoin(eventUserAttendance, eq(events.id, eventUserAttendance.eventId))
    .where(whereClause)
    .groupBy(events.id)
    .orderBy(desc(events.startingAt))
    .limit(limit)
    .offset(offset);

  // Format the events to match the expected type
  const formattedEvents: Event[] = eventsWithAttendance.map((event) => ({
    id: event.id,
    title: event.title,
    startingAt: event.startingAt,
    endingAt: event.endingAt,
    eventLink: event.eventLink,
    openForAttendance: event.openForAttendance,
    type: event.type,
    participationScope: event.participationScope,
    _count: {
      attendances: event.attendanceCount,
    },
  }));

  return {
    events: formattedEvents,
    pagination: {
      page,
      pages,
      total,
      limit,
    },
  };
}
