"use server";
import { hasPermission } from "@/lib/authorization";
import { db } from "@/db/drizzle";
import { teams, teamUser } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTeams(contestId: number) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const teamsData = await db
      .select({
        id: teams.id,
        name: teams.name,
        contestId: teams.contestId,
        rank: teams.rank,
        solveCount: teams.solveCount,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .where(eq(teams.contestId, contestId))
      .orderBy(teams.name);

    // Get member counts for each team
    const teamsWithMemberCount = await Promise.all(
      teamsData.map(async (team) => {
        const memberCount = await db
          .select({ count: count() })
          .from(teamUser)
          .where(eq(teamUser.teamId, team.id))
          .then((result) => result[0].count);

        return {
          ...team,
          _count: {
            members: memberCount,
          },
        };
      })
    );

    return {
      success: true,
      data: teamsWithMemberCount,
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
  contestId: number,
  data: { name: string; rank?: number; solveCount?: number }
) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if team with same name exists in this contest
    const existingTeam = await db
      .select()
      .from(teams)
      .where(and(eq(teams.contestId, contestId), eq(teams.name, data.name)))
      .limit(1);

    if (existingTeam.length > 0) {
      return { success: false, error: "Team with this name already exists" };
    }

    await db.insert(teams).values({
      contestId,
      name: data.name,
      rank: data.rank,
      solveCount: data.solveCount,
    });

    revalidatePath(`/admin/contests/${contestId}/teams`);

    return {
      success: true,
      message: "Team created successfully",
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
  teamId: number,
  contestId: number,
  data: { name: string; rank?: number; solveCount?: number }
) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if team with same name exists in this contest (excluding current team)
    const existingTeam = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.contestId, contestId),
          eq(teams.name, data.name),
          // Use SQL to exclude current team
          // Note: This is a simplified check - in production you might want to use a more robust approach
        )
      )
      .limit(1);

    // We need to check if the existing team is not the current team
    if (existingTeam.length > 0 && existingTeam[0].id !== teamId) {
      return { success: false, error: "Team with this name already exists" };
    }

    await db
      .update(teams)
      .set({
        name: data.name,
        rank: data.rank,
        solveCount: data.solveCount,
      })
      .where(eq(teams.id, teamId));

    revalidatePath(`/admin/contests/${contestId}/teams`);

    return {
      success: true,
      message: "Team updated successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getTeam(teamId: number) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (team.length === 0) {
      return { success: false, error: "Team not found" };
    }

    return {
      success: true,
      data: team[0],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function deleteTeam(teamId: number, contestId: number) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(teams).where(eq(teams.id, teamId));

    revalidatePath(`/admin/contests/${contestId}/teams`);

    return {
      success: true,
      message: "Team deleted successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
