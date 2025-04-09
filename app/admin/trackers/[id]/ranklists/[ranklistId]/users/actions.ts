"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRanklistUsers(rankListId: string) {
  try {
    const users = await prisma.rankListUser.findMany({
      where: { rankListId },
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
            codeforcesHandle: true,
            atcoderHandle: true,
            vjudgeHandle: true,
          },
        },
      },
      orderBy: [{ score: "desc" }, { createdAt: "asc" }],
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
  rankListId: string,
  search: string,
  limit: number = 10
) {
  try {
    // Find users that aren't already connected to this ranklist
    // and match the search query
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { studentId: { contains: search, mode: "insensitive" } },
            ],
          },
          {
            rankListUsers: {
              none: { rankListId },
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
        codeforcesHandle: true,
        atcoderHandle: true,
        vjudgeHandle: true,
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

export async function addUserToRanklist(
  rankListId: string,
  userId: string,
  score: number = 0
) {
  try {
    const rankListUser = await prisma.rankListUser.create({
      data: {
        rankListId,
        userId,
        score,
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
            codeforcesHandle: true,
            atcoderHandle: true,
            vjudgeHandle: true,
          },
        },
      },
    });

    // Fix revalidation path to match the project structure
    revalidatePath(`/admin/trackers/[id]/ranklists/${rankListId}/users`);

    return {
      success: true,
      data: rankListUser,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function updateUserScore(
  rankListUserId: string,
  rankListId: string,
  score: number
) {
  try {
    const rankListUser = await prisma.rankListUser.update({
      where: { id: rankListUserId },
      data: {
        score,
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
            codeforcesHandle: true,
            atcoderHandle: true,
            vjudgeHandle: true,
          },
        },
      },
    });

    // Fix revalidation path to match the project structure
    revalidatePath(`/admin/trackers/[id]/ranklists/${rankListId}/users`);

    return {
      success: true,
      data: rankListUser,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function removeUserFromRanklist(
  rankListUserId: string,
  rankListId: string
) {
  try {
    await prisma.rankListUser.delete({
      where: { id: rankListUserId },
    });

    // Fix revalidation path to match the project structure
    revalidatePath(`/admin/trackers/[id]/ranklists/${rankListId}/users`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
