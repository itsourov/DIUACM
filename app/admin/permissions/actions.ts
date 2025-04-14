"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  permissionFormSchema,
  type PermissionFormValues,
} from "./schemas/permission";
import { Prisma } from "@prisma/client";

// Create a new permission
export async function createPermission(values: PermissionFormValues) {
  try {
    const validatedFields = permissionFormSchema.parse(values);

    // Check if permission with same name already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name: validatedFields.name },
    });

    if (existingPermission) {
      return {
        success: false,
        error: "A permission with this name already exists.",
      };
    }

    const permission = await prisma.permission.create({
      data: validatedFields,
    });

    revalidatePath("/admin/permissions");
    return { success: true, data: permission };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error creating permission:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Update an existing permission
export async function updatePermission(
  id: string,
  values: PermissionFormValues
) {
  try {
    const validatedFields = permissionFormSchema.parse(values);

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return {
        success: false,
        error: "Permission not found.",
      };
    }

    // Check if another permission with the same name exists (except this one)
    const duplicateName = await prisma.permission.findFirst({
      where: {
        name: validatedFields.name,
        NOT: { id },
      },
    });

    if (duplicateName) {
      return {
        success: false,
        error: "Another permission with this name already exists.",
      };
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: validatedFields,
    });

    revalidatePath("/admin/permissions");
    revalidatePath(`/admin/permissions/${id}/edit`);
    return { success: true, data: permission };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error updating permission:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Delete a permission
export async function deletePermission(id: string) {
  try {
    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return {
        success: false,
        error: "Permission not found.",
      };
    }

    await prisma.permission.delete({
      where: { id },
    });

    revalidatePath("/admin/permissions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting permission:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get a single permission by ID
export async function getPermission(id: string) {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      return { success: false, error: "Permission not found" };
    }

    return { success: true, data: permission };
  } catch (error) {
    console.error("Error fetching permission:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get paginated permissions with optional search
export async function getPaginatedPermissions(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    const skip = (page - 1) * pageSize;

    // Build where conditions
    const where: Prisma.PermissionWhereInput = search
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
    const [permissions, totalCount] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: "asc" },
      }),
      prisma.permission.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        permissions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
