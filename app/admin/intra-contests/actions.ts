"use server";

import { db } from "@/db/drizzle";
import { intraContests } from "@/db/schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, ilike, or, and, desc, count, sql } from "drizzle-orm";
import {
  intraContestFormSchema,
  type IntraContestFormValues,
} from "./schemas/intra-contest";
import type { IntraContest } from "@/db/schema";
import { hasPermission } from "@/lib/authorization";

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type IntraContestListItem = IntraContest;

function handleDbError(error: unknown): ActionResult {
  console.error("Database error:", error);
  return { success: false, error: "Something went wrong. Please try again." };
}

async function validatePermission(): Promise<ActionResult | null> {
  if (!(await hasPermission("INTRA_CONTESTS:MANAGE"))) {
    return {
      success: false,
      error: "You don't have permission to manage intra contests",
    };
  }
  return null;
}

export async function createIntraContest(
  values: IntraContestFormValues
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const validated = intraContestFormSchema.parse(values);

    // Ensure slug is unique
    const existing = await db
      .select({ id: intraContests.id })
      .from(intraContests)
      .where(
        or(
          eq(intraContests.slug, validated.slug),
          eq(intraContests.name, validated.name)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "An intra contest with this name or slug already exists",
      };
    }

    const dbValues = {
      name: validated.name,
      slug: validated.slug,
      description: validated.description || null,
      registrationFee: validated.registrationFee,
      registrationStartTime: new Date(validated.registrationStartTime),
      registrationEndTime: new Date(validated.registrationEndTime),
      mainEventDateTime: new Date(validated.mainEventDateTime),
      status: validated.status,
      registrationLimit: validated.registrationLimit ?? null,
    };

    const result = await db
      .insert(intraContests)
      .values(dbValues)
      .returning({ id: intraContests.id });

    revalidatePath("/admin/intra-contests");

    return {
      success: true,
      data: { ...dbValues, id: result[0].id },
      message: "Intra contest created successfully",
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

export async function updateIntraContest(
  id: number,
  values: IntraContestFormValues
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const validated = intraContestFormSchema.parse(values);

    const existing = await db
      .select({ id: intraContests.id })
      .from(intraContests)
      .where(eq(intraContests.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Intra contest not found" };
    }

    // Check duplicate slug or name excluding current
    const duplicate = await db
      .select({ id: intraContests.id })
      .from(intraContests)
      .where(
        and(
          sql`${intraContests.id} != ${id}`,
          or(
            eq(intraContests.slug, validated.slug),
            eq(intraContests.name, validated.name)
          )
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      return {
        success: false,
        error: "Another intra contest with this name or slug exists",
      };
    }

    const dbValues = {
      name: validated.name,
      slug: validated.slug,
      description: validated.description || null,
      registrationFee: validated.registrationFee,
      registrationStartTime: new Date(validated.registrationStartTime),
      registrationEndTime: new Date(validated.registrationEndTime),
      mainEventDateTime: new Date(validated.mainEventDateTime),
      status: validated.status,
      registrationLimit: validated.registrationLimit ?? null,
    };

    await db
      .update(intraContests)
      .set(dbValues)
      .where(eq(intraContests.id, id));

    revalidatePath("/admin/intra-contests");
    revalidatePath(`/admin/intra-contests/${id}/edit`);

    return {
      success: true,
      data: { ...dbValues, id },
      message: "Intra contest updated successfully",
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

export async function deleteIntraContest(id: number): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const existing = await db
      .select({ id: intraContests.id, name: intraContests.name })
      .from(intraContests)
      .where(eq(intraContests.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Intra contest not found" };
    }

    await db.delete(intraContests).where(eq(intraContests.id, id));

    revalidatePath("/admin/intra-contests");

    return {
      success: true,
      message: `Intra contest "${existing[0].name}" deleted successfully`,
    };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getIntraContest(
  id: number
): Promise<ActionResult<IntraContest>> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError as ActionResult<IntraContest>;

    const rows = await db
      .select()
      .from(intraContests)
      .where(eq(intraContests.id, id))
      .limit(1);

    if (!rows || rows.length === 0) {
      return { success: false, error: "Intra contest not found" };
    }

    return { success: true, data: rows[0] };
  } catch (error) {
    return handleDbError(error) as ActionResult<IntraContest>;
  }
}

export async function getPaginatedIntraContests(
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<
  ActionResult<{
    items: IntraContestListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      pageSize: number;
    };
  }>
> {
  try {
    const permissionError = await validatePermission();
    if (permissionError)
      return permissionError as ActionResult<{
        items: IntraContestListItem[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalCount: number;
          pageSize: number;
        };
      }>;

    const skip = (page - 1) * pageSize;
    const searchCondition = search
      ? or(
          ilike(intraContests.name, `%${search}%`),
          ilike(intraContests.slug, `%${search}%`)
        )
      : undefined;

    const [rows, totalCount] = await Promise.all([
      db
        .select()
        .from(intraContests)
        .where(searchCondition)
        .orderBy(desc(intraContests.createdAt))
        .limit(pageSize)
        .offset(skip),
      db
        .select({ count: count() })
        .from(intraContests)
        .where(searchCondition)
        .then((r) => r[0].count),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        items: rows,
        pagination: { currentPage: page, totalPages, totalCount, pageSize },
      },
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<{
      items: IntraContestListItem[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
      };
    }>;
  }
}
