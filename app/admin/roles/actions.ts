"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { roleFormSchema, type RoleFormValues } from "./schemas/role";
import { Prisma } from "@prisma/client";

// Create a new role
export async function createRole(values: RoleFormValues) {
  try {
    const validatedFields = roleFormSchema.parse(values);

    // Check if role with same name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedFields.name },
    });

    if (existingRole) {
      return {
        success: false,
        error: "A role with this name already exists.",
      };
    }

    // Create role with permissions
    const role = await prisma.role.create({
      data: {
        name: validatedFields.name,
        description: validatedFields.description,
        permissions: {
          connect: validatedFields.permissionIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        permissions: true,
      },
    });

    revalidatePath("/admin/roles");
    return { success: true, data: role };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error creating role:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Update an existing role
export async function updateRole(id: string, values: RoleFormValues) {
  try {
    const validatedFields = roleFormSchema.parse(values);

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return {
        success: false,
        error: "Role not found.",
      };
    }

    // Check if another role with the same name exists (except this one)
    const duplicateName = await prisma.role.findFirst({
      where: {
        name: validatedFields.name,
        NOT: { id },
      },
    });

    if (duplicateName) {
      return {
        success: false,
        error: "Another role with this name already exists.",
      };
    }

    // Update role and reconnect permissions
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: validatedFields.name,
        description: validatedFields.description,
        permissions: {
          set: validatedFields.permissionIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        permissions: true,
      },
    });

    revalidatePath("/admin/roles");
    revalidatePath(`/admin/roles/${id}/edit`);
    return { success: true, data: role };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error updating role:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Delete a role
export async function deleteRole(id: string) {
  try {
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          take: 1,
        },
      },
    });

    if (!existingRole) {
      return {
        success: false,
        error: "Role not found.",
      };
    }

    // Check if role is assigned to any users
    if (existingRole.users.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete role because it is assigned to one or more users. Remove the role from users first.",
      };
    }

    await prisma.role.delete({
      where: { id },
    });

    revalidatePath("/admin/roles");
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get a single role by ID
export async function getRole(id: string) {
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    return { success: true, data: role };
  } catch (error) {
    console.error("Error fetching role:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get paginated roles with optional search
export async function getPaginatedRoles(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    const skip = (page - 1) * pageSize;

    // Build where conditions
    const where: Prisma.RoleWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          ],
        }
      : {};

    // Execute the queries
    const [roles, totalCount] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: "asc" },
        include: {
          permissions: true,
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.role.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        roles,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get all permissions (for role form)
export async function getAllPermissions() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { name: "asc" },
    });

    return { success: true, data: permissions };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
