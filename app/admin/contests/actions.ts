"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { contestFormSchema, type ContestFormValues } from "./schemas/contest";
import { hasPermission } from "@/lib/authorization";

export async function createContest(values: ContestFormValues) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const validatedFields = contestFormSchema.parse(values);

    const contest = await prisma.contest.create({
      data: validatedFields,
    });

    revalidatePath("/admin/contests");
    return { success: true, data: contest };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function updateContest(id: string, values: ContestFormValues) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = contestFormSchema.parse(values);

    const contest = await prisma.contest.update({
      where: { id },
      data: validatedFields,
    });

    revalidatePath("/admin/contests");
    revalidatePath(`/admin/contests/${id}/edit`);
    return { success: true, data: contest };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function deleteContest(id: string) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    await prisma.contest.delete({
      where: { id },
    });

    revalidatePath("/admin/contests");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getContest(id: string) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const contest = await prisma.contest.findUnique({
      where: { id },
    });

    if (!contest) {
      return { success: false, error: "Contest not found" };
    }

    return { success: true, data: contest };
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

    const where: Prisma.ContestWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              location: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const [contests, totalCount] = await Promise.all([
      prisma.contest.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          _count: {
            select: {
              teams: true,
            },
          },
        },
      }),
      prisma.contest.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        contests,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
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
