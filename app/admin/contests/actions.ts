"use server";

import { db } from "@/db/drizzle";
import { contests, galleries, teams, teamUser } from "@/db/schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, or, ilike, count, desc, and, asc, sql } from "drizzle-orm";
import { contestFormSchema, type ContestFormValues } from "./schemas/contest";
import type { Contest, Gallery } from "@/db/schema";
import { hasPermission } from "@/lib/authorization";

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Contest data interface for API responses
type ContestData = Contest & {
  gallery?: Pick<Gallery, "id" | "title" | "slug" | "status"> | null;
};

// Type exports for use in components
export type ContestWithGallery = ContestData;
export type ContestListItem = Contest & {
  gallery: Pick<Gallery, "id" | "title" | "slug" | "status"> | null;
  _count: {
    teams: number;
  };
};

// Utility function to handle database errors
function handleDbError(error: unknown): ActionResult {
  console.error("Database error:", error);

  if (error instanceof Error) {
    // Handle specific database constraint errors
    if (error.message.includes("Duplicate entry")) {
      return {
        success: false,
        error: "A contest with this name already exists",
      };
    }
    if (error.message.includes("foreign key constraint")) {
      return { success: false, error: "Invalid gallery selected" };
    }
  }

  return { success: false, error: "Something went wrong. Please try again." };
}

// Utility function to validate permissions
async function validatePermission(): Promise<ActionResult | null> {
  if (!(await hasPermission("CONTESTS:MANAGE"))) {
    return {
      success: false,
      error: "You don't have permission to manage contests",
    };
  }
  return null;
}

export async function createContest(
  values: ContestFormValues
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const validatedFields = contestFormSchema.parse(values);

    // Check if contest name already exists
    const existingContest = await db
      .select({ id: contests.id })
      .from(contests)
      .where(eq(contests.name, validatedFields.name))
      .limit(1);

    if (existingContest.length > 0) {
      return {
        success: false,
        error: "A contest with this name already exists",
      };
    }

    // Convert form types to database types
    const dbValues = {
      name: validatedFields.name,
      contestType: validatedFields.contestType,
      location: validatedFields.location || null,
      description: validatedFields.description || null,
      standingsUrl: validatedFields.standingsUrl || null,
      date: new Date(validatedFields.date),
      galleryId: validatedFields.galleryId || null,
    };

    // Validate gallery exists if provided
    if (dbValues.galleryId) {
      const gallery = await db
        .select({ id: galleries.id })
        .from(galleries)
        .where(eq(galleries.id, dbValues.galleryId))
        .limit(1);

      if (gallery.length === 0) {
        return { success: false, error: "Selected gallery does not exist" };
      }
    }

    const result = await db
      .insert(contests)
      .values(dbValues)
      .returning({ id: contests.id });

    revalidatePath("/admin/contests");
    revalidatePath("/contests");

    return {
      success: true,
      data: { ...dbValues, id: result[0].id },
      message: "Contest created successfully",
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

export async function updateContest(
  id: number,
  values: ContestFormValues
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const validatedFields = contestFormSchema.parse(values);

    // Check if contest exists
    const existingContest = await db
      .select({ id: contests.id })
      .from(contests)
      .where(eq(contests.id, id))
      .limit(1);

    if (existingContest.length === 0) {
      return { success: false, error: "Contest not found" };
    }

    // Check if another contest with same name exists (excluding current contest)
    const duplicateContest = await db
      .select({ id: contests.id })
      .from(contests)
      .where(
        and(
          eq(contests.name, validatedFields.name),
          sql`${contests.id} != ${id}`
        )
      )
      .limit(1);

    if (duplicateContest.length > 0) {
      return {
        success: false,
        error: "A contest with this name already exists",
      };
    }

    // Convert form types to database types
    const dbValues = {
      name: validatedFields.name,
      contestType: validatedFields.contestType,
      location: validatedFields.location || null,
      description: validatedFields.description || null,
      standingsUrl: validatedFields.standingsUrl || null,
      date: new Date(validatedFields.date),
      galleryId: validatedFields.galleryId || null,
    };

    // Validate gallery exists if provided
    if (dbValues.galleryId) {
      const gallery = await db
        .select({ id: galleries.id })
        .from(galleries)
        .where(eq(galleries.id, dbValues.galleryId))
        .limit(1);

      if (gallery.length === 0) {
        return { success: false, error: "Selected gallery does not exist" };
      }
    }

    await db.update(contests).set(dbValues).where(eq(contests.id, id));

    revalidatePath("/admin/contests");
    revalidatePath(`/admin/contests/${id}/edit`);
    revalidatePath("/contests");

    return {
      success: true,
      data: { ...dbValues, id },
      message: "Contest updated successfully",
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

export async function deleteContest(id: number): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    // Check if contest exists and get team count
    const contestData = await db
      .select({
        id: contests.id,
        name: contests.name,
        teamCount: count(teams.id),
      })
      .from(contests)
      .leftJoin(teams, eq(teams.contestId, contests.id))
      .where(eq(contests.id, id))
      .groupBy(contests.id)
      .limit(1);

    if (contestData.length === 0) {
      return { success: false, error: "Contest not found" };
    }

    const contest = contestData[0];

    // Warn if contest has teams
    if (contest.teamCount > 0) {
      return {
        success: false,
        error: `Cannot delete contest with ${contest.teamCount} team(s). Please remove all teams first.`,
      };
    }

    await db.delete(contests).where(eq(contests.id, id));

    revalidatePath("/admin/contests");
    revalidatePath("/contests");

    return {
      success: true,
      message: `Contest "${contest.name}" deleted successfully`,
    };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getContest(
  id: number
): Promise<ActionResult<ContestWithGallery>> {
  try {
    const permissionError = await validatePermission();
    if (permissionError)
      return permissionError as ActionResult<ContestWithGallery>;

    const contest = await db
      .select({
        id: contests.id,
        name: contests.name,
        contestType: contests.contestType,
        location: contests.location,
        date: contests.date,
        description: contests.description,
        standingsUrl: contests.standingsUrl,
        galleryId: contests.galleryId,
        createdAt: contests.createdAt,
        updatedAt: contests.updatedAt,
        gallery: {
          id: galleries.id,
          title: galleries.title,
          slug: galleries.slug,
          status: galleries.status,
        },
      })
      .from(contests)
      .leftJoin(galleries, eq(contests.galleryId, galleries.id))
      .where(eq(contests.id, id))
      .limit(1);

    if (!contest || contest.length === 0) {
      return { success: false, error: "Contest not found" };
    }

    return { success: true, data: contest[0] };
  } catch (error) {
    return handleDbError(error) as ActionResult<ContestWithGallery>;
  }
}

export async function getPaginatedContests(
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<
  ActionResult<{
    contests: ContestListItem[];
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
        contests: ContestListItem[];
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
          ilike(contests.name, `%${search}%`),
          ilike(contests.location, `%${search}%`),
          ilike(contests.description, `%${search}%`)
        )
      : undefined;

    // Optimized query using subquery for team counts
    const [contestsData, totalCountResult] = await Promise.all([
      db
        .select({
          id: contests.id,
          name: contests.name,
          contestType: contests.contestType,
          location: contests.location,
          date: contests.date,
          description: contests.description,
          standingsUrl: contests.standingsUrl,
          galleryId: contests.galleryId,
          createdAt: contests.createdAt,
          updatedAt: contests.updatedAt,
          gallery: {
            id: galleries.id,
            title: galleries.title,
            slug: galleries.slug,
            status: galleries.status,
          },
          teamCount: sql<number>`(
            SELECT COUNT(${teams.id}) 
            FROM ${teams} 
            WHERE ${teams.contestId} = ${contests.id}
          )`,
        })
        .from(contests)
        .leftJoin(galleries, eq(contests.galleryId, galleries.id))
        .where(searchCondition)
        .orderBy(desc(contests.date), desc(contests.createdAt))
        .limit(pageSize)
        .offset(skip),
      db
        .select({ count: count() })
        .from(contests)
        .where(searchCondition)
        .then((result) => result[0].count),
    ]);

    // Transform data to match expected format
    const contestsWithTeamCount: ContestListItem[] = contestsData.map(
      (contest) => ({
        ...contest,
        _count: {
          teams: contest.teamCount,
        },
      })
    );

    const totalPages = Math.ceil(totalCountResult / pageSize);

    return {
      success: true,
      data: {
        contests: contestsWithTeamCount,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: totalCountResult,
          pageSize,
        },
      },
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<{
      contests: ContestListItem[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
      };
    }>;
  }
}

export async function getPublishedGalleries(): Promise<
  ActionResult<Pick<Gallery, "id" | "title">[]>
> {
  try {
    const permissionError = await validatePermission();
    if (permissionError)
      return permissionError as ActionResult<Pick<Gallery, "id" | "title">[]>;

    const galleriesData = await db
      .select({
        id: galleries.id,
        title: galleries.title,
      })
      .from(galleries)
      .where(eq(galleries.status, "published"))
      .orderBy(asc(galleries.title));

    return { success: true, data: galleriesData };
  } catch (error) {
    return handleDbError(error) as ActionResult<
      Pick<Gallery, "id" | "title">[]
    >;
  }
}

// New utility functions

export async function getContestStats(
  contestId: number
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const stats = await db
      .select({
        totalTeams: count(teams.id),
        totalMembers: sql<number>`COUNT(DISTINCT ${teamUser.userId})`,
        teamsWithMembers: sql<number>`COUNT(DISTINCT CASE WHEN ${teamUser.teamId} IS NOT NULL THEN ${teams.id} END)`,
        avgMembersPerTeam: sql<number>`AVG(team_member_counts.member_count)`,
      })
      .from(contests)
      .leftJoin(teams, eq(teams.contestId, contests.id))
      .leftJoin(teamUser, eq(teamUser.teamId, teams.id))
      .leftJoin(
        sql`(
          SELECT ${teams.id} as team_id, COUNT(${teamUser.userId}) as member_count
          FROM ${teams}
          LEFT JOIN ${teamUser} ON ${teamUser.teamId} = ${teams.id}
          WHERE ${teams.contestId} = ${contestId}
          GROUP BY ${teams.id}
        ) as team_member_counts`,
        sql`team_member_counts.team_id = ${teams.id}`
      )
      .where(eq(contests.id, contestId))
      .groupBy(contests.id);

    return { success: true, data: stats[0] || {} };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function duplicateContest(
  sourceId: number,
  newName: string
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    // Get source contest
    const sourceContest = await getContest(sourceId);
    if (!sourceContest.success || !sourceContest.data) {
      return { success: false, error: "Source contest not found" };
    }

    // Create new contest with modified name
    const contestData = sourceContest.data as ContestData;

    const newContestValues: ContestFormValues = {
      name: newName,
      contestType: contestData.contestType,
      location: contestData.location || "",
      date: new Date().toISOString().split("T")[0], // Today's date
      description: contestData.description || "",
      standingsUrl: contestData.standingsUrl || "",
      galleryId: contestData.galleryId || null,
    };

    return await createContest(newContestValues);
  } catch (error) {
    return handleDbError(error);
  }
}
