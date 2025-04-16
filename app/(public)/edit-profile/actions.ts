"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import {
  passwordSchema,
  profileFormSchema,
  type PasswordUpdateResponse,
  type ProfileFormValues,
} from "./schema";
import crypto from "crypto";

// AWS S3 imports for presigned URLs
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure S3 client
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

// Function to generate Laravel compatible bcrypt hash
async function generateLaravelCompatibleHash(
  password: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a random salt (22 characters)
    const salt = crypto.randomBytes(16).toString("base64").slice(0, 22);

    // Format the salt with Laravel's preferred prefix ($2y$12$)
    const formattedSalt = `$2y$12$${salt}`;

    import("bcryptjs").then(async ({ hash }) => {
      try {
        // Use the formatted salt to generate the hash
        const hashedPassword = await hash(password, formattedSalt);
        resolve(hashedPassword);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function updatePassword(
  data: z.infer<typeof passwordSchema>
): Promise<PasswordUpdateResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const hashedPassword = await generateLaravelCompatibleHash(
      data.newPassword
    );

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/edit-profile");
    return { success: true };
  } catch (error) {
    console.error("Password update error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, message: "Not authenticated", data: null };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, message: "User not found", data: null };
    }

    return { success: true, message: "User found", data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      message: "Failed to retrieve user data",
      data: null,
    };
  }
}

export async function getPresignedUrl() {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Create a unique filename for the image
    const fileKey = `profile-pictures/${Date.now()}-${crypto
      .randomBytes(16)
      .toString("hex")}.jpg`;

    // Create presigned URL for PUT operation
    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: "image/jpeg",
    });

    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 600,
    }); // 10 minutes expiry

    // The public URL for the image after upload
    const publicUrl = `${process.env.NEXT_PUBLIC_S3_DOMAIN}/${fileKey}`;

    return {
      success: true,
      data: {
        uploadUrl: presignedUrl,
        publicUrl: publicUrl,
      },
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return { success: false, error: "Failed to generate upload URL" };
  }
}

export async function updateProfile(values: ProfileFormValues) {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const validatedFields = profileFormSchema.parse(values);

    // Fetch current user to check against
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    // Check if username is already taken by another user
    if (validatedFields.username !== currentUser.username) {
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username: validatedFields.username },
      });

      if (existingUserByUsername) {
        return {
          success: false,
          error: { username: ["This username is already in use."] },
        };
      }
    }

    // Prepare update data
    const updateData = { ...validatedFields };

    // If password is empty string or null, remove it from update
    if (!updateData.password) {
      delete updateData.password;
    } else {
      // Hash password if it was provided
      updateData.password = await bcrypt.hash(
        updateData.password as string,
        12
      );
    }

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    revalidatePath("/edit-profile");
    revalidatePath("/programmers/[username]");

    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
