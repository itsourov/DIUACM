"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getTeamMembers(teamId: string) {
  try {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
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
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return { 
      success: true, 
      data: members 
    };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function searchUsersForTeam(
  teamId: string,
  search: string,
  limit: number = 10
) {
  try {
    // Find users that aren't already members of this team
    // and match the search query
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { studentId: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          },
          {
            teamMemberships: {
              none: { teamId }
            }
          }
        ]
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
      data: users
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again."
    };
  }
}

export async function addTeamMember(teamId: string, userId: string) {
  try {
    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { contestId: true }
    });

    if (!team) {
      return {
        success: false,
        error: "Team not found"
      };
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId,
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
          }
        }
      }
    });

    revalidatePath(`/admin/contests/${team.contestId}/teams/${teamId}/members`);
    
    return { 
      success: true, 
      data: member 
    };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function removeTeamMember(memberId: string, teamId: string) {
  try {
    // Get the contest ID for path revalidation
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { contestId: true }
    });

    if (!team) {
      return {
        success: false,
        error: "Team not found"
      };
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    revalidatePath(`/admin/contests/${team.contestId}/teams/${teamId}/members`);
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}