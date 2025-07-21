"use server";

import { db } from "@/db/drizzle";
import { permissions, type Permission } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, or, ilike, count, desc, asc } from "drizzle-orm";
import {
  permissionFormSchema,
  type PermissionFormValues,
} from "./schemas/permission";
import { hasPermission } from "@/lib/authorization";

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Utility function to handle database errors
function handleDbError(error: unknown): ActionResult {
  console.error("Database error:", error);

  if (error instanceof Error) {
    // Handle specific database constraint errors
    if (error.message.includes("Duplicate entry")) {
      return {
        success: false,
        error: "A permission with this name already exists",
      };
    }
    if (error.message.includes("foreign key constraint")) {
      return { success: false, error: "Invalid reference" };
    }
    return { success: false, error: error.message };
  }

  return { success: false, error: "An unknown error occurred" };
}

export async function createPermission(
  values: PermissionFormValues
): Promise<ActionResult<{ id: number }>> {
  try {
    // Check permissions
    if (!(await hasPermission("PERMISSIONS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validatedFields = permissionFormSchema.parse(values);

    // Check for duplicate name
    const existing = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.name, validatedFields.name))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "A permission with this name already exists",
      };
    }

    // Create permission
    const result = await db
      .insert(permissions)
      .values({
        name: validatedFields.name,
        description: validatedFields.description,
      })
      .returning({ id: permissions.id });

    revalidatePath("/admin/permissions");
    return {
      success: true,
      data: result[0],
      message: "Permission created successfully",
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<{ id: number }>;
  }
}

export async function updatePermission(
  id: number,
  values: PermissionFormValues
): Promise<ActionResult<Permission>> {
  try {
    // Check permissions
    if (!(await hasPermission("PERMISSIONS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validatedFields = permissionFormSchema.parse(values);

    // Check if permission exists
    const existing = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Permission not found" };
    }

    // Check for duplicate name (excluding current permission)
    const duplicate = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.name, validatedFields.name))
      .limit(1);

    if (duplicate.length > 0 && duplicate[0].id !== id) {
      return {
        success: false,
        error: "A permission with this name already exists",
      };
    }

    // Update permission
    await db
      .update(permissions)
      .set({
        name: validatedFields.name,
        description: validatedFields.description,
      })
      .where(eq(permissions.id, id));

    // Get the updated permission
    const [updated] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);

    revalidatePath("/admin/permissions");
    revalidatePath(`/admin/permissions/${id}`);
    return {
      success: true,
      data: updated,
      message: "Permission updated successfully",
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<Permission>;
  }
}

export async function deletePermission(id: number): Promise<ActionResult> {
  try {
    // Check permissions
    if (!(await hasPermission("PERMISSIONS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if permission exists
    const existing = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Permission not found" };
    }

    // Delete permission
    await db.delete(permissions).where(eq(permissions.id, id));

    revalidatePath("/admin/permissions");
    return {
      success: true,
      message: "Permission deleted successfully",
    };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getPermissionById(
  id: number
): Promise<ActionResult<Permission>> {
  try {
    // Check permissions
    if (!(await hasPermission("PERMISSIONS:VIEW"))) {
      return { success: false, error: "Unauthorized" };
    }

    const [permission] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);

    if (!permission) {
      return { success: false, error: "Permission not found" };
    }

    return { success: true, data: permission };
  } catch (error) {
    return handleDbError(error) as ActionResult<Permission>;
  }
}

export async function getPaginatedPermissions(
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortBy: "id" | "name" = "id",
  sortOrder: "asc" | "desc" = "desc"
): Promise<
  ActionResult<{
    permissions: Permission[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      pageSize: number;
    };
  }>
> {
  try {
    // Check permissions
    if (!(await hasPermission("PERMISSIONS:VIEW"))) {
      return { success: false, error: "Unauthorized" };
    }

    const offset = (page - 1) * limit;

    // Build the where clause for search
    const whereClause = search
      ? or(
          ilike(permissions.name, `%${search}%`),
          ilike(permissions.description, `%${search}%`)
        )
      : undefined;

    // Build order by clause
    const orderByClause =
      sortBy === "name"
        ? sortOrder === "asc"
          ? asc(permissions.name)
          : desc(permissions.name)
        : sortOrder === "asc"
        ? asc(permissions.id)
        : desc(permissions.id);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(permissions)
      .where(whereClause);

    const totalCount = totalResult.count;
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated permissions
    const permissionsData = await db
      .select()
      .from(permissions)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: {
        permissions: permissionsData,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize: limit,
        },
      },
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<{
      permissions: Permission[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
      };
    }>;
  }
}

export async function getAllPermissions(): Promise<ActionResult<Permission[]>> {
  try {
    // Check permissions
    if (!(await hasPermission("PERMISSIONS:VIEW"))) {
      return { success: false, error: "Unauthorized" };
    }

    const permissionsData = await db
      .select()
      .from(permissions)
      .orderBy(asc(permissions.name));

    return {
      success: true,
      data: permissionsData,
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<Permission[]>;
  }
}
