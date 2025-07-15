"use server";

import { db } from "@/db/drizzle";
import { permissions } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, or, like, count, desc } from "drizzle-orm";
import {
    permissionFormSchema,
    permissionUpdateFormSchema,
    type PermissionFormValues,
    type PermissionUpdateFormValues,
} from "./schemas/permission";
import { hasPermission } from "@/lib/authorization";

export async function createPermission(values: PermissionFormValues) {
    try {
        // Check if the user has permission to manage permissions
        if (!(await hasPermission("PERMISSIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const validatedFields = permissionFormSchema.parse(values);

        // Check if permission name is already taken
        const existingPermission = await db
            .select()
            .from(permissions)
            .where(eq(permissions.name, validatedFields.name))
            .limit(1);

        if (existingPermission.length > 0) {
            return {
                success: false,
                error: { name: ["This permission name is already in use."] },
            };
        }

        const [newPermission] = await db
            .insert(permissions)
            .values({
                name: validatedFields.name,
                description: validatedFields.description,
            })
            .$returningId();

        revalidatePath("/admin/permissions");
        return { success: true, data: newPermission };
    } catch (error) {
        console.error("Error creating permission:", error);
        return { success: false, error: "Failed to create permission" };
    }
}

export async function updatePermission(values: PermissionUpdateFormValues) {
    try {
        // Check if the user has permission to manage permissions
        if (!(await hasPermission("PERMISSIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const validatedFields = permissionUpdateFormSchema.parse(values);

        // Check if permission name is already taken by another permission
        const existingPermission = await db
            .select()
            .from(permissions)
            .where(eq(permissions.name, validatedFields.name))
            .limit(1);

        if (existingPermission.length > 0 && existingPermission[0].id !== validatedFields.id) {
            return {
                success: false,
                error: { name: ["This permission name is already in use."] },
            };
        }

        await db
            .update(permissions)
            .set({
                name: validatedFields.name,
                description: validatedFields.description,
            })
            .where(eq(permissions.id, validatedFields.id));

        revalidatePath("/admin/permissions");
        revalidatePath(`/admin/permissions/${validatedFields.id}/edit`);
        return { success: true };
    } catch (error) {
        console.error("Error updating permission:", error);
        return { success: false, error: "Failed to update permission" };
    }
}

export async function deletePermission(id: number) {
    try {
        // Check if the user has permission to manage permissions
        if (!(await hasPermission("PERMISSIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        await db.delete(permissions).where(eq(permissions.id, id));

        revalidatePath("/admin/permissions");
        return { success: true };
    } catch (error) {
        console.error("Error deleting permission:", error);
        return { success: false, error: "Failed to delete permission" };
    }
}

export async function getPermissionById(id: number) {
    try {
        // Check if the user has permission to view permissions
        if (!(await hasPermission("PERMISSIONS:VIEW"))) {
            return { success: false, error: "Unauthorized" };
        }

        const permission = await db
            .select()
            .from(permissions)
            .where(eq(permissions.id, id))
            .limit(1);

        if (permission.length === 0) {
            return { success: false, error: "Permission not found" };
        }

        return { success: true, data: permission[0] };
    } catch (error) {
        console.error("Error fetching permission:", error);
        return { success: false, error: "Failed to fetch permission" };
    }
}

export async function getPaginatedPermissions(
    page: number = 1,
    limit: number = 10,
    search?: string
) {
    try {
        // Check if the user has permission to view permissions
        if (!(await hasPermission("PERMISSIONS:VIEW"))) {
            return { success: false, error: "Unauthorized" };
        }

        const offset = (page - 1) * limit;

        // Build the where clause for search
        const whereClause = search
            ? or(
                like(permissions.name, `%${search}%`),
                like(permissions.description, `%${search}%`)
            )
            : undefined;

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
            .orderBy(desc(permissions.id))
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
        console.error("Error fetching permissions:", error);
        return { success: false, error: "Failed to fetch permissions" };
    }
}

export async function getAllPermissions() {
    try {
        // Check if the user has permission to view permissions
        if (!(await hasPermission("PERMISSIONS:VIEW"))) {
            return { success: false, error: "Unauthorized" };
        }

        const permissionsData = await db
            .select()
            .from(permissions)
            .orderBy(permissions.name);

        return {
            success: true,
            data: permissionsData,
        };
    } catch (error) {
        console.error("Error fetching all permissions:", error);
        return { success: false, error: "Failed to fetch permissions" };
    }
} 