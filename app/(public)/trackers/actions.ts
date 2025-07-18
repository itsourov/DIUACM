"use server";

import { db } from "@/db/drizzle";
import {
  trackers,
  rankLists,
  VisibilityStatus,
  type Tracker,
} from "@/db/schema";
import { eq, and, sql, asc, desc } from "drizzle-orm";

// Define tracker type with rank lists count
export type PublicTracker = Tracker & {
  _count: {
    rankLists: number;
  };
};

// Function to get all public trackers without pagination
export async function getPublicTrackers(): Promise<PublicTracker[]> {
  try {
    // Get all published trackers
    const trackerData = await db
      .select({
        id: trackers.id,
        title: trackers.title,
        slug: trackers.slug,
        description: trackers.description,
        status: trackers.status,
        order: trackers.order,
        createdAt: trackers.createdAt,
        updatedAt: trackers.updatedAt,
      })
      .from(trackers)
      .where(eq(trackers.status, VisibilityStatus.PUBLISHED))
      .orderBy(asc(trackers.order), desc(trackers.createdAt));

    // Get rank lists count for each tracker
    const result: PublicTracker[] = await Promise.all(
      trackerData.map(async (tracker) => {
        const [countResult] = await db
          .select({
            count: sql<number>`count(*)`,
          })
          .from(rankLists)
          .where(
            and(
              eq(rankLists.trackerId, tracker.id),
              eq(rankLists.isActive, true)
            )
          );

        return {
          ...tracker,
          _count: {
            rankLists: countResult?.count || 0,
          },
        };
      })
    );

    return result;
  } catch (error) {
    console.error("Error fetching public trackers:", error);
    throw new Error("Failed to fetch trackers");
  }
}
