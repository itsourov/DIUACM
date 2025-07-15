import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { users, roles, permissions, userRoles, rolePermissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Define permission types
export type Permission = {
  id: string;
  name: string;
  description: string | null;
};

/**
 * Checks if the current user has the specified permission
 * @param permissionName - The permission name to check for
 * @returns Promise<boolean> - Whether the user has the permission
 */
export async function hasPermission(permissionName: string): Promise<boolean> {
  const session = await auth();

  // If no session, user is not logged in
  if (!session?.user?.email) {
    return false;
  }

  // Check if user is super admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (superAdminEmail && session.user.email === superAdminEmail) {
    return true;
  }

  // Check if user has the specified permission through their roles
  const userPermission = await db
    .select({ permissionName: permissions.name })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(users.email, session.user.email),
        eq(permissions.name, permissionName)
      )
    )
    .limit(1);

  return userPermission.length > 0;
}

/**
 * Get user permissions
 * @returns An array of permission names the current user has
 */
export async function getUserPermissions(): Promise<string[]> {
  const session = await auth();

  // If no session, user is not logged in
  if (!session?.user?.email) {
    return [];
  }

  // Super admin has all permissions
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (superAdminEmail && session.user.email === superAdminEmail) {
    // Return all available permissions for super admin
    const allPermissions = await db
      .select({ name: permissions.name })
      .from(permissions);
    return allPermissions.map((permission) => permission.name);
  }

  // Get user's permissions through their roles
  const userPermissions = await db
    .select({ permissionName: permissions.name })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(users.email, session.user.email));

  // Extract and deduplicate permission names
  const permissionNames = new Set<string>();
  userPermissions.forEach((result) => {
    permissionNames.add(result.permissionName);
  });

  return Array.from(permissionNames);
}
