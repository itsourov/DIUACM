"use server";

import { hasPermission } from "@/lib/authorization";
import { db } from "@/db/drizzle";
import { userRoles, users, roles } from "@/db/schema";
import { eq, and, like, or, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRoleUsers(roleId: number) {
    try {
        // Check if the user has permission to manage roles
        if (!(await hasPermission("ROLES:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const roleUsers = await db
            .select({
                roleId: userRoles.roleId,
                userId: userRoles.userId,
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
            .from(userRoles)
            .innerJoin(users, eq(userRoles.userId, users.id))
            .where(eq(userRoles.roleId, roleId))
            .orderBy(users.name);

        return {
            success: true,
            data: roleUsers,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

export async function searchUsersForRole(
    roleId: number,
    search: string,
    limit: number = 10
) {
    try {
        // Check if the user has permission to manage roles
        if (!(await hasPermission("ROLES:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        // Get users who already have this role
        const existingRoleUsers = await db
            .select({ userId: userRoles.userId })
            .from(userRoles)
            .where(eq(userRoles.roleId, roleId));

        const existingUserIds = existingRoleUsers.map(ur => ur.userId);

        // Search for users who don't have this role
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
                        like(users.name, `%${search}%`),
                        like(users.email, `%${search}%`),
                        like(users.username, `%${search}%`),
                        like(users.studentId, `%${search}%`)
                    ),
                    existingUserIds.length > 0 ? notInArray(users.id, existingUserIds) : undefined
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

export async function assignUserToRole(roleId: number, userId: string) {
    try {
        // Check if the user has permission to manage roles
        if (!(await hasPermission("ROLES:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if role exists
        const role = await db
            .select({ id: roles.id })
            .from(roles)
            .where(eq(roles.id, roleId))
            .limit(1);

        if (role.length === 0) {
            return {
                success: false,
                error: "Role not found",
            };
        }

        // Check if user already has this role
        const existingUserRole = await db
            .select()
            .from(userRoles)
            .where(and(eq(userRoles.roleId, roleId), eq(userRoles.userId, userId)))
            .limit(1);

        if (existingUserRole.length > 0) {
            return { success: false, error: "User already has this role" };
        }

        // Assign role to user
        await db.insert(userRoles).values({
            roleId,
            userId,
        });

        // Get the assigned user with role details
        const roleUser = await db
            .select({
                roleId: userRoles.roleId,
                userId: userRoles.userId,
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
            .from(userRoles)
            .innerJoin(users, eq(userRoles.userId, users.id))
            .where(and(eq(userRoles.roleId, roleId), eq(userRoles.userId, userId)))
            .limit(1);

        revalidatePath(`/admin/roles/${roleId}/users`);

        return {
            success: true,
            data: roleUser[0],
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

export async function removeUserFromRole(roleId: number, userId: string) {
    try {
        // Check if the user has permission to manage roles
        if (!(await hasPermission("ROLES:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        await db
            .delete(userRoles)
            .where(and(eq(userRoles.roleId, roleId), eq(userRoles.userId, userId)));

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