"use server";
import { hasPermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTeams(contestId: string) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    const teams = await prisma.team.findMany({
      where: { contestId },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: teams,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function createTeam(
  contestId: string,
  data: { name: string; rank?: number; solveCount?: number }
) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    // Check if team with same name exists in this contest
    const existingTeam = await prisma.team.findFirst({
      where: {
        contestId,
        name: data.name,
      },
    });

    if (existingTeam) {
      return {
        success: false,
        error: "A team with this name already exists in this contest.",
      };
    }

    const team = await prisma.team.create({
      data: {
        contestId,
        name: data.name,
        rank: data.rank || null,
        solveCount: data.solveCount || null,
      },
    });

    revalidatePath(`/admin/contests/${contestId}/teams`);

    return {
      success: true,
      data: team,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function updateTeam(
  teamId: string,
  contestId: string,
  data: { name: string; rank?: number; solveCount?: number }
) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }
    // Check if another team with the same name exists in this contest
    const existingTeam = await prisma.team.findFirst({
      where: {
        contestId,
        name: data.name,
        id: { not: teamId }, // Exclude the current team from the check
      },
    });

    if (existingTeam) {
      return {
        success: false,
        error: "Another team with this name already exists in this contest.",
      };
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: data.name,
        rank: data.rank || null,
        solveCount: data.solveCount || null,
      },
    });

    revalidatePath(`/admin/contests/${contestId}/teams`);
    revalidatePath(`/admin/contests/${contestId}/teams/${teamId}/edit`);

    return {
      success: true,
      data: team,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getTeam(teamId: string) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return {
        success: false,
        error: "Team not found",
      };
    }

    return {
      success: true,
      data: team,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function deleteTeam(teamId: string, contestId: string) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    revalidatePath(`/admin/contests/${contestId}/teams`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
