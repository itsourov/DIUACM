import { auth } from "@/lib/auth";

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

  console.log("Checking permission for:", permissionName);

  // If no session, user is not logged in
  if (!session?.user?.email) {
    return false;
  }

  // Check if user is super admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (superAdminEmail && session.user.email === superAdminEmail) {
    return true;
  } else {
    return false;
  }
}
