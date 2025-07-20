"use server";
import { hasPermission } from "@/lib/authorization";
import { db } from "@/db/drizzle";
import { teams, teamUser, contests } from "@/db/schema";
import type { Team } from "@/db/schema";
import { eq, and, count, sql, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { teamFormSchema, type TeamFormValues } from "../../schemas/contest";
import { z } from "zod";

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Extended Team type for list view with member count
export type TeamWithMemberCount = Team & {
  _count: {
    members: number;
  };
  memberCount: number; // For the SQL result
};

// Utility function to handle database errors
function handleDbError(error: unknown): ActionResult {
  console.error("Database error:", error);

  if (error instanceof Error) {
    if (error.message.includes("Duplicate entry")) {
      return {
        success: false,
        error: "A team with this name already exists in this contest",
      };
    }
    if (error.message.includes("foreign key constraint")) {
      return { success: false, error: "Invalid contest or user reference" };
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

export async function getTeams(
  contestId: number
): Promise<ActionResult<TeamWithMemberCount[]>> {
  try {
    const permissionError = await validatePermission();
    if (permissionError)
      return permissionError as ActionResult<TeamWithMemberCount[]>;

    // Optimized query with member count subquery
    const teamsData = await db
      .select({
        id: teams.id,
        name: teams.name,
        contestId: teams.contestId,
        rank: teams.rank,
        solveCount: teams.solveCount,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        memberCount: sql<number>`(
          SELECT COUNT(${teamUser.userId}) 
          FROM ${teamUser} 
          WHERE ${teamUser.teamId} = ${teams.id}
        )`,
      })
      .from(teams)
      .where(eq(teams.contestId, contestId))
      .orderBy(asc(teams.rank), asc(teams.name));

    // Transform data to match expected format
    const teamsWithMemberCount: TeamWithMemberCount[] = teamsData.map(
      (team) => ({
        ...team,
        _count: {
          members: team.memberCount,
        },
      })
    );

    return {
      success: true,
      data: teamsWithMemberCount,
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<TeamWithMemberCount[]>;
  }
}

export async function createTeam(
  contestId: number,
  values: TeamFormValues
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const validatedFields = teamFormSchema.parse(values);

    // Check if contest exists
    const contest = await db
      .select({ id: contests.id, name: contests.name })
      .from(contests)
      .where(eq(contests.id, contestId))
      .limit(1);

    if (contest.length === 0) {
      return { success: false, error: "Contest not found" };
    }

    // Check if team with same name exists in this contest
    const existingTeam = await db
      .select({ id: teams.id })
      .from(teams)
      .where(
        and(
          eq(teams.contestId, contestId),
          eq(teams.name, validatedFields.name)
        )
      )
      .limit(1);

    if (existingTeam.length > 0) {
      return {
        success: false,
        error: "A team with this name already exists in this contest",
      };
    }

    // Check rank uniqueness if provided
    if (validatedFields.rank) {
      const existingRank = await db
        .select({ id: teams.id })
        .from(teams)
        .where(
          and(
            eq(teams.contestId, contestId),
            eq(teams.rank, validatedFields.rank)
          )
        )
        .limit(1);

      if (existingRank.length > 0) {
        return {
          success: false,
          error: `Rank ${validatedFields.rank} is already taken by another team`,
        };
      }
    }

    const result = await db
      .insert(teams)
      .values({
        contestId,
        name: validatedFields.name,
        rank: validatedFields.rank || null,
        solveCount: validatedFields.solveCount || null,
      })
      .returning({ id: teams.id });

    revalidatePath(`/admin/contests/${contestId}/teams`);

    return {
      success: true,
      data: {
        id: result[0].id,
        ...validatedFields,
        contestId,
      },
      message: `Team "${validatedFields.name}" created successfully`,
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

export async function updateTeam(
  teamId: number,
  contestId: number,
  values: TeamFormValues
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const validatedFields = teamFormSchema.parse(values);

    // Check if team exists
    const existingTeam = await db
      .select({
        id: teams.id,
        name: teams.name,
        contestId: teams.contestId,
      })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (existingTeam.length === 0) {
      return { success: false, error: "Team not found" };
    }

    if (existingTeam[0].contestId !== contestId) {
      return { success: false, error: "Team does not belong to this contest" };
    }

    // Check if another team with same name exists in this contest (excluding current team)
    const duplicateTeam = await db
      .select({ id: teams.id })
      .from(teams)
      .where(
        and(
          eq(teams.contestId, contestId),
          eq(teams.name, validatedFields.name),
          sql`${teams.id} != ${teamId}`
        )
      )
      .limit(1);

    if (duplicateTeam.length > 0) {
      return {
        success: false,
        error: "A team with this name already exists in this contest",
      };
    }

    // Check rank uniqueness if provided and different from current
    if (validatedFields.rank) {
      const existingRank = await db
        .select({ id: teams.id })
        .from(teams)
        .where(
          and(
            eq(teams.contestId, contestId),
            eq(teams.rank, validatedFields.rank),
            sql`${teams.id} != ${teamId}`
          )
        )
        .limit(1);

      if (existingRank.length > 0) {
        return {
          success: false,
          error: `Rank ${validatedFields.rank} is already taken by another team`,
        };
      }
    }

    await db
      .update(teams)
      .set({
        name: validatedFields.name,
        rank: validatedFields.rank || null,
        solveCount: validatedFields.solveCount || null,
      })
      .where(eq(teams.id, teamId));

    revalidatePath(`/admin/contests/${contestId}/teams`);

    return {
      success: true,
      message: `Team "${validatedFields.name}" updated successfully`,
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

export async function getTeam(teamId: number): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const team = await db
      .select({
        id: teams.id,
        name: teams.name,
        contestId: teams.contestId,
        rank: teams.rank,
        solveCount: teams.solveCount,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        memberCount: sql<number>`(
          SELECT COUNT(${teamUser.userId}) 
          FROM ${teamUser} 
          WHERE ${teamUser.teamId} = ${teams.id}
        )`,
      })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (team.length === 0) {
      return { success: false, error: "Team not found" };
    }

    const teamData = {
      ...team[0],
      _count: {
        members: team[0].memberCount,
      },
    };

    return { success: true, data: teamData };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function deleteTeam(
  teamId: number,
  contestId: number
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    // Get team info before deletion
    const team = await db
      .select({
        id: teams.id,
        name: teams.name,
        memberCount: sql<number>`(
          SELECT COUNT(${teamUser.userId}) 
          FROM ${teamUser} 
          WHERE ${teamUser.teamId} = ${teams.id}
        )`,
      })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (team.length === 0) {
      return { success: false, error: "Team not found" };
    }

    const teamData = team[0];

    // Check if team has members
    if (teamData.memberCount > 0) {
      return {
        success: false,
        error: `Cannot delete team with ${teamData.memberCount} member(s). Please remove all members first.`,
      };
    }

    await db.delete(teams).where(eq(teams.id, teamId));

    revalidatePath(`/admin/contests/${contestId}/teams`);

    return {
      success: true,
      message: `Team "${teamData.name}" deleted successfully`,
    };
  } catch (error) {
    return handleDbError(error);
  }
}

// New utility functions

export async function getTeamStats(contestId: number): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    const stats = await db
      .select({
        totalTeams: count(teams.id),
        totalMembers: sql<number>`COUNT(DISTINCT ${teamUser.userId})`,
        teamsWithMembers: sql<number>`COUNT(DISTINCT CASE WHEN ${teamUser.teamId} IS NOT NULL THEN ${teams.id} END)`,
        avgMembersPerTeam: sql<number>`ROUND(AVG(member_counts.member_count), 2)`,
        maxSolveCount: sql<number>`MAX(${teams.solveCount})`,
        avgSolveCount: sql<number>`ROUND(AVG(${teams.solveCount}), 2)`,
      })
      .from(teams)
      .leftJoin(teamUser, eq(teamUser.teamId, teams.id))
      .leftJoin(
        sql`(
          SELECT ${teams.id} as team_id, COUNT(${teamUser.userId}) as member_count
          FROM ${teams}
          LEFT JOIN ${teamUser} ON ${teamUser.teamId} = ${teams.id}
          WHERE ${teams.contestId} = ${contestId}
          GROUP BY ${teams.id}
        ) as member_counts`,
        sql`member_counts.team_id = ${teams.id}`
      )
      .where(eq(teams.contestId, contestId))
      .groupBy(teams.contestId);

    return { success: true, data: stats[0] || {} };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function bulkUpdateTeamRanks(
  contestId: number,
  teamRanks: { teamId: number; rank: number }[]
): Promise<ActionResult> {
  try {
    const permissionError = await validatePermission();
    if (permissionError) return permissionError;

    // Validate all teams belong to the contest
    const teamIds = teamRanks.map((tr) => tr.teamId);
    const existingTeams = await db
      .select({ id: teams.id })
      .from(teams)
      .where(
        and(
          eq(teams.contestId, contestId),
          sql`${teams.id} IN (${teamIds.join(",")})`
        )
      );

    if (existingTeams.length !== teamIds.length) {
      return {
        success: false,
        error: "Some teams do not belong to this contest",
      };
    }

    // Check for duplicate ranks
    const ranks = teamRanks.map((tr) => tr.rank);
    const uniqueRanks = [...new Set(ranks)];
    if (ranks.length !== uniqueRanks.length) {
      return { success: false, error: "Duplicate ranks found" };
    }

    // Update teams in a transaction-like manner
    for (const { teamId, rank } of teamRanks) {
      await db.update(teams).set({ rank }).where(eq(teams.id, teamId));
    }

    revalidatePath(`/admin/contests/${contestId}/teams`);

    return {
      success: true,
      message: `Updated ranks for ${teamRanks.length} teams`,
    };
  } catch (error) {
    return handleDbError(error);
  }
}
