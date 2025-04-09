"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getRanklists(trackerId: string) {
  try {
    const ranklists = await prisma.rankList.findMany({
      where: { trackerId },
      include: {
        _count: {
          select: {
            eventRankLists: true,
            rankListUsers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: ranklists,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function createRanklist(
  trackerId: string,
  data: {
    keyword: string;
    description?: string | null;
    weightOfUpsolve: number;
  }
) {
  try {
    // Check if ranklist with same keyword exists in this tracker
    const existingRanklist = await prisma.rankList.findFirst({
      where: {
        trackerId,
        keyword: data.keyword,
      },
    });

    if (existingRanklist) {
      return {
        success: false,
        error: "A ranklist with this keyword already exists in this tracker.",
      };
    }

    const ranklist = await prisma.rankList.create({
      data: {
        trackerId,
        keyword: data.keyword,
        description: data.description,
        weightOfUpsolve: data.weightOfUpsolve,
      },
    });

    revalidatePath(`/admin/trackers/${trackerId}/ranklists`);

    return {
      success: true,
      data: ranklist,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function updateRanklist(
  ranklistId: string,
  trackerId: string,
  data: {
    keyword: string;
    description?: string | null;
    weightOfUpsolve: number;
  }
) {
  try {
    // Check if another ranklist with same keyword exists
    const existingRanklist = await prisma.rankList.findFirst({
      where: {
        trackerId,
        keyword: data.keyword,
        id: { not: ranklistId },
      },
    });

    if (existingRanklist) {
      return {
        success: false,
        error:
          "Another ranklist with this keyword already exists in this tracker.",
      };
    }

    const ranklist = await prisma.rankList.update({
      where: { id: ranklistId },
      data: {
        keyword: data.keyword,
        description: data.description,
        weightOfUpsolve: data.weightOfUpsolve,
      },
    });

    revalidatePath(`/admin/trackers/${trackerId}/ranklists`);
    revalidatePath(`/admin/trackers/${trackerId}/ranklists/${ranklistId}/edit`);

    return {
      success: true,
      data: ranklist,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getRanklist(ranklistId: string) {
  try {
    const ranklist = await prisma.rankList.findUnique({
      where: { id: ranklistId },
    });

    if (!ranklist) {
      return {
        success: false,
        error: "Ranklist not found",
      };
    }

    return {
      success: true,
      data: ranklist,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function deleteRanklist(ranklistId: string, trackerId: string) {
  try {
    await prisma.rankList.delete({
      where: { id: ranklistId },
    });

    revalidatePath(`/admin/trackers/${trackerId}/ranklists`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
