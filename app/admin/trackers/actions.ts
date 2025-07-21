"use server";

import { db } from "@/db/drizzle";
import { trackers, rankLists } from "@/db/schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, or, like, count, desc, and, asc, sql } from "drizzle-orm";
import { trackerFormSchema, type TrackerFormValues } from "./schemas/tracker";
import { hasPermission } from "@/lib/authorization";

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Utility function to handle database errors
function handleDbError(error: unknown): ActionResult {
  console.error("Database error:", error);

  if (error instanceof Error) {
    if (error.message.includes("Duplicate entry")) {
      return {
        success: false,
        error: "A tracker with this title or slug already exists",
      };
    }
  }

  return { success: false, error: "Something went wrong. Please try again." };
}

// Utility function to validate permissions
async function validatePermission(): Promise<ActionResult | null> {
  if (!(await hasPermission("TRACKERS:MANAGE"))) {
    return {
      success: false,
      error: "You don't have permission to manage trackers",
    };
  }
  return null;
}

export async function createTracker(
  values: TrackerFormValues
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const validatedFields = trackerFormSchema.parse(values);

    // Check if tracker title already exists
    const existingByTitle = await db
      .select({ id: trackers.id })
      .from(trackers)
      .where(eq(trackers.title, validatedFields.title))
      .limit(1);

    if (existingByTitle.length > 0) {
      return {
        success: false,
        error: "A tracker with this title already exists",
      };
    }

    // Check if tracker slug already exists
    const existingBySlug = await db
      .select({ id: trackers.id })
      .from(trackers)
      .where(eq(trackers.slug, validatedFields.slug))
      .limit(1);

    if (existingBySlug.length > 0) {
      return {
        success: false,
        error: "A tracker with this slug already exists",
      };
    }

    const result = await db
      .insert(trackers)
      .values({
        title: validatedFields.title,
        slug: validatedFields.slug,
        description: validatedFields.description || null,
        status: validatedFields.status,
        order: validatedFields.order,
      })
      .returning({ id: trackers.id });

    revalidatePath("/admin/trackers");
    revalidatePath("/trackers");

    return {
      success: true,
      data: { ...validatedFields, id: result[0].id },
      message: "Tracker created successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Please check the form for errors.",
      };
    }

    return handleDbError(error);
  }
}

export async function updateTracker(
  id: number,
  values: TrackerFormValues
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const validatedFields = trackerFormSchema.parse(values);

    // Check if tracker exists
    const existingTracker = await db
      .select({ id: trackers.id })
      .from(trackers)
      .where(eq(trackers.id, id))
      .limit(1);

    if (existingTracker.length === 0) {
      return { success: false, error: "Tracker not found" };
    }

    // Check if another tracker with same title exists (excluding current tracker)
    const duplicateTitle = await db
      .select({ id: trackers.id })
      .from(trackers)
      .where(
        and(
          eq(trackers.title, validatedFields.title),
          sql`${trackers.id} != ${id}`
        )
      )
      .limit(1);

    if (duplicateTitle.length > 0) {
      return {
        success: false,
        error: "A tracker with this title already exists",
      };
    }

    // Check if another tracker with same slug exists (excluding current tracker)
    const duplicateSlug = await db
      .select({ id: trackers.id })
      .from(trackers)
      .where(
        and(
          eq(trackers.slug, validatedFields.slug),
          sql`${trackers.id} != ${id}`
        )
      )
      .limit(1);

    if (duplicateSlug.length > 0) {
      return {
        success: false,
        error: "A tracker with this slug already exists",
      };
    }

    await db
      .update(trackers)
      .set({
        title: validatedFields.title,
        slug: validatedFields.slug,
        description: validatedFields.description || null,
        status: validatedFields.status,
        order: validatedFields.order,
      })
      .where(eq(trackers.id, id));

    revalidatePath("/admin/trackers");
    revalidatePath(`/admin/trackers/${id}/edit`);
    revalidatePath("/trackers");
    revalidatePath(`/trackers/${validatedFields.slug}`);

    return {
      success: true,
      data: { ...validatedFields, id },
      message: "Tracker updated successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Please check the form for errors.",
      };
    }

    return handleDbError(error);
  }
}

export async function deleteTracker(id: number): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    // Check if tracker exists and get ranklist count
    const trackerData = await db
      .select({
        id: trackers.id,
        title: trackers.title,
        slug: trackers.slug,
        rankListCount: count(rankLists.id),
      })
      .from(trackers)
      .leftJoin(rankLists, eq(rankLists.trackerId, trackers.id))
      .where(eq(trackers.id, id))
      .groupBy(trackers.id)
      .limit(1);

    if (trackerData.length === 0) {
      return { success: false, error: "Tracker not found" };
    }

    const tracker = trackerData[0];

    if (tracker.rankListCount > 0) {
      return {
        success: false,
        error: `Cannot delete tracker "${tracker.title}" because it has ${tracker.rankListCount} ranklist(s). Please delete the ranklists first.`,
      };
    }

    await db.delete(trackers).where(eq(trackers.id, id));

    revalidatePath("/admin/trackers");
    revalidatePath("/trackers");
    revalidatePath(`/trackers/${tracker.slug}`, "page");

    return {
      success: true,
      message: `Tracker "${tracker.title}" deleted successfully`,
    };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getTracker(id: number): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const [tracker] = await db
      .select()
      .from(trackers)
      .where(eq(trackers.id, id))
      .limit(1);

    if (!tracker) {
      return { success: false, error: "Tracker not found" };
    }

    return { success: true, data: tracker };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getPaginatedTrackers(
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const offset = (page - 1) * pageSize;

    // Build search condition
    const searchCondition = search
      ? or(
          like(trackers.title, `%${search}%`),
          like(trackers.slug, `%${search}%`),
          like(trackers.description, `%${search}%`)
        )
      : undefined;

    // Get trackers with ranklist counts
    const trackersQuery = db
      .select({
        id: trackers.id,
        title: trackers.title,
        slug: trackers.slug,
        description: trackers.description,
        status: trackers.status,
        order: trackers.order,
        createdAt: trackers.createdAt,
        updatedAt: trackers.updatedAt,
        rankListCount: count(rankLists.id),
      })
      .from(trackers)
      .leftJoin(rankLists, eq(rankLists.trackerId, trackers.id))
      .groupBy(trackers.id);

    if (searchCondition) {
      trackersQuery.where(searchCondition);
    }

    const trackersList = await trackersQuery
      .orderBy(asc(trackers.order), desc(trackers.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const totalCountQuery = db.select({ count: count() }).from(trackers);

    if (searchCondition) {
      totalCountQuery.where(searchCondition);
    }

    const [{ count: totalCount }] = await totalCountQuery;

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        trackers: trackersList.map((tracker) => ({
          ...tracker,
          _count: {
            rankLists: tracker.rankListCount,
          },
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        },
      },
    };
  } catch (error) {
    return handleDbError(error);
  }
}
