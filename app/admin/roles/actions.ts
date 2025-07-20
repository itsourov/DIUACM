"use server";

import { db } from "@/db/drizzle";
import { roles, rolePermissions, permissions } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, or, like, count, desc } from "drizzle-orm";
import {
  roleFormSchema,
  roleUpdateFormSchema,
  type RoleFormValues,
  type RoleUpdateFormValues,
} from "./schemas/role";
import { hasPermission } from "@/lib/authorization";

export async function createRole(values: RoleFormValues) {
  try {
    // Check if the user has permission to manage roles
    if (!(await hasPermission("ROLES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = roleFormSchema.parse(values);

    // Check if role name is already taken
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, validatedFields.name))
      .limit(1);

    if (existingRole.length > 0) {
      return {
        success: false,
        error: { name: ["This role name is already in use."] },
      };
    }

    const newRole = await db
      .insert(roles)
      .values({
        name: validatedFields.name,
        description: validatedFields.description,
      })
      .returning({ id: roles.id });

    revalidatePath("/admin/roles");
    return { success: true, data: newRole[0] };
  } catch (error) {
    console.error("Error creating role:", error);
    return { success: false, error: "Failed to create role" };
  }
}

export async function updateRole(values: RoleUpdateFormValues) {
  try {
    // Check if the user has permission to manage roles
    if (!(await hasPermission("ROLES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = roleUpdateFormSchema.parse(values);

    // Check if role name is already taken by another role
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, validatedFields.name))
      .limit(1);

    if (existingRole.length > 0 && existingRole[0].id !== validatedFields.id) {
      return {
        success: false,
        error: { name: ["This role name is already in use."] },
      };
    }

    await db
      .update(roles)
      .set({
        name: validatedFields.name,
        description: validatedFields.description,
      })
      .where(eq(roles.id, validatedFields.id));

    revalidatePath("/admin/roles");
    revalidatePath(`/admin/roles/${validatedFields.id}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, error: "Failed to update role" };
  }
}

export async function deleteRole(id: number) {
  try {
    // Check if the user has permission to manage roles
    if (!(await hasPermission("ROLES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(roles).where(eq(roles.id, id));

    revalidatePath("/admin/roles");
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, error: "Failed to delete role" };
  }
}

export async function getRoleById(id: number) {
  try {
    // Check if the user has permission to view roles
    if (!(await hasPermission("ROLES:VIEW"))) {
      return { success: false, error: "Unauthorized" };
    }

    const role = await db.select().from(roles).where(eq(roles.id, id)).limit(1);

    if (role.length === 0) {
      return { success: false, error: "Role not found" };
    }

    return { success: true, data: role[0] };
  } catch (error) {
    console.error("Error fetching role:", error);
    return { success: false, error: "Failed to fetch role" };
  }
}

export async function getPaginatedRoles(
  page: number = 1,
  limit: number = 10,
  search?: string
) {
  try {
    // Check if the user has permission to view roles
    if (!(await hasPermission("ROLES:VIEW"))) {
      return { success: false, error: "Unauthorized" };
    }

    const offset = (page - 1) * limit;

    // Build the where clause for search
    const whereClause = search
      ? or(
          like(roles.name, `%${search}%`),
          like(roles.description, `%${search}%`)
        )
      : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(roles)
      .where(whereClause);

    const totalCount = totalResult.count;
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated roles
    const rolesData = await db
      .select()
      .from(roles)
      .where(whereClause)
      .orderBy(desc(roles.id))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: {
        roles: rolesData,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize: limit,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, error: "Failed to fetch roles" };
  }
}

export async function getRolePermissions(roleId: number) {
  try {
    // Check if the user has permission to view roles
    if (!(await hasPermission("ROLES:VIEW"))) {
      return { success: false, error: "Unauthorized" };
    }

    const rolePermissionsData = await db
      .select({
        permission: permissions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return {
      success: true,
      data: rolePermissionsData.map((rp) => rp.permission),
    };
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return { success: false, error: "Failed to fetch role permissions" };
  }
}

export async function updateRolePermissions(
  roleId: number,
  permissionIds: number[]
) {
  try {
    // Check if the user has permission to manage roles
    if (!(await hasPermission("ROLES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete existing role permissions
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // Insert new role permissions
    if (permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        }))
      );
    }

    revalidatePath("/admin/roles");
    revalidatePath(`/admin/roles/${roleId}/permissions`);
    return { success: true };
  } catch (error) {
    console.error("Error updating role permissions:", error);
    return { success: false, error: "Failed to update role permissions" };
  }
}
