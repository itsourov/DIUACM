"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Get users assigned to a specific role
export async function getRoleUsers(roleId: string) {
  try {
    // Find the role with its users
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
            studentId: true,
            department: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!role) {
      return {
        success: false,
        error: "Role not found",
      };
    }

    return {
      success: true,
      data: role.users,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Search for users that are not already assigned to the role
export async function searchUsersForRole(
  roleId: string,
  search: string,
  limit: number = 10
) {
  try {
    // Find users that aren't already assigned to this role
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
            roles: {
              none: { id: roleId },
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

// Add a user to a role
export async function addUserToRole(roleId: string, userId: string) {
  try {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: {
          where: { id: userId },
          select: { id: true },
        },
      },
    });

    if (!role) {
      return {
        success: false,
        error: "Role not found",
      };
    }

    // Check if the user is already assigned to the role
    if (role.users.length > 0) {
      return {
        success: false,
        error: "User is already assigned to this role",
      };
    }

    // Add user to the role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        users: {
          connect: { id: userId },
        },
      },
      include: {
        users: {
          where: { id: userId },
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

    revalidatePath(`/admin/roles/${roleId}/users`);

    return {
      success: true,
      data: updatedRole.users[0],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Remove a user from a role
export async function removeUserFromRole(roleId: string, userId: string) {
  try {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return {
        success: false,
        error: "Role not found",
      };
    }

    // Remove user from role
    await prisma.role.update({
      where: { id: roleId },
      data: {
        users: {
          disconnect: { id: userId },
        },
      },
    });

    revalidatePath(`/admin/roles/${roleId}/users`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
