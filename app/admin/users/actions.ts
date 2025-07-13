"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { userFormSchema, type UserFormValues } from "./schemas/user";
import { eq, and, ne, count, asc, sql } from "drizzle-orm";
import { hasPermission } from "@/lib/authorization";

// Create a new user
export async function createUser(values: UserFormValues) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = userFormSchema.parse(values);

    // Check if user with same email already exists (case insensitive)
    const existingUser = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${validatedFields.email})`)
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        error: "A user with this email already exists.",
      };
    }

    // Check if username already exists (case insensitive)
    if (validatedFields.username) {
      const existingUsername = await db
        .select()
        .from(users)
        .where(
          sql`LOWER(${users.username}) = LOWER(${validatedFields.username})`
        )
        .limit(1);

      if (existingUsername.length > 0) {
        return {
          success: false,
          error: "A user with this username already exists.",
        };
      }
    }

    // Check if student ID is provided and already exists (case insensitive)
    if (validatedFields.studentId) {
      const existingStudentId = await db
        .select()
        .from(users)
        .where(
          sql`LOWER(${users.studentId}) = LOWER(${validatedFields.studentId})`
        )
        .limit(1);

      if (existingStudentId.length > 0) {
        return {
          success: false,
          error: "A user with this student ID already exists.",
        };
      }
    }

    // Generate UUID for the new user
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name: validatedFields.name,
      email: validatedFields.email,
      username: validatedFields.username || null,
      studentId: validatedFields.studentId || null,
      gender: validatedFields.gender || null,
      phone: validatedFields.phone || null,
      department: validatedFields.department || null,
      startingSemester: validatedFields.startingSemester || null,
      codeforcesHandle: validatedFields.codeforcesHandle || null,
      atcoderHandle: validatedFields.atcoderHandle || null,
      vjudgeHandle: validatedFields.vjudgeHandle || null,
      maxCfRating: validatedFields.maxCfRating
        ? parseInt(validatedFields.maxCfRating)
        : null,
    });

    // Fetch the created user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error creating user:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Update an existing user
export async function updateUser(id: string, values: UserFormValues) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = userFormSchema.parse(values);

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return {
        success: false,
        error: "User not found.",
      };
    }

    // Check if another user with the same email exists (except this one)
    const duplicateEmail = await db
      .select()
      .from(users)
      .where(
        and(
          sql`LOWER(${users.email}) = LOWER(${validatedFields.email})`,
          ne(users.id, id)
        )
      )
      .limit(1);

    if (duplicateEmail.length > 0) {
      return {
        success: false,
        error: "Another user with this email already exists.",
      };
    }

    // Check if another user with the same username exists (except this one)
    if (validatedFields.username) {
      const duplicateUsername = await db
        .select()
        .from(users)
        .where(
          and(
            sql`LOWER(${users.username}) = LOWER(${validatedFields.username})`,
            ne(users.id, id)
          )
        )
        .limit(1);

      if (duplicateUsername.length > 0) {
        return {
          success: false,
          error: "Another user with this username already exists.",
        };
      }
    }

    // Check if student ID is provided and another user with the same student ID exists (except this one)
    if (validatedFields.studentId) {
      const duplicateStudentId = await db
        .select()
        .from(users)
        .where(
          and(
            sql`LOWER(${users.studentId}) = LOWER(${validatedFields.studentId})`,
            ne(users.id, id)
          )
        )
        .limit(1);

      if (duplicateStudentId.length > 0) {
        return {
          success: false,
          error: "Another user with this student ID already exists.",
        };
      }
    }

    await db
      .update(users)
      .set({
        name: validatedFields.name,
        email: validatedFields.email,
        username: validatedFields.username || null,
        studentId: validatedFields.studentId || null,
        gender: validatedFields.gender || null,
        phone: validatedFields.phone || null,
        department: validatedFields.department || null,
        startingSemester: validatedFields.startingSemester || null,
        codeforcesHandle: validatedFields.codeforcesHandle || null,
        atcoderHandle: validatedFields.atcoderHandle || null,
        vjudgeHandle: validatedFields.vjudgeHandle || null,
        maxCfRating: validatedFields.maxCfRating
          ? parseInt(validatedFields.maxCfRating)
          : null,
      })
      .where(eq(users.id, id));

    // Fetch the updated user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}/edit`);
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error updating user:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return {
        success: false,
        error: "User not found.",
      };
    }

    await db.delete(users).where(eq(users.id, id));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get a single user by ID
export async function getUser(id: string) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (user.length === 0) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user[0] };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get paginated users with optional search
export async function getPaginatedUsers(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * pageSize;

    // Build where conditions
    const whereCondition = search
      ? sql`(
                LOWER(${users.name}) LIKE LOWER(${"%" + search + "%"}) OR 
                LOWER(${users.email}) LIKE LOWER(${"%" + search + "%"}) OR 
                LOWER(${users.username}) LIKE LOWER(${"%" + search + "%"}) OR 
                LOWER(${users.studentId}) LIKE LOWER(${"%" + search + "%"})
            )`
      : undefined;

    // Execute the queries
    const [usersResult, totalCountResult] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username,
          studentId: users.studentId,
          image: users.image,
          emailVerified: users.emailVerified,
          gender: users.gender,
          phone: users.phone,
          department: users.department,
          startingSemester: users.startingSemester,
          codeforcesHandle: users.codeforcesHandle,
          atcoderHandle: users.atcoderHandle,
          vjudgeHandle: users.vjudgeHandle,
          maxCfRating: users.maxCfRating,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereCondition)
        .orderBy(asc(users.name))
        .limit(pageSize)
        .offset(skip),

      db.select({ count: count() }).from(users).where(whereCondition),
    ]);

    // Calculate pagination info
    const totalCount = totalCountResult[0].count;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        users: usersResult,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get all users for migration dropdown
export async function getAllUsers() {
  try {
    // Check if the user has permission to manage users
    if (!(await hasPermission("USERS:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .orderBy(asc(users.name));

    return {
      success: true,
      data: allUsers,
    };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
