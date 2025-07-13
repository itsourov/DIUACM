"use server";

import { db } from "@/db/drizzle";
import { contests, galleries, teams } from "@/db/schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, or, like, count, desc } from "drizzle-orm";
import { contestFormSchema, type ContestFormValues } from "./schemas/contest";
import { hasPermission } from "@/lib/authorization";

export async function createContest(values: ContestFormValues) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const validatedFields = contestFormSchema.parse(values);

    // Convert form types to database types
    const dbValues = {
      name: validatedFields.name,
      contestType: validatedFields.contestType,
      location: validatedFields.location || null,
      description: validatedFields.description || null,
      standingsUrl: validatedFields.standingsUrl || null,
      date: new Date(validatedFields.date),
      galleryId: validatedFields.galleryId && validatedFields.galleryId !== "" ? parseInt(validatedFields.galleryId) : null,
    };

    await db.insert(contests).values(dbValues);

    revalidatePath("/admin/contests");
    revalidatePath("/contests");
    return { success: true, data: dbValues };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Please check the form for errors." };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function updateContest(id: number, values: ContestFormValues) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = contestFormSchema.parse(values);

    // Convert form types to database types
    const dbValues = {
      name: validatedFields.name,
      contestType: validatedFields.contestType,
      location: validatedFields.location || null,
      description: validatedFields.description || null,
      standingsUrl: validatedFields.standingsUrl || null,
      date: new Date(validatedFields.date),
      galleryId: validatedFields.galleryId && validatedFields.galleryId !== "" ? parseInt(validatedFields.galleryId) : null,
    };

    await db
      .update(contests)
      .set(dbValues)
      .where(eq(contests.id, id));

    revalidatePath("/admin/contests");
    revalidatePath(`/admin/contests/${id}/edit`);
    revalidatePath("/contests");

    return { success: true, data: { ...dbValues, id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Please check the form for errors." };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function deleteContest(id: number) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    await db.delete(contests).where(eq(contests.id, id));

    revalidatePath("/admin/contests");
    revalidatePath("/contests");

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getContest(id: number) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
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
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getPaginatedContests(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * pageSize;

    const searchCondition = search
      ? or(
        like(contests.name, `%${search}%`),
        like(contests.location, `%${search}%`),
        like(contests.description, `%${search}%`)
      )
      : undefined;

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
        })
        .from(contests)
        .leftJoin(galleries, eq(contests.galleryId, galleries.id))
        .where(searchCondition)
        .orderBy(desc(contests.date))
        .limit(pageSize)
        .offset(skip),
      db
        .select({ count: count() })
        .from(contests)
        .where(searchCondition)
        .then((result) => result[0].count),
    ]);

    // Get team counts for each contest
    const contestsWithTeamCount = await Promise.all(
      contestsData.map(async (contest) => {
        const teamCount = await db
          .select({ count: count() })
          .from(teams)
          .where(eq(teams.contestId, contest.id))
          .then((result) => result[0].count);

        return {
          ...contest,
          _count: {
            teams: teamCount,
          },
        };
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
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getPublishedGalleries() {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const galleriesData = await db
      .select({
        id: galleries.id,
        title: galleries.title,
      })
      .from(galleries)
      .where(eq(galleries.status, "published"))
      .orderBy(galleries.title);

    return { success: true, data: galleriesData };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
