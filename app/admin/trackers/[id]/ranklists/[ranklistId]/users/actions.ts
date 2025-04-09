"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getRanklistUsers(ranklistId: string) {
  try {
    const users = await prisma.rankListUser.findMany({
      where: { rankListId: ranklistId },
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

export async function searchUsersForRanklist(
  ranklistId: string,
  search: string,
  limit: number = 10
) {
  try {
    // Find users that aren't already in this ranklist
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
            rankLists: {
              none: { rankListId: ranklistId },
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

export async function addRanklistUser(ranklistId: string, userId: string) {
  try {
    // Get the tracker ID for path revalidation
    const ranklist = await prisma.rankList.findUnique({
      where: { id: ranklistId },
      select: { trackerId: true },
    });

    if (!ranklist) {
      return {
        success: false,
        error: "Ranklist not found",
      };
    }

    const ranklistUser = await prisma.rankListUser.create({
      data: {
        rankListId: ranklistId,
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

    revalidatePath(
      `/admin/trackers/${ranklist.trackerId}/ranklists/${ranklistId}/users`
    );

    return {
      success: true,
      data: ranklistUser,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function removeRanklistUser(userId: string, ranklistId: string) {
  try {
    // Get the tracker ID for path revalidation
    const ranklist = await prisma.rankList.findUnique({
      where: { id: ranklistId },
      select: { trackerId: true },
    });

    if (!ranklist) {
      return {
        success: false,
        error: "Ranklist not found",
      };
    }

    await prisma.rankListUser.delete({
      where: {
        userId_rankListId: {
          userId,
          rankListId: ranklistId,
        },
      },
    });

    revalidatePath(
      `/admin/trackers/${ranklist.trackerId}/ranklists/${ranklistId}/users`
    );

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
