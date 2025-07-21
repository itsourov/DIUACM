"use server";
import { hasPermission } from "@/lib/authorization";
import { db } from "@/db/drizzle";
import { teamUser, users, teams } from "@/db/schema";
import { eq, and, ilike, or, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTeamMembers(teamId: number) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const members = await db
      .select({
        teamId: teamUser.teamId,
        userId: teamUser.userId,
        createdAt: teamUser.createdAt,
        updatedAt: teamUser.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username,
          image: users.image,
          studentId: users.studentId,
          department: users.department,
        },
      })
      .from(teamUser)
      .innerJoin(users, eq(teamUser.userId, users.id))
      .where(eq(teamUser.teamId, teamId))
      .orderBy(users.name);

    return {
      success: true,
      data: members,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function searchUsersForTeam(
  teamId: number,
  search: string,
  limit: number = 10
) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Get users who are already in this team
    const existingMembers = await db
      .select({ userId: teamUser.userId })
      .from(teamUser)
      .where(eq(teamUser.teamId, teamId));

    const existingUserIds = existingMembers.map((m) => m.userId);

    // Search for users who are not in this team
    const query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        image: users.image,
        studentId: users.studentId,
        department: users.department,
      })
      .from(users)
      .where(
        and(
          or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.username, `%${search}%`),
            ilike(users.studentId, `%${search}%`)
          ),
          existingUserIds.length > 0
            ? notInArray(users.id, existingUserIds)
            : undefined
        )
      )
      .limit(limit)
      .orderBy(users.name);

    const searchResults = await query;

    return {
      success: true,
      data: searchResults,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function addTeamMember(teamId: number, userId: string) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if team exists
    const team = await db
      .select({ contestId: teams.contestId })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (team.length === 0) {
      return {
        success: false,
        error: "Team not found",
      };
    }

    // Check if user is already in this team
    const existingMember = await db
      .select()
      .from(teamUser)
      .where(and(eq(teamUser.teamId, teamId), eq(teamUser.userId, userId)))
      .limit(1);

    if (existingMember.length > 0) {
      return { success: false, error: "User is already a member of this team" };
    }

    // Add user to team
    await db.insert(teamUser).values({
      teamId,
      userId,
    });

    // Get the added member with user details
    const member = await db
      .select({
        teamId: teamUser.teamId,
        userId: teamUser.userId,
        createdAt: teamUser.createdAt,
        updatedAt: teamUser.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username,
          image: users.image,
          studentId: users.studentId,
          department: users.department,
        },
      })
      .from(teamUser)
      .innerJoin(users, eq(teamUser.userId, users.id))
      .where(and(eq(teamUser.teamId, teamId), eq(teamUser.userId, userId)))
      .limit(1);

    revalidatePath(
      `/admin/contests/${team[0].contestId}/teams/${teamId}/members`
    );

    return {
      success: true,
      data: member[0],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function removeTeamMember(teamId: number, userId: string) {
  try {
    // Check if the user has permission to manage contests
    if (!(await hasPermission("CONTESTS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the contest ID for path revalidation
    const team = await db
      .select({ contestId: teams.contestId })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (team.length === 0) {
      return {
        success: false,
        error: "Team not found",
      };
    }

    await db
      .delete(teamUser)
      .where(and(eq(teamUser.teamId, teamId), eq(teamUser.userId, userId)));

    revalidatePath(
      `/admin/contests/${team[0].contestId}/teams/${teamId}/members`
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
