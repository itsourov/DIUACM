import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

  // Get user with roles and permissions
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      roles: {
        select: {
          permissions: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return false;
  }

  // Check if any of the user's roles have the required permission
  return user.roles.some((role) =>
    role.permissions.some((permission) => permission.name === permissionName)
  );
}

/**
 * A higher-order function that checks if the user has any of the specified permissions
 * @param permissionNames - Array of permission names to check
 * @param redirectTo - Path to redirect to if not authorized
 */
export async function checkPermissions(
  permissionNames: string[],
  redirectTo: string = "/admin/unauthorized"
): Promise<void> {
  const session = await auth();

  // If no session, redirect to login
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Check if user is super admin - they can access everything
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (superAdminEmail && session.user.email === superAdminEmail) {
    return;
  }

  // For regular users, check if they have any of the required permissions
  const hasAnyPermission = await Promise.all(
    permissionNames.map((name) => hasPermission(name))
  ).then((results) => results.some(Boolean));

  if (!hasAnyPermission) {
    redirect(redirectTo);
  }
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
    const allPermissions = await prisma.permission.findMany({
      select: { name: true },
    });
    return allPermissions.map((permission) => permission.name);
  }

  // Get user's permissions
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      roles: {
        select: {
          permissions: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return [];
  }

  // Extract and deduplicate permission names
  const permissionNames = new Set<string>();
  user.roles.forEach((role) => {
    role.permissions.forEach((permission) => {
      permissionNames.add(permission.name);
    });
  });

  return Array.from(permissionNames);
}
