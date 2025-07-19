"use server";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Schema for password change
const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export async function changePassword(
  values: ChangePasswordValues
): Promise<ActionResult> {
  try {
    // Validate the session
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Validate the input
    const validatedData = changePasswordSchema.parse(values);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update the password in the database
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email));

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Change password error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "Failed to change password. Please try again.",
    };
  }
}
